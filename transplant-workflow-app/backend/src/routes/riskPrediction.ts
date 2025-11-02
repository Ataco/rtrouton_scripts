import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';
import { RiskPredictionService } from '../services/riskPredictionService';

const router = Router();

router.use(requireAuth, loadUser);

// Predict transplant success for organ match
router.get(
  '/organ-match/:organMatchId',
  requirePermission('view:analytics'),
  asyncHandler(async (req, res) => {
    const { organMatchId } = req.params;

    const prediction = await RiskPredictionService.predictTransplantSuccess(organMatchId);

    res.json({ prediction });
  })
);

// Recommend preservation method
router.post(
  '/recommend-preservation',
  requirePermission('view:analytics'),
  asyncHandler(async (req, res) => {
    const { organType, expectedColdTime, donorAge } = req.body;

    const recommendation = await RiskPredictionService.recommendPreservationMethod(
      organType,
      expectedColdTime,
      donorAge
    );

    res.json({ recommendation });
  })
);

// Batch prediction for multiple organ matches
router.post(
  '/batch-predict',
  requirePermission('view:analytics'),
  asyncHandler(async (req, res) => {
    const { organMatchIds } = req.body;

    const predictions = await RiskPredictionService.batchPredictOutcomes(organMatchIds);

    res.json({ predictions });
  })
);

export default router;
