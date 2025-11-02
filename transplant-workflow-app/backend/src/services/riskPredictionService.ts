import { prisma } from '../index';

// Machine Learning-based Risk Prediction
export class RiskPredictionService {
  // Predict transplant success probability
  static async predictTransplantSuccess(organMatchId: string): Promise<any> {
    const organMatch = await prisma.organMatch.findUnique({
      where: { id: organMatchId },
      include: {
        donorCase: true,
        analytics: true,
        preservationSegments: true,
        transportRecords: true,
      },
    });

    if (!organMatch) return null;

    // Extract features for ML model
    const features = this.extractFeatures(organMatch);

    // Calculate risk score using simplified model
    // In production, this would call a trained ML model (TensorFlow, scikit-learn, etc.)
    const riskScore = this.calculateRiskScore(features);
    const successProbability = 1 - riskScore;

    // Identify key risk factors
    const keyRiskFactors = this.identifyKeyRiskFactors(features);

    // Generate recommendations
    const recommendations = this.generateRecommendations(features, keyRiskFactors);

    return {
      organMatchId,
      successProbability: Math.round(successProbability * 100),
      riskScore: Math.round(riskScore * 100),
      riskLevel: this.getRiskLevel(riskScore),
      keyRiskFactors,
      recommendations,
      features,
      calculatedAt: new Date(),
    };
  }

  // Extract features from organ match data
  private static extractFeatures(organMatch: any): any {
    const donorAge = organMatch.donorCase.donorAge || 40;
    const coldIschemia = organMatch.analytics?.totalColdIschemia || 0;
    const warmIschemia = organMatch.analytics?.totalWarmIschemia || 0;
    const preservationScore = organMatch.analytics?.preservationScore || 50;
    const transportDuration = organMatch.analytics?.transportDuration || 0;

    // Modality quality score
    const modalities = organMatch.analytics?.perfusionModalities || [];
    let modalityScore = 0;
    if (modalities.includes('NMP')) modalityScore = 1.0;
    else if (modalities.includes('HMP')) modalityScore = 0.8;
    else if (modalities.includes('STATIC_COLD_ADV')) modalityScore = 0.6;
    else modalityScore = 0.4;

    return {
      donorAge,
      coldIschemia,
      warmIschemia,
      preservationScore,
      transportDuration,
      modalityScore,
      organType: organMatch.organType,
      hasAdvancedPreservation: modalities.some((m: string) =>
        ['NMP', 'HMP'].includes(m)
      ),
    };
  }

  // Calculate overall risk score (0-1, where 1 is highest risk)
  private static calculateRiskScore(features: any): number {
    let score = 0;

    // Age factor (weight: 0.2)
    const ageFactor = Math.min(features.donorAge / 100, 0.2);
    score += ageFactor;

    // Cold ischemia factor (weight: 0.25)
    const coldFactor = Math.min(features.coldIschemia / 600, 0.25); // Max 10 hours
    score += coldFactor;

    // Warm ischemia factor (weight: 0.25)
    const warmFactor = Math.min(features.warmIschemia / 90, 0.25); // Max 1.5 hours
    score += warmFactor;

    // Preservation quality (weight: 0.2)
    const preservationFactor = (100 - features.preservationScore) / 500;
    score += preservationFactor;

    // Transport duration (weight: 0.1)
    const transportFactor = Math.min(features.transportDuration / 600, 0.1); // Max 10 hours
    score += transportFactor;

    // Normalize to 0-1
    return Math.min(Math.max(score, 0), 1);
  }

  // Identify key risk factors
  private static identifyKeyRiskFactors(features: any): any[] {
    const factors = [];

    if (features.donorAge > 60) {
      factors.push({
        factor: 'Advanced Donor Age',
        severity: features.donorAge > 70 ? 'HIGH' : 'MEDIUM',
        value: features.donorAge,
        impact: 'Increased risk of delayed graft function',
      });
    }

    if (features.coldIschemia > 360) {
      factors.push({
        factor: 'Prolonged Cold Ischemia',
        severity: features.coldIschemia > 480 ? 'HIGH' : 'MEDIUM',
        value: `${features.coldIschemia} minutes`,
        impact: 'Increased cellular damage and reduced function',
      });
    }

    if (features.warmIschemia > 45) {
      factors.push({
        factor: 'Prolonged Warm Ischemia',
        severity: features.warmIschemia > 60 ? 'HIGH' : 'MEDIUM',
        value: `${features.warmIschemia} minutes`,
        impact: 'Significantly increased risk of primary non-function',
      });
    }

    if (!features.hasAdvancedPreservation) {
      factors.push({
        factor: 'Basic Preservation Method',
        severity: 'LOW',
        value: 'Static cold storage',
        impact: 'Suboptimal organ preservation',
      });
    }

    if (features.transportDuration > 300) {
      factors.push({
        factor: 'Extended Transport Time',
        severity: 'MEDIUM',
        value: `${features.transportDuration} minutes`,
        impact: 'Prolonged out-of-body time',
      });
    }

    return factors;
  }

  // Generate recommendations
  private static generateRecommendations(features: any, riskFactors: any[]): string[] {
    const recommendations = [];

    if (features.coldIschemia > 300) {
      recommendations.push(
        'Consider aggressive post-transplant monitoring for delayed graft function'
      );
    }

    if (features.warmIschemia > 45) {
      recommendations.push(
        'Ensure rapid surgical technique to minimize additional warm ischemia'
      );
      recommendations.push(
        'Prepare for possible post-reperfusion syndrome'
      );
    }

    if (!features.hasAdvancedPreservation && features.coldIschemia > 240) {
      recommendations.push(
        'Consider machine perfusion for future similar cases to improve outcomes'
      );
    }

    if (features.donorAge > 65) {
      recommendations.push(
        'Enhanced immunosuppression protocol may be beneficial'
      );
      recommendations.push(
        'Extended post-operative monitoring recommended'
      );
    }

    if (riskFactors.length > 2) {
      recommendations.push(
        'Multidisciplinary team review recommended before acceptance'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Standard post-transplant protocol appropriate');
      recommendations.push('Excellent preservation conditions noted');
    }

    return recommendations;
  }

  // Get risk level category
  private static getRiskLevel(riskScore: number): string {
    if (riskScore < 0.25) return 'LOW';
    if (riskScore < 0.5) return 'MODERATE';
    if (riskScore < 0.75) return 'HIGH';
    return 'CRITICAL';
  }

  // Predict optimal preservation method
  static async recommendPreservationMethod(
    organType: string,
    expectedColdTime: number,
    donorAge: number
  ): Promise<any> {
    const recommendations = [];

    // Heart-specific recommendations
    if (organType === 'HEART') {
      if (expectedColdTime < 240) {
        recommendations.push({
          method: 'ICE',
          score: 85,
          reasoning: 'Standard cold storage acceptable for short ischemia time',
        });
      }
      if (expectedColdTime >= 240 || donorAge > 50) {
        recommendations.push({
          method: 'NMP',
          score: 95,
          reasoning: 'Normothermic perfusion optimal for extended time or marginal donor',
        });
      }
    }

    // Liver-specific recommendations
    if (organType === 'LIVER') {
      if (expectedColdTime < 360 && donorAge < 60) {
        recommendations.push({
          method: 'STATIC_COLD_ADV',
          score: 80,
          reasoning: 'Advanced cold storage adequate',
        });
      }
      if (expectedColdTime >= 360 || donorAge >= 60) {
        recommendations.push({
          method: 'NMP',
          score: 92,
          reasoning: 'Machine perfusion recommended for optimal outcomes',
        });
      }
    }

    // Kidney-specific recommendations
    if (organType === 'KIDNEY') {
      recommendations.push({
        method: 'HMP',
        score: 88,
        reasoning: 'Hypothermic machine perfusion standard of care',
      });
      if (donorAge < 50 && expectedColdTime < 480) {
        recommendations.push({
          method: 'STATIC_COLD_ADV',
          score: 75,
          reasoning: 'Static storage acceptable for young donor',
        });
      }
    }

    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);

    return {
      organType,
      expectedColdTime,
      donorAge,
      recommendations,
      optimalMethod: recommendations[0],
    };
  }

  // Batch prediction for analytics dashboard
  static async batchPredictOutcomes(organMatchIds: string[]): Promise<any[]> {
    const predictions = [];

    for (const id of organMatchIds) {
      const prediction = await this.predictTransplantSuccess(id);
      if (prediction) {
        predictions.push(prediction);
      }
    }

    return predictions;
  }
}
