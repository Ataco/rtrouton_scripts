import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission, requireRole } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { createAuditLog } from '../middleware/audit';

const router = Router();

router.use(requireAuth, loadUser);

// Create surgeon note
router.post('/', requireRole('Surgeon', 'Physician'), asyncHandler(async (req, res) => {
  const { organMatchId, content, isPrivate } = req.body;

  const note = await prisma.surgeonNote.create({
    data: {
      organMatchId,
      authorId: req.user!.id,
      content,
      isPrivate: isPrivate || false,
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  await createAuditLog(req.user!.id, 'CREATE', 'SurgeonNote', note.id, null, req);

  res.status(201).json({ note });
}));

// Update surgeon note
router.patch('/:id', requireRole('Surgeon', 'Physician'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, isPrivate } = req.body;

  // Verify ownership
  const existing = await prisma.surgeonNote.findUnique({
    where: { id },
  });

  if (!existing || existing.authorId !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized to edit this note' });
  }

  const note = await prisma.surgeonNote.update({
    where: { id },
    data: { content, isPrivate },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'SurgeonNote', id, { content, isPrivate }, req);

  res.json({ note });
}));

// Get notes by organ match
router.get('/organ-match/:organMatchId', requirePermission('view:surgeon-notes'), asyncHandler(async (req, res) => {
  const { organMatchId } = req.params;

  // Physicians/surgeons see all notes, others see only non-private
  const where: any = { organMatchId };
  if (req.user!.role.name !== 'Surgeon' && req.user!.role.name !== 'Physician') {
    where.isPrivate = false;
  }

  const notes = await prisma.surgeonNote.findMany({
    where,
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ notes });
}));

// Get all notes (Admin view)
router.get('/all', requirePermission('admin:view-all-notes'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where: any = {};
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  const notes = await prisma.surgeonNote.findMany({
    where,
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      organMatch: {
        include: {
          donorCase: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ notes });
}));

export default router;
