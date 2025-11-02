import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { createAuditLog } from '../middleware/audit';
import { io } from '../index';

const router = Router();

router.use(requireAuth, loadUser);

// Submit reporting form
router.post('/', requirePermission('submit:reports'), asyncHandler(async (req, res) => {
  const { organMatchId, formType, formData } = req.body;

  const report = await prisma.reportingRecord.create({
    data: {
      organMatchId,
      formType,
      formData,
      submittedBy: req.user!.id,
    },
  });

  // Get organ match to notify case room
  const organMatch = await prisma.organMatch.findUnique({
    where: { id: organMatchId },
    select: { donorCaseId: true },
  });

  await createAuditLog(req.user!.id, 'CREATE', 'ReportingRecord', report.id, null, req);

  // Notify via socket and chat
  if (organMatch) {
    io.to(`case-${organMatch.donorCaseId}`).emit('report:submitted', {
      reportId: report.id,
      formType,
      organMatchId,
    });

    // Auto-summary to chat
    await prisma.chatMessage.create({
      data: {
        donorCaseId: organMatch.donorCaseId,
        authorId: req.user!.id,
        content: `📋 ${formType} report submitted`,
        messageType: 'AUTO_SUMMARY',
      },
    });
  }

  res.status(201).json({ report });
}));

// Get reports by organ match
router.get('/organ-match/:organMatchId', requirePermission('view:reports'), asyncHandler(async (req, res) => {
  const { organMatchId } = req.params;

  const reports = await prisma.reportingRecord.findMany({
    where: { organMatchId },
    orderBy: { submittedAt: 'desc' },
  });

  res.json({ reports });
}));

// Get reports by type
router.get('/type/:formType', requirePermission('view:reports'), asyncHandler(async (req, res) => {
  const { formType } = req.params;
  const { startDate, endDate } = req.query;

  const where: any = { formType };
  if (startDate && endDate) {
    where.submittedAt = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  const reports = await prisma.reportingRecord.findMany({
    where,
    include: {
      organMatch: {
        include: {
          donorCase: true,
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
  });

  res.json({ reports });
}));

// Get single report
router.get('/:id', requirePermission('view:reports'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await prisma.reportingRecord.findUnique({
    where: { id },
    include: {
      organMatch: {
        include: {
          donorCase: true,
          assignedCoordinator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  });

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  await createAuditLog(req.user!.id, 'VIEW', 'ReportingRecord', id, null, req);

  res.json({ report });
}));

export default router;
