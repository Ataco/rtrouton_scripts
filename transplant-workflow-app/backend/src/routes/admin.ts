import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { createAuditLog } from '../middleware/audit';

const router = Router();

router.use(requireAuth, loadUser);

// Get all audit logs
router.get('/audit-logs', requirePermission('admin:view-audit'), asyncHandler(async (req, res) => {
  const { userId, resource, startDate, endDate, limit = '100' } = req.query;

  const where: any = {};
  if (userId) where.userId = userId;
  if (resource) where.resource = resource;
  if (startDate && endDate) {
    where.timestamp = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: parseInt(limit as string),
  });

  res.json({ logs });
}));

// Get all users
router.get('/users', requirePermission('admin:manage-users'), asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      role: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ users });
}));

// Update user role
router.patch('/users/:id/role', requirePermission('admin:manage-users'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { roleId },
    include: { role: true },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'User', id, { roleId }, req);

  res.json({ user });
}));

// Deactivate user
router.patch('/users/:id/deactivate', requirePermission('admin:manage-users'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'User', id, { isActive: false }, req);

  res.json({ user });
}));

// Reassign case
router.post('/reassign-case', requirePermission('admin:reassign-cases'), asyncHandler(async (req, res) => {
  const { organMatchId, newCoordinatorId } = req.body;

  const organMatch = await prisma.organMatch.update({
    where: { id: organMatchId },
    data: { coordinatorId: newCoordinatorId },
    include: {
      assignedCoordinator: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'OrganMatch', organMatchId, { coordinatorId: newCoordinatorId }, req);

  res.json({ organMatch });
}));

// Get system configuration
router.get('/config', requirePermission('admin:view-config'), asyncHandler(async (req, res) => {
  const { category } = req.query;

  const where: any = {};
  if (category) where.category = category;

  const configs = await prisma.systemConfig.findMany({
    where,
  });

  res.json({ configs });
}));

// Update system configuration
router.patch('/config/:key', requirePermission('admin:manage-config'), asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value, category } = req.body;

  const config = await prisma.systemConfig.upsert({
    where: { key },
    update: { value, category },
    create: { key, value, category },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'SystemConfig', key, { value, category }, req);

  res.json({ config });
}));

export default router;
