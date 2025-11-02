import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { createAuditLog } from '../middleware/audit';
import { io } from '../index';
import { calculateRemainingTime } from '../services/preservationService';

const router = Router();

router.use(requireAuth, loadUser);

// Start preservation segment
router.post('/segments', requirePermission('manage:preservation'), asyncHandler(async (req, res) => {
  const { organMatchId, phase, modality, isOxygenated, temperature } = req.body;

  const segment = await prisma.preservationSegment.create({
    data: {
      organMatchId,
      phase,
      modality,
      isOxygenated,
      temperature,
      startTime: new Date(),
    },
  });

  const organMatch = await prisma.organMatch.findUnique({
    where: { id: organMatchId },
    select: { donorCaseId: true, organType: true },
  });

  await createAuditLog(req.user!.id, 'CREATE', 'PreservationSegment', segment.id, null, req);

  if (organMatch) {
    io.to(`case-${organMatch.donorCaseId}`).emit('preservation:segment-started', segment);

    // Auto-summary to chat
    await prisma.chatMessage.create({
      data: {
        donorCaseId: organMatch.donorCaseId,
        authorId: req.user!.id,
        content: `🧊 ${phase} preservation started: ${modality}`,
        messageType: 'AUTO_SUMMARY',
      },
    });

    // Calculate and notify remaining time
    const remaining = await calculateRemainingTime(organMatchId);
    if (remaining && remaining.warning) {
      io.to(`case-${organMatch.donorCaseId}`).emit('preservation:time-warning', remaining);
    }
  }

  res.status(201).json({ segment });
}));

// End preservation segment
router.patch('/segments/:id/end', requirePermission('manage:preservation'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const segment = await prisma.preservationSegment.update({
    where: { id },
    data: { endTime: new Date() },
  });

  const organMatch = await prisma.organMatch.findUnique({
    where: { id: segment.organMatchId },
    select: { donorCaseId: true },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'PreservationSegment', id, { endTime: new Date() }, req);

  if (organMatch) {
    io.to(`case-${organMatch.donorCaseId}`).emit('preservation:segment-ended', segment);
  }

  res.json({ segment });
}));

// Get segments by organ match
router.get('/organ-match/:organMatchId', requirePermission('view:preservation'), asyncHandler(async (req, res) => {
  const { organMatchId } = req.params;

  const segments = await prisma.preservationSegment.findMany({
    where: { organMatchId },
    orderBy: { startTime: 'asc' },
  });

  res.json({ segments });
}));

// Get preservation tolerances
router.get('/tolerances', requirePermission('view:preservation'), asyncHandler(async (req, res) => {
  const tolerances = await prisma.preservationTolerance.findMany({
    where: { isActive: true },
  });

  res.json({ tolerances });
}));

// Update preservation tolerance (Admin only)
router.patch('/tolerances/:id', requirePermission('admin:system'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { maxColdTime, maxWarmTime, description } = req.body;

  const tolerance = await prisma.preservationTolerance.update({
    where: { id },
    data: { maxColdTime, maxWarmTime, description },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'PreservationTolerance', id, req.body, req);

  res.json({ tolerance });
}));

// Create preservation tolerance (Admin only)
router.post('/tolerances', requirePermission('admin:system'), asyncHandler(async (req, res) => {
  const { organType, modality, maxColdTime, maxWarmTime, description } = req.body;

  const tolerance = await prisma.preservationTolerance.create({
    data: {
      organType,
      modality,
      maxColdTime,
      maxWarmTime,
      description,
    },
  });

  await createAuditLog(req.user!.id, 'CREATE', 'PreservationTolerance', tolerance.id, null, req);

  res.status(201).json({ tolerance });
}));

// Get remaining time for organ
router.get('/remaining-time/:organMatchId', requirePermission('view:preservation'), asyncHandler(async (req, res) => {
  const { organMatchId } = req.params;

  const remaining = await calculateRemainingTime(organMatchId);

  res.json({ remaining });
}));

export default router;
