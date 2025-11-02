export default function TransportTab({ caseData }: { caseData: any }) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Transport Information</h2>
      <p className="text-gray-500 dark:text-gray-400">
        Transport tracking features coming soon...
      </p>
      <div className="mt-6 space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Planned Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Real-time flight tracking</li>
            <li>Aircraft location map</li>
            <li>ETA notifications</li>
            <li>Departure/Arrival times</li>
            <li>Carrier and tail number tracking</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
