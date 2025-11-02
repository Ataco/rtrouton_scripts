import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { casesAPI } from '../../services/api'
import toast from 'react-hot-toast'

interface CreateCaseModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateCaseModal({ onClose, onSuccess }: CreateCaseModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      await casesAPI.create(data)
      toast.success('Case created successfully')
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create case')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create New Case</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Donor ID *</label>
            <input
              type="text"
              className="input"
              {...register('donorId', { required: 'Donor ID is required' })}
            />
            {errors.donorId && (
              <p className="text-red-500 text-sm mt-1">{errors.donorId.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Donor Hospital</label>
              <input type="text" className="input" {...register('donorHospital')} />
            </div>
            <div>
              <label className="label">OPO</label>
              <input type="text" className="input" {...register('donorOPO')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Age</label>
              <input type="number" className="input" {...register('donorAge')} />
            </div>
            <div>
              <label className="label">Blood Type</label>
              <select className="input" {...register('donorBloodType')}>
                <option value="">Select...</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Cause of Death</label>
            <textarea
              className="input"
              rows={3}
              {...register('causeOfDeath')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
