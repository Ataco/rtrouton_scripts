import { prisma } from '../index';

// Automated Report Generation Service
export class ReportGenerationService {
  // Generate comprehensive case report
  static async generateCaseReport(donorCaseId: string): Promise<any> {
    const donorCase = await prisma.donorCase.findUnique({
      where: { id: donorCaseId },
      include: {
        organMatches: {
          include: {
            assignedCoordinator: true,
            analytics: true,
            reportingRecords: true,
            surgeonNotes: true,
            preservationSegments: true,
            transportRecords: true,
          },
        },
        donorSummaries: true,
        chatMessages: {
          where: { messageType: 'AUTO_SUMMARY' },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!donorCase) return null;

    return {
      reportType: 'COMPREHENSIVE_CASE',
      generatedAt: new Date(),
      donorInformation: {
        donorId: donorCase.donorId,
        hospital: donorCase.donorHospital,
        opo: donorCase.donorOPO,
        age: donorCase.donorAge,
        bloodType: donorCase.donorBloodType,
        causeOfDeath: donorCase.causeOfDeath,
      },
      caseTimeline: this.buildCaseTimeline(donorCase),
      organSummaries: this.buildOrganSummaries(donorCase.organMatches),
      preservationAnalysis: this.buildPreservationAnalysis(donorCase.organMatches),
      communicationLog: donorCase.chatMessages.map((msg: any) => ({
        timestamp: msg.createdAt,
        content: msg.content,
      })),
      statistics: this.calculateCaseStatistics(donorCase),
    };
  }

  // Generate organ-specific report
  static async generateOrganReport(organMatchId: string): Promise<any> {
    const organMatch = await prisma.organMatch.findUnique({
      where: { id: organMatchId },
      include: {
        donorCase: true,
        assignedCoordinator: true,
        analytics: true,
        reportingRecords: {
          orderBy: { submittedAt: 'desc' },
        },
        surgeonNotes: {
          orderBy: { createdAt: 'desc' },
        },
        preservationSegments: {
          orderBy: { startTime: 'asc' },
        },
        transportRecords: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!organMatch) return null;

    return {
      reportType: 'ORGAN_SPECIFIC',
      generatedAt: new Date(),
      organType: organMatch.organType,
      matchId: organMatch.matchId,
      donorInformation: {
        donorId: organMatch.donorCase.donorId,
        age: organMatch.donorCase.donorAge,
        bloodType: organMatch.donorCase.donorBloodType,
      },
      recipientInformation: {
        hospital: organMatch.recipientHospital,
        surgeon: organMatch.recipientSurgeon,
      },
      coordinator: organMatch.assignedCoordinator
        ? `${organMatch.assignedCoordinator.firstName} ${organMatch.assignedCoordinator.lastName}`
        : 'Unassigned',
      preservationDetails: {
        segments: organMatch.preservationSegments.map((seg: any) => ({
          phase: seg.phase,
          modality: seg.modality,
          startTime: seg.startTime,
          endTime: seg.endTime,
          duration: seg.endTime
            ? Math.round(
                (new Date(seg.endTime).getTime() - new Date(seg.startTime).getTime()) /
                  1000 /
                  60
              )
            : 'Ongoing',
        })),
        totalColdIschemia: organMatch.analytics?.totalColdIschemia,
        totalWarmIschemia: organMatch.analytics?.totalWarmIschemia,
        preservationScore: organMatch.analytics?.preservationScore,
      },
      transportDetails: organMatch.transportRecords[0] || null,
      clinicalNotes: organMatch.surgeonNotes.map((note: any) => ({
        timestamp: note.createdAt,
        author: `${note.author?.firstName} ${note.author?.lastName}`,
        content: note.content,
      })),
      submittedForms: organMatch.reportingRecords.map((record: any) => ({
        formType: record.formType,
        submittedAt: record.submittedAt,
        submittedBy: record.submittedBy,
      })),
      analytics: organMatch.analytics,
    };
  }

  // Generate daily summary report
  static async generateDailySummary(date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const cases = await prisma.donorCase.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        organMatches: {
          include: {
            analytics: true,
          },
        },
      },
    });

    const reports = await prisma.reportingRecord.findMany({
      where: {
        submittedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return {
      reportType: 'DAILY_SUMMARY',
      date: date.toISOString().split('T')[0],
      generatedAt: new Date(),
      summary: {
        totalCases: cases.length,
        totalOrgans: cases.reduce((sum, c) => sum + c.organMatches.length, 0),
        totalReportsSubmitted: reports.length,
        organBreakdown: this.getOrganBreakdown(cases),
        averagePreservationScore: this.calculateAveragePreservationScore(cases),
      },
      caseDetails: cases.map((c) => ({
        donorId: c.donorId,
        opo: c.donorOPO,
        organsCount: c.organMatches.length,
        status: c.status,
      })),
      formSubmissions: this.groupFormSubmissions(reports),
    };
  }

  // Generate analytics report
  static async generateAnalyticsReport(
    startDate: Date,
    endDate: Date,
    organType?: string
  ): Promise<any> {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (organType) {
      where.organType = organType;
    }

    const organMatches = await prisma.organMatch.findMany({
      where,
      include: {
        analytics: true,
        donorCase: true,
      },
    });

    const analytics = organMatches.map((om) => om.analytics).filter((a) => a != null);

    return {
      reportType: 'ANALYTICS',
      period: {
        start: startDate,
        end: endDate,
      },
      organType: organType || 'ALL',
      generatedAt: new Date(),
      totalCases: organMatches.length,
      metrics: {
        averageColdIschemia: this.calculateAverage(
          analytics.map((a) => a.totalColdIschemia || 0)
        ),
        averageWarmIschemia: this.calculateAverage(
          analytics.map((a) => a.totalWarmIschemia || 0)
        ),
        averageTransportDuration: this.calculateAverage(
          analytics.map((a) => a.transportDuration || 0)
        ),
        averagePreservationScore: this.calculateAverage(
          analytics.map((a) => a.preservationScore || 0)
        ),
      },
      preservationMethods: this.analyzePreservationMethods(analytics),
      riskDistribution: this.analyzeRiskDistribution(analytics),
      trends: this.calculateTrends(organMatches),
    };
  }

  // Helper: Build case timeline
  private static buildCaseTimeline(donorCase: any): any[] {
    const events = [];

    events.push({
      timestamp: donorCase.createdAt,
      type: 'CASE_CREATED',
      description: 'Donor case created',
    });

    donorCase.organMatches?.forEach((match: any) => {
      events.push({
        timestamp: match.createdAt,
        type: 'ORGAN_MATCH_ADDED',
        description: `${match.organType} match added`,
        organType: match.organType,
      });
    });

    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Helper: Build organ summaries
  private static buildOrganSummaries(organMatches: any[]): any[] {
    return organMatches.map((match) => ({
      organType: match.organType,
      matchId: match.matchId,
      status: match.status,
      recipientHospital: match.recipientHospital,
      preservationScore: match.analytics?.preservationScore,
      totalIschemia:
        (match.analytics?.totalColdIschemia || 0) + (match.analytics?.totalWarmIschemia || 0),
    }));
  }

  // Helper: Build preservation analysis
  private static buildPreservationAnalysis(organMatches: any[]): any {
    const totalOrgans = organMatches.length;
    const withAdvancedPreservation = organMatches.filter((m) =>
      (m.analytics?.perfusionModalities || []).some((mod: string) =>
        ['NMP', 'HMP'].includes(mod)
      )
    ).length;

    return {
      totalOrgans,
      advancedPreservationUsage: `${withAdvancedPreservation}/${totalOrgans}`,
      averageScore: this.calculateAveragePreservationScore({ organMatches }),
    };
  }

  // Helper: Calculate case statistics
  private static calculateCaseStatistics(donorCase: any): any {
    return {
      totalOrgans: donorCase.organMatches?.length || 0,
      completedOrgans: donorCase.organMatches?.filter((m: any) => m.status === 'COMPLETED')
        .length,
      activeDuration: Math.round(
        (Date.now() - new Date(donorCase.createdAt).getTime()) / 1000 / 60 / 60
      ), // hours
    };
  }

  // Helper: Get organ breakdown
  private static getOrganBreakdown(cases: any[]): any {
    const breakdown: any = {};
    cases.forEach((c) => {
      c.organMatches?.forEach((m: any) => {
        breakdown[m.organType] = (breakdown[m.organType] || 0) + 1;
      });
    });
    return breakdown;
  }

  // Helper: Calculate average preservation score
  private static calculateAveragePreservationScore(data: any): number {
    const matches = data.organMatches || [];
    const scores = matches
      .map((m: any) => m.analytics?.preservationScore)
      .filter((s: any) => s != null);

    return scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0;
  }

  // Helper: Group form submissions
  private static groupFormSubmissions(reports: any[]): any {
    const grouped: any = {};
    reports.forEach((r) => {
      grouped[r.formType] = (grouped[r.formType] || 0) + 1;
    });
    return grouped;
  }

  // Helper: Calculate average
  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  // Helper: Analyze preservation methods
  private static analyzePreservationMethods(analytics: any[]): any {
    const methods: any = {};
    analytics.forEach((a) => {
      (a.perfusionModalities || []).forEach((method: string) => {
        methods[method] = (methods[method] || 0) + 1;
      });
    });
    return methods;
  }

  // Helper: Analyze risk distribution
  private static analyzeRiskDistribution(analytics: any[]): any {
    const distribution = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };

    analytics.forEach((a) => {
      const riskCount = (a.riskFactors || []).length;
      if (riskCount === 0) distribution.LOW++;
      else if (riskCount <= 2) distribution.MEDIUM++;
      else distribution.HIGH++;
    });

    return distribution;
  }

  // Helper: Calculate trends
  private static calculateTrends(organMatches: any[]): any {
    // Simple trend analysis - could be enhanced with more sophisticated algorithms
    return {
      totalMatches: organMatches.length,
      statusDistribution: {
        OFFERED: organMatches.filter((m) => m.status === 'OFFERED').length,
        ACCEPTED: organMatches.filter((m) => m.status === 'ACCEPTED').length,
        DECLINED: organMatches.filter((m) => m.status === 'DECLINED').length,
        COMPLETED: organMatches.filter((m) => m.status === 'COMPLETED').length,
      },
    };
  }
}
