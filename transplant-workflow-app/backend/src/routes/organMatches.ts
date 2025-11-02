import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { createAuditLog } from '../middleware/audit';
import { io } from '../index';

const router = Router();

router.use(requireAuth, loadUser);

// Create organ match
router.post('/', requirePermission('create:organ-matches'), asyncHandler(async (req, res) => {
  const { donorCaseId, matchId, organType, recipientHospital, recipientSurgeon, coordinatorId } = req.body;

  const organMatch = await prisma.organMatch.create({
    data: {
      donorCaseId,
      matchId,
      organType,
      recipientHospital,
      recipientSurgeon,
      coordinatorId,
    },
    include: {
      assignedCoordinator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  // Create analytics record
  await prisma.organAnalytics.create({
    data: {
      organMatchId: organMatch.id,
    },
  });

  await createAuditLog(req.user!.id, 'CREATE', 'OrganMatch', organMatch.id, null, req);

  // Notify via socket
  io.to(`case-${donorCaseId}`).emit('organ-match:created', organMatch);

  res.status(201).json({ organMatch });
}));

// Update organ match
router.patch('/:id', requirePermission('update:organ-matches'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const organMatch = await prisma.organMatch.update({
    where: { id },
    data: updates,
    include: {
      assignedCoordinator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'OrganMatch', id, updates, req);

  // Notify via socket
  io.to(`case-${organMatch.donorCaseId}`).emit('organ-match:updated', organMatch);

  res.json({ organMatch });
}));

// Assign coordinator
router.post('/:id/assign', requirePermission('assign:coordinator'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { coordinatorId } = req.body;

  const organMatch = await prisma.organMatch.update({
    where: { id },
    data: { coordinatorId },
    include: {
      assignedCoordinator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'OrganMatch', id, { coordinatorId }, req);

  // Notify via socket
  io.to(`case-${organMatch.donorCaseId}`).emit('coordinator:assigned', {
    organMatchId: id,
    coordinator: organMatch.assignedCoordinator,
  });

  res.json({ organMatch });
}));

// Get matches by coordinator
router.get('/my-assignments', requirePermission('view:organ-matches'), asyncHandler(async (req, res) => {
  const matches = await prisma.organMatch.findMany({
    where: {
      coordinatorId: req.user!.id,
      status: { in: ['OFFERED', 'ACCEPTED'] },
    },
    include: {
      donorCase: true,
      analytics: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ matches });
}));

export default router;
