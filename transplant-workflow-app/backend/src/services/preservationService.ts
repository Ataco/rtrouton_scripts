import { prisma } from '../index';

export const calculateRemainingTime = async (organMatchId: string) => {
  // Get organ match with type
  const organMatch = await prisma.organMatch.findUnique({
    where: { id: organMatchId },
    select: { organType: true },
  });

  if (!organMatch) return null;

  // Get all preservation segments
  const segments = await prisma.preservationSegment.findMany({
    where: { organMatchId },
    orderBy: { startTime: 'asc' },
  });

  // Calculate total cold and warm time
  let totalColdMinutes = 0;
  let totalWarmMinutes = 0;
  let currentModality = 'ICE';

  for (const segment of segments) {
    const endTime = segment.endTime || new Date();
    const duration = (endTime.getTime() - segment.startTime.getTime()) / 1000 / 60; // minutes

    if (segment.phase === 'COLD') {
      totalColdMinutes += duration;
    } else {
      totalWarmMinutes += duration;
    }

    if (!segment.endTime) {
      currentModality = segment.modality;
    }
  }

  // Get tolerance for this organ type and modality
  const tolerance = await prisma.preservationTolerance.findFirst({
    where: {
      organType: organMatch.organType,
      modality: currentModality,
      isActive: true,
    },
  });

  if (!tolerance) {
    return {
      totalColdMinutes: Math.round(totalColdMinutes),
      totalWarmMinutes: Math.round(totalWarmMinutes),
      warning: false,
    };
  }

  const coldRemaining = tolerance.maxColdTime - totalColdMinutes;
  const warmRemaining = tolerance.maxWarmTime - totalWarmMinutes;

  // Warning if less than 25% time remaining
  const warning = coldRemaining < tolerance.maxColdTime * 0.25 ||
                  warmRemaining < tolerance.maxWarmTime * 0.25;

  return {
    totalColdMinutes: Math.round(totalColdMinutes),
    totalWarmMinutes: Math.round(totalWarmMinutes),
    coldRemaining: Math.round(coldRemaining),
    warmRemaining: Math.round(warmRemaining),
    maxColdTime: tolerance.maxColdTime,
    maxWarmTime: tolerance.maxWarmTime,
    warning,
    critical: coldRemaining < 0 || warmRemaining < 0,
  };
};
