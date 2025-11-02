import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { ReportGenerationService } from '../services/reportGenerationService';

const router = Router();

router.use(requireAuth, loadUser);

// Generate comprehensive case report
router.get(
  '/case/:donorCaseId',
  requirePermission('export:reports'),
  asyncHandler(async (req, res) => {
    const { donorCaseId } = req.params;

    const report = await ReportGenerationService.generateCaseReport(donorCaseId);

    res.json({ report });
  })
);

// Generate organ-specific report
router.get(
  '/organ/:organMatchId',
  requirePermission('export:reports'),
  asyncHandler(async (req, res) => {
    const { organMatchId } = req.params;

    const report = await ReportGenerationService.generateOrganReport(organMatchId);

    res.json({ report });
  })
);

// Generate daily summary
router.get(
  '/daily-summary',
  requirePermission('export:reports'),
  asyncHandler(async (req, res) => {
    const { date } = req.query;
    const reportDate = date ? new Date(date as string) : new Date();

    const report = await ReportGenerationService.generateDailySummary(reportDate);

    res.json({ report });
  })
);

// Generate analytics report
router.get(
  '/analytics-report',
  requirePermission('export:reports'),
  asyncHandler(async (req, res) => {
    const { startDate, endDate, organType } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const report = await ReportGenerationService.generateAnalyticsReport(
      start,
      end,
      organType as string
    );

    res.json({ report });
  })
);

export default router;
