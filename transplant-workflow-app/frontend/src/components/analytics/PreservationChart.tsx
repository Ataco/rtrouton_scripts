import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PreservationChartProps {
  data: any[]
}

export default function PreservationChart({ data }: PreservationChartProps) {
  // Transform data for chart
  const chartData = data.map((item) => ({
    organ: item.organType,
    cold: item.totalColdIschemia || 0,
    warm: item.totalWarmIschemia || 0,
  }))

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Ischemia Time Analysis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
          <XAxis dataKey="organ" className="text-sm" />
          <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
            }}
          />
          <Legend />
          <Bar dataKey="cold" fill="#3b82f6" name="Cold Ischemia (min)" />
          <Bar dataKey="warm" fill="#ef4444" name="Warm Ischemia (min)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
