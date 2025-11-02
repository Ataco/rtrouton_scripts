import { useEffect, useState } from 'react'
import { riskPredictionAPI } from '../../services/api'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface RiskPredictionCardProps {
  organMatchId: string
}

export default function RiskPredictionCard({ organMatchId }: RiskPredictionCardProps) {
  const [loading, setLoading] = useState(true)
  const [prediction, setPrediction] = useState<any>(null)

  useEffect(() => {
    loadPrediction()
  }, [organMatchId])

  const loadPrediction = async () => {
    try {
      const response = await riskPredictionAPI.predictSuccess(organMatchId)
      setPrediction(response.data.prediction)
    } catch (error) {
      console.error('Failed to load prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="card">Loading risk analysis...</div>
  }

  if (!prediction) {
    return <div className="card">No prediction data available</div>
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'text-green-600 dark:text-green-400'
      case 'MODERATE':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400'
      case 'CRITICAL':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW':
        return <CheckCircleIcon className="w-8 h-8 text-green-600" />
      case 'MODERATE':
        return <InformationCircleIcon className="w-8 h-8 text-yellow-600" />
      default:
        return <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">AI Risk Prediction</h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="text-center">
          {getRiskIcon(prediction.riskLevel)}
          <p className={`text-3xl font-bold mt-2 ${getRiskColor(prediction.riskLevel)}`}>
            {prediction.successProbability}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Success Probability
          </p>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${getRiskColor(prediction.riskLevel)}`}>
            {prediction.riskLevel}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Risk Level
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Risk Score: {prediction.riskScore}%
          </p>
        </div>
      </div>

      {prediction.keyRiskFactors && prediction.keyRiskFactors.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Key Risk Factors</h4>
          <div className="space-y-2">
            {prediction.keyRiskFactors.map((factor: any, index: number) => (
              <div
                key={index}
                className="border-l-4 border-red-500 pl-3 py-2 bg-gray-50 dark:bg-gray-700"
              >
                <p className="font-medium">{factor.factor}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {factor.impact}
                </p>
                <span className={`text-xs badge badge-${
                  factor.severity === 'HIGH' ? 'danger' :
                  factor.severity === 'MEDIUM' ? 'warning' : 'info'
                }`}>
                  {factor.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {prediction.recommendations && prediction.recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Recommendations</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {prediction.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Calculated at: {new Date(prediction.calculatedAt).toLocaleString()}
      </div>
    </div>
  )
}
