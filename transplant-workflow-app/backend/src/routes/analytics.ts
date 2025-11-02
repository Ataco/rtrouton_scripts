import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { loadUser, requirePermission } from '../middleware/rbac';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(requireAuth, loadUser);

// Get analytics for organ match
router.get('/organ-match/:organMatchId', requirePermission('view:analytics'), asyncHandler(async (req, res) => {
  const { organMatchId } = req.params;

  const analytics = await prisma.organAnalytics.findUnique({
    where: { organMatchId },
  });

  if (!analytics) {
    return res.status(404).json({ error: 'Analytics not found' });
  }

  res.json({ analytics });
}));

// Update/recalculate analytics
router.post('/organ-match/:organMatchId/calculate', requirePermission('manage:analytics'), asyncHandler(async (req, res) => {
  const { organMatchId } = req.params;

  // Get preservation segments
  const segments = await prisma.preservationSegment.findMany({
    where: { organMatchId },
    orderBy: { startTime: 'asc' },
  });

  let totalColdIschemia = 0;
  let totalWarmIschemia = 0;
  const perfusionModalities: string[] = [];

  for (const segment of segments) {
    const endTime = segment.endTime || new Date();
    const duration = (endTime.getTime() - segment.startTime.getTime()) / 1000 / 60;

    if (segment.phase === 'COLD') {
      totalColdIschemia += duration;
    } else {
      totalWarmIschemia += duration;
    }

    if (!perfusionModalities.includes(segment.modality)) {
      perfusionModalities.push(segment.modality);
    }
  }

  // Get transport duration
  const transport = await prisma.transportRecord.findFirst({
    where: { organMatchId },
    orderBy: { createdAt: 'desc' },
  });

  let transportDuration = null;
  if (transport?.departureTime && transport?.actualArrival) {
    transportDuration = (transport.actualArrival.getTime() - transport.departureTime.getTime()) / 1000 / 60;
  }

  // Calculate preservation score (example formula)
  const preservationScore = calculatePreservationScore(
    totalColdIschemia,
    totalWarmIschemia,
    perfusionModalities
  );

  // Update or create analytics
  const analytics = await prisma.organAnalytics.upsert({
    where: { organMatchId },
    update: {
      totalColdIschemia: Math.round(totalColdIschemia),
      totalWarmIschemia: Math.round(totalWarmIschemia),
      perfusionModalities,
      transportDuration: transportDuration ? Math.round(transportDuration) : null,
      preservationScore,
      lastCalculated: new Date(),
    },
    create: {
      organMatchId,
      totalColdIschemia: Math.round(totalColdIschemia),
      totalWarmIschemia: Math.round(totalWarmIschemia),
      perfusionModalities,
      transportDuration: transportDuration ? Math.round(transportDuration) : null,
      preservationScore,
    },
  });

  res.json({ analytics });
}));

// Get aggregate analytics
router.get('/aggregate', requirePermission('view:analytics'), asyncHandler(async (req, res) => {
  const { organType, startDate, endDate } = req.query;

  const where: any = {};
  if (startDate && endDate) {
    where.organMatch = {
      createdAt: {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      },
    };
  }
  if (organType) {
    where.organMatch = {
      ...where.organMatch,
      organType,
    };
  }

  const analytics = await prisma.organAnalytics.findMany({
    where,
    include: {
      organMatch: {
        include: {
          donorCase: true,
        },
      },
    },
  });

  // Calculate aggregates
  const avgColdIschemia = analytics.reduce((sum, a) => sum + (a.totalColdIschemia || 0), 0) / analytics.length;
  const avgWarmIschemia = analytics.reduce((sum, a) => sum + (a.totalWarmIschemia || 0), 0) / analytics.length;
  const avgTransportDuration = analytics.reduce((sum, a) => sum + (a.transportDuration || 0), 0) / analytics.length;
  const avgPreservationScore = analytics.reduce((sum, a) => sum + (a.preservationScore || 0), 0) / analytics.length;

  res.json({
    count: analytics.length,
    averages: {
      coldIschemia: Math.round(avgColdIschemia),
      warmIschemia: Math.round(avgWarmIschemia),
      transportDuration: Math.round(avgTransportDuration),
      preservationScore: Math.round(avgPreservationScore * 100) / 100,
    },
    details: analytics,
  });
}));

// Export analytics to CSV
router.get('/export', requirePermission('export:analytics'), asyncHandler(async (req, res) => {
  const { organType, startDate, endDate } = req.query;

  const where: any = {};
  if (startDate && endDate) {
    where.organMatch = {
      createdAt: {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      },
    };
  }
  if (organType) {
    where.organMatch = {
      ...where.organMatch,
      organType,
    };
  }

  const analytics = await prisma.organAnalytics.findMany({
    where,
    include: {
      organMatch: {
        include: {
          donorCase: true,
        },
      },
    },
  });

  // Generate CSV
  const headers = [
    'Donor ID',
    'Match ID',
    'Organ Type',
    'Cold Ischemia (min)',
    'Warm Ischemia (min)',
    'Transport Duration (min)',
    'Preservation Score',
    'Perfusion Modalities',
  ];

  const rows = analytics.map((a) => [
    a.organMatch.donorCase.donorId,
    a.organMatch.matchId,
    a.organMatch.organType,
    a.totalColdIschemia || 0,
    a.totalWarmIschemia || 0,
    a.transportDuration || 0,
    a.preservationScore || 0,
    (a.perfusionModalities as string[]).join('; '),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
  res.send(csv);
}));

// Helper function to calculate preservation score
function calculatePreservationScore(
  coldIschemia: number,
  warmIschemia: number,
  modalities: string[]
): number {
  let score = 100;

  // Deduct for ischemia time
  score -= (coldIschemia / 60) * 2; // 2 points per hour cold
  score -= (warmIschemia / 30) * 5; // 5 points per 30 min warm

  // Bonus for advanced modalities
  if (modalities.includes('NMP')) score += 10;
  if (modalities.includes('HMP')) score += 5;

  return Math.max(0, Math.min(100, score));
}

export default router;
