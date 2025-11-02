import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { createAuditLog } from '../middleware/audit';

const router = Router();

router.use(requireAuth, loadUser);

// Get all donor cases
router.get('/', requirePermission('view:cases'), asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { donorId: { contains: search as string, mode: 'insensitive' } },
      { donorHospital: { contains: search as string, mode: 'insensitive' } },
      { donorOPO: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const cases = await prisma.donorCase.findMany({
    where,
    include: {
      organMatches: {
        include: {
          assignedCoordinator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ cases });
}));

// Get single donor case
router.get('/:id', requirePermission('view:cases'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const donorCase = await prisma.donorCase.findUnique({
    where: { id },
    include: {
      organMatches: {
        include: {
          assignedCoordinator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          analytics: true,
        },
      },
      donorSummaries: true,
      chatMessages: {
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!donorCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  res.json({ case: donorCase });
}));

// Create new donor case
router.post('/', requirePermission('create:cases'), asyncHandler(async (req, res) => {
  const { donorId, donorHospital, donorOPO, donorAge, donorBloodType, causeOfDeath } = req.body;

  // Check if donor ID already exists
  const existing = await prisma.donorCase.findUnique({
    where: { donorId },
  });

  if (existing) {
    return res.status(400).json({ error: 'Donor ID already exists' });
  }

  const donorCase = await prisma.donorCase.create({
    data: {
      donorId,
      donorHospital,
      donorOPO,
      donorAge,
      donorBloodType,
      causeOfDeath,
    },
  });

  await createAuditLog(req.user!.id, 'CREATE', 'DonorCase', donorCase.id, null, req);

  res.status(201).json({ case: donorCase });
}));

// Update donor case
router.patch('/:id', requirePermission('update:cases'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const donorCase = await prisma.donorCase.update({
    where: { id },
    data: updates,
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'DonorCase', id, updates, req);

  res.json({ case: donorCase });
}));

// Get cases for shift start (unclaimed from yesterday)
router.get('/shift/unclaimed', requirePermission('view:cases'), asyncHandler(async (req, res) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const cases = await prisma.donorCase.findMany({
    where: {
      createdAt: { gte: yesterday },
      status: 'ACTIVE',
      organMatches: {
        some: {
          coordinatorId: null,
        },
      },
    },
    include: {
      organMatches: {
        where: { coordinatorId: null },
      },
    },
  });

  res.json({ cases });
}));

export default router;
