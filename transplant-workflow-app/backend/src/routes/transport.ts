import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { createAuditLog } from '../middleware/audit';
import { io } from '../index';
import axios from 'axios';

const router = Router();

router.use(requireAuth, loadUser);

// Create/update transport record
router.post('/', requirePermission('manage:transport'), asyncHandler(async (req, res) => {
  const {
    organMatchId,
    tailNumber,
    carrier,
    departureAirport,
    arrivalAirport,
    departureTime,
    estimatedArrival,
  } = req.body;

  const transport = await prisma.transportRecord.create({
    data: {
      organMatchId,
      tailNumber,
      carrier,
      departureAirport,
      arrivalAirport,
      departureTime: departureTime ? new Date(departureTime) : undefined,
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
      trackingStatus: 'SCHEDULED',
    },
  });

  // Get organ match to notify case room
  const organMatch = await prisma.organMatch.findUnique({
    where: { id: organMatchId },
    select: { donorCaseId: true },
  });

  await createAuditLog(req.user!.id, 'CREATE', 'TransportRecord', transport.id, null, req);

  if (organMatch) {
    io.to(`case-${organMatch.donorCaseId}`).emit('transport:created', transport);

    // Auto-summary to chat
    await prisma.chatMessage.create({
      data: {
        donorCaseId: organMatch.donorCaseId,
        authorId: req.user!.id,
        content: `✈️ Transport scheduled: ${carrier || 'N/A'} ${tailNumber || 'N/A'}`,
        messageType: 'AUTO_SUMMARY',
      },
    });
  }

  res.status(201).json({ transport });
}));

// Update transport
router.patch('/:id', requirePermission('manage:transport'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Convert date strings to Date objects
  if (updates.departureTime) updates.departureTime = new Date(updates.departureTime);
  if (updates.arrivalTime) updates.arrivalTime = new Date(updates.arrivalTime);
  if (updates.estimatedArrival) updates.estimatedArrival = new Date(updates.estimatedArrival);
  if (updates.actualArrival) updates.actualArrival = new Date(updates.actualArrival);

  const transport = await prisma.transportRecord.update({
    where: { id },
    data: updates,
  });

  const organMatch = await prisma.organMatch.findUnique({
    where: { id: transport.organMatchId },
    select: { donorCaseId: true },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'TransportRecord', id, updates, req);

  if (organMatch) {
    io.to(`case-${organMatch.donorCaseId}`).emit('transport:updated', transport);

    // Send ETA notification
    if (updates.estimatedArrival) {
      io.to(`case-${organMatch.donorCaseId}`).emit('transport:eta-update', {
        transportId: id,
        eta: updates.estimatedArrival,
      });
    }
  }

  res.json({ transport });
}));

// Track flight (fetch from external API)
router.get('/:id/track', requirePermission('view:transport'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transport = await prisma.transportRecord.findUnique({
    where: { id },
  });

  if (!transport || !transport.tailNumber) {
    return res.status(404).json({ error: 'Transport record or tail number not found' });
  }

  try {
    // Example: Using AviationStack API (replace with your actual API)
    const response = await axios.get(process.env.FLIGHT_API_URL!, {
      params: {
        access_key: process.env.FLIGHT_API_KEY,
        flight_iata: transport.tailNumber,
      },
    });

    const flightData = response.data;

    // Update transport with tracking data
    if (flightData && flightData.data && flightData.data.length > 0) {
      const flight = flightData.data[0];

      await prisma.transportRecord.update({
        where: { id },
        data: {
          coordinates: {
            lat: flight.live?.latitude,
            lng: flight.live?.longitude,
          },
          trackingStatus: flight.flight_status?.toUpperCase() || 'SCHEDULED',
        },
      });
    }

    res.json({ tracking: flightData });
  } catch (error) {
    console.error('Flight tracking error:', error);
    res.status(500).json({ error: 'Failed to fetch flight tracking data' });
  }
}));

// Get transport by organ match
router.get('/organ-match/:organMatchId', requirePermission('view:transport'), asyncHandler(async (req, res) => {
  const { organMatchId } = req.params;

  const transports = await prisma.transportRecord.findMany({
    where: { organMatchId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ transports });
}));

export default router;
