interface PreservationScoreGaugeProps {
  score: number
  label?: string
}

export default function PreservationScoreGauge({ score, label = 'Preservation Score' }: PreservationScoreGaugeProps) {
  const getColor = (score: number) => {
    if (score >= 85) return '#10b981' // green
    if (score >= 70) return '#3b82f6' // blue
    if (score >= 50) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getGrade = (score: number) => {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Poor'
  }

  const circumference = 2 * Math.PI * 70 // radius = 70
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="card text-center">
      <h4 className="font-semibold mb-4">{label}</h4>
      <div className="relative inline-block">
        <svg className="transform -rotate-90" width="160" height="160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={getColor(score)}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold" style={{ color: getColor(score) }}>
            {score}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{getGrade(score)}</div>
        </div>
      </div>
    </div>
  )
}
