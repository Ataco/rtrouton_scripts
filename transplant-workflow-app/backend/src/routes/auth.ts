import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/rbac';

const router = Router();

// Register/login - create or update user in our database
router.post('/sync-user', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { email, firstName, lastName } = req.body;
  const auth0Id = req.auth!.sub;

  let user = await prisma.user.findUnique({
    where: { auth0Id },
    include: { role: true },
  });

  if (!user) {
    // Get or create default role
    let defaultRole = await prisma.role.findUnique({
      where: { name: 'User' },
    });

    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: {
          name: 'User',
          description: 'Default user role',
          permissions: ['view:cases', 'view:reports'],
        },
      });
    }

    user = await prisma.user.create({
      data: {
        auth0Id,
        email,
        firstName,
        lastName,
        roleId: defaultRole.id,
      },
      include: { role: true },
    });
  } else {
    // Update last login
    user = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
      include: { role: true },
    });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
}));

// Get current user
router.get('/me', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { auth0Id: req.auth!.sub },
    include: { role: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
}));

export default router;
