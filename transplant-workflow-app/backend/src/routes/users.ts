import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(requireAuth, loadUser);

// Get all users (for coordinator dropdowns, etc.)
router.get('/', requirePermission('view:users'), asyncHandler(async (req, res) => {
  const { role } = req.query;

  const where: any = { isActive: true };
  if (role) {
    where.role = { name: role };
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { lastName: 'asc' },
  });

  res.json({ users });
}));

// Get user by ID
router.get('/:id', requirePermission('view:users'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
}));

export default router;
