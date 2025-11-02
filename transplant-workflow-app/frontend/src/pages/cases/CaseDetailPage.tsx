import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tab } from '@headlessui/react'
import { casesAPI } from '../../services/api'
import { useSocket } from '../../contexts/SocketContext'
import Loading from '../../components/common/Loading'
import CaseOverviewTab from '../../components/cases/CaseOverviewTab'
import ChatTab from '../../components/cases/ChatTab'
import OrganMatchesTab from '../../components/cases/OrganMatchesTab'
import TransportTab from '../../components/cases/TransportTab'
import AnalyticsTab from '../../components/cases/AnalyticsTab'

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { joinCase, leaveCase } = useSocket()
  const [loading, setLoading] = useState(true)
  const [caseData, setCaseData] = useState<any>(null)

  useEffect(() => {
    if (id) {
      loadCase()
      joinCase(id)

      return () => {
        leaveCase(id)
      }
    }
  }, [id])

  const loadCase = async () => {
    try {
      const response = await casesAPI.getById(id!)
      setCaseData(response.data.case)
    } catch (error) {
      console.error('Failed to load case:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (!caseData) return <div>Case not found</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Case: {caseData.donorId}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>OPO: {caseData.donorOPO || 'N/A'}</span>
          <span>Hospital: {caseData.donorHospital || 'N/A'}</span>
          <span>Age: {caseData.donorAge || 'N/A'}</span>
          <span>Blood Type: {caseData.donorBloodType || 'N/A'}</span>
          <span className="badge badge-success">{caseData.status}</span>
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
          {['Overview', 'Organ Matches', 'Chat', 'Transport', 'Analytics'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  selected
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <CaseOverviewTab caseData={caseData} onUpdate={loadCase} />
          </Tab.Panel>
          <Tab.Panel>
            <OrganMatchesTab caseData={caseData} onUpdate={loadCase} />
          </Tab.Panel>
          <Tab.Panel>
            <ChatTab caseData={caseData} />
          </Tab.Panel>
          <Tab.Panel>
            <TransportTab caseData={caseData} />
          </Tab.Panel>
          <Tab.Panel>
            <AnalyticsTab caseData={caseData} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
