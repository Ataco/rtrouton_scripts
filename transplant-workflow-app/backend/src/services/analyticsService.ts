import { prisma } from '../index';

export const calculateOrganAnalytics = async (organMatchId: string) => {
  // Get preservation segments
  const segments = await prisma.preservationSegment.findMany({
    where: { organMatchId },
    orderBy: { startTime: 'asc' },
  });

  let totalColdIschemia = 0;
  let totalWarmIschemia = 0;
  const perfusionModalities: string[] = [];
  const modalityHistory: any[] = [];

  for (const segment of segments) {
    const endTime = segment.endTime || new Date();
    const duration = (endTime.getTime() - new Date(segment.startTime).getTime()) / 1000 / 60;

    if (segment.phase === 'COLD') {
      totalColdIschemia += duration;
    } else {
      totalWarmIschemia += duration;
    }

    if (!perfusionModalities.includes(segment.modality)) {
      perfusionModalities.push(segment.modality);
    }

    modalityHistory.push({
      modality: segment.modality,
      phase: segment.phase,
      duration: Math.round(duration),
      startTime: segment.startTime,
      endTime: segment.endTime,
    });
  }

  // Get transport duration
  const transport = await prisma.transportRecord.findFirst({
    where: { organMatchId },
    orderBy: { createdAt: 'desc' },
  });

  let transportDuration = null;
  if (transport?.departureTime && transport?.actualArrival) {
    transportDuration =
      (new Date(transport.actualArrival).getTime() - new Date(transport.departureTime).getTime()) /
      1000 /
      60;
  }

  // Calculate preservation score
  const preservationScore = calculatePreservationScore(
    totalColdIschemia,
    totalWarmIschemia,
    perfusionModalities
  );

  // Identify risk factors
  const riskFactors = identifyRiskFactors(
    totalColdIschemia,
    totalWarmIschemia,
    perfusionModalities,
    transportDuration
  );

  // Get organ match for clamp/reperfusion times
  const organMatch = await prisma.organMatch.findUnique({
    where: { id: organMatchId },
    include: {
      reportingRecords: {
        orderBy: { submittedAt: 'desc' },
        take: 1,
      },
    },
  });

  let clampTime = null;
  let reperfusionTime = null;

  if (organMatch?.reportingRecords?.[0]) {
    const formData = organMatch.reportingRecords[0].formData as any;
    clampTime = formData.clampTime ? new Date(formData.clampTime) : null;
    reperfusionTime = formData.reperfusionTime ? new Date(formData.reperfusionTime) : null;
  }

  // Update or create analytics
  const analytics = await prisma.organAnalytics.upsert({
    where: { organMatchId },
    update: {
      totalColdIschemia: Math.round(totalColdIschemia),
      totalWarmIschemia: Math.round(totalWarmIschemia),
      perfusionModalities,
      transportDuration: transportDuration ? Math.round(transportDuration) : null,
      preservationScore,
      clampTime,
      reperfusionTime,
      riskFactors,
      lastCalculated: new Date(),
    },
    create: {
      organMatchId,
      totalColdIschemia: Math.round(totalColdIschemia),
      totalWarmIschemia: Math.round(totalWarmIschemia),
      perfusionModalities,
      transportDuration: transportDuration ? Math.round(transportDuration) : null,
      preservationScore,
      clampTime,
      reperfusionTime,
      riskFactors,
    },
  });

  return analytics;
};

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
  if (modalities.includes('NMP')) score += 15; // Normothermic machine perfusion
  if (modalities.includes('HMP')) score += 10; // Hypothermic machine perfusion
  if (modalities.includes('STATIC_COLD_ADV')) score += 5;

  // Penalty for prolonged times
  if (coldIschemia > 360) score -= 10; // > 6 hours
  if (coldIschemia > 480) score -= 20; // > 8 hours
  if (warmIschemia > 60) score -= 15; // > 1 hour

  return Math.max(0, Math.min(100, score));
}

function identifyRiskFactors(
  coldIschemia: number,
  warmIschemia: number,
  modalities: string[],
  transportDuration: number | null
): any[] {
  const risks: any[] = [];

  if (coldIschemia > 360) {
    risks.push({
      type: 'PROLONGED_COLD_ISCHEMIA',
      severity: coldIschemia > 480 ? 'HIGH' : 'MEDIUM',
      value: Math.round(coldIschemia),
      message: `Cold ischemia time: ${Math.round(coldIschemia)} minutes`,
    });
  }

  if (warmIschemia > 45) {
    risks.push({
      type: 'PROLONGED_WARM_ISCHEMIA',
      severity: warmIschemia > 60 ? 'HIGH' : 'MEDIUM',
      value: Math.round(warmIschemia),
      message: `Warm ischemia time: ${Math.round(warmIschemia)} minutes`,
    });
  }

  if (modalities.length === 1 && modalities[0] === 'ICE') {
    risks.push({
      type: 'BASIC_PRESERVATION_ONLY',
      severity: 'LOW',
      message: 'Only basic ice preservation used',
    });
  }

  if (transportDuration && transportDuration > 240) {
    risks.push({
      type: 'LONG_TRANSPORT',
      severity: 'MEDIUM',
      value: Math.round(transportDuration),
      message: `Transport duration: ${Math.round(transportDuration)} minutes`,
    });
  }

  return risks;
}

export const generatePreservationAnalytics = async (
  organType?: string,
  startDate?: Date,
  endDate?: Date
) => {
  const where: any = {};

  if (startDate && endDate) {
    where.lastCalculated = {
      gte: startDate,
      lte: endDate,
    };
  }

  if (organType) {
    where.organMatch = {
      organType,
    };
  }

  const analytics = await prisma.organAnalytics.findMany({
    where,
    include: {
      organMatch: {
        select: {
          organType: true,
        },
      },
    },
  });

  // Group by organ type and modality
  const grouped: any = {};

  analytics.forEach((analytic) => {
    const organ = analytic.organMatch.organType;
    const modalities = analytic.perfusionModalities as string[];

    modalities.forEach((modality) => {
      const key = `${organ}_${modality}`;

      if (!grouped[key]) {
        grouped[key] = {
          organType: organ,
          modality,
          totalCold: 0,
          totalWarm: 0,
          count: 0,
          scores: [],
        };
      }

      grouped[key].totalCold += analytic.totalColdIschemia || 0;
      grouped[key].totalWarm += analytic.totalWarmIschemia || 0;
      grouped[key].count += 1;
      if (analytic.preservationScore) {
        grouped[key].scores.push(analytic.preservationScore);
      }
    });
  });

  // Calculate averages and save
  const results = [];

  for (const [key, data] of Object.entries(grouped as any)) {
    const avgScore = data.scores.length > 0
      ? data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length
      : null;

    const record = await prisma.preservationAnalytics.create({
      data: {
        organType: data.organType,
        modality: data.modality,
        totalCold: Math.round(data.totalCold / data.count),
        totalWarm: Math.round(data.totalWarm / data.count),
        caseCount: data.count,
        averageScore: avgScore ? Math.round(avgScore * 100) / 100 : null,
        periodStart: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        periodEnd: endDate || new Date(),
      },
    });

    results.push(record);
  }

  return results;
};
