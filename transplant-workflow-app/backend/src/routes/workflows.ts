import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { createAuditLog } from '../middleware/audit';

const router = Router();

router.use(requireAuth, loadUser);

// Create workflow template
router.post('/templates', requirePermission('admin:workflows'), asyncHandler(async (req, res) => {
  const { name, type, organType, stages } = req.body;

  const template = await prisma.workflowTemplate.create({
    data: {
      name,
      type,
      organType,
      stages,
      createdById: req.user!.id,
    },
  });

  await createAuditLog(req.user!.id, 'CREATE', 'WorkflowTemplate', template.id, null, req);

  res.status(201).json({ template });
}));

// Get all workflow templates
router.get('/templates', requirePermission('view:workflows'), asyncHandler(async (req, res) => {
  const { type, organType } = req.query;

  const where: any = { isActive: true };
  if (type) where.type = type;
  if (organType) where.organType = organType;

  const templates = await prisma.workflowTemplate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ templates });
}));

// Update workflow template
router.patch('/templates/:id', requirePermission('admin:workflows'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const template = await prisma.workflowTemplate.update({
    where: { id },
    data: updates,
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'WorkflowTemplate', id, updates, req);

  res.json({ template });
}));

// Initialize workflow for organ match
router.post('/progress', requirePermission('manage:workflows'), asyncHandler(async (req, res) => {
  const { organMatchId, templateId } = req.body;

  const template = await prisma.workflowTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const stages = template.stages as any[];
  const firstStage = stages[0]?.id || 'START';

  const progress = await prisma.workflowProgress.create({
    data: {
      organMatchId,
      currentStage: firstStage,
      completedStages: [],
      stageData: {},
    },
  });

  await createAuditLog(req.user!.id, 'CREATE', 'WorkflowProgress', progress.id, null, req);

  res.status(201).json({ progress });
}));

// Update workflow progress
router.patch('/progress/:id', requirePermission('manage:workflows'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currentStage, completedStages, stageData } = req.body;

  const progress = await prisma.workflowProgress.update({
    where: { id },
    data: {
      currentStage,
      completedStages,
      stageData,
    },
  });

  await createAuditLog(req.user!.id, 'UPDATE', 'WorkflowProgress', id, req.body, req);

  res.json({ progress });
}));

// Get workflow progress by organ match
router.get('/progress/organ-match/:organMatchId', requirePermission('view:workflows'), asyncHandler(async (req, res) => {
  const { organMatchId } = req.params;

  const progress = await prisma.workflowProgress.findMany({
    where: { organMatchId },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ progress });
}));

export default router;
