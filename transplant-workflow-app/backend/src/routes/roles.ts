import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { createAuditLog } from '../middleware/audit';

const router = Router();

router.use(requireAuth, loadUser);

// Get all roles
router.get('/', requirePermission('view:roles'), asyncHandler(async (req, res) => {
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
  });

  res.json({ roles });
}));

// Create role
router.post('/', requirePermission('admin:manage-roles'), asyncHandler(async (req, res) => {
  const { name, description, permissions } = req.body;

  const role = await prisma.role.create({
    data: {
      name,
      description,
      permissions,
    },
  });

  await createAuditLog(req.user!.id, 'CREATE', 'Role', role.id, null, req);

  res.status(201).json({ role });
}));

// Update role
router.patch('/:id', requirePermission('admin:manage-roles'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const role = await prisma.role.update({
    where: { id },
    data: updates,
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'Role', id, updates, req);

  res.json({ role });
}));

// Delete role
router.delete('/:id', requirePermission('admin:manage-roles'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if any users have this role
  const usersWithRole = await prisma.user.count({
    where: { roleId: id },
  });

  if (usersWithRole > 0) {
    return res.status(400).json({ error: 'Cannot delete role with assigned users' });
  }

  await prisma.role.delete({
    where: { id },
  });

  await createAuditLog(req.user!.id, 'DELETE', 'Role', id, null, req);

  res.json({ message: 'Role deleted successfully' });
}));

export default router;
