import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Check, X, Users } from 'lucide-react'

const AttendanceModal = ({ event, onClose }) => {
  const [registrations, setRegistrations] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const { getAuthHeaders } = useAuth()

  useEffect(() => {
    fetchRegistrations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.event_id])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/registrations/event/${event.event_id}`,
        { headers: getAuthHeaders() }
      )

      if (response.ok) {
        const data = await response.json()
        setRegistrations(data)
        
        // Initialize attendance state - fetch existing attendance records
        const attendanceMap = {}
        for (const reg of data) {
          const attResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/attendance/registration/${reg.reg_id}`,
            { headers: getAuthHeaders() }
          )
          
          if (attResponse.ok) {
            const attData = await attResponse.json()
            // If attendance already marked, convert status to boolean (present=true, absent=false)
            if (attData.length > 0) {
              attendanceMap[reg.reg_id] = attData[0].status === 'present' ? true : false
            }
          }
        }
        setAttendance(attendanceMap)
      } else {
        setError('Failed to fetch event registrations')
      }
    } catch (err) {
      setError('Error loading registrations')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceToggle = (reg_id) => {
    setAttendance(prev => {
      const current = prev[reg_id]
      // Toggle between present (true), absent (false), and unmarked (undefined)
      if (current === true) {
        const newState = { ...prev }
        delete newState[reg_id]
        return newState
      } else if (current === false) {
        return { ...prev, [reg_id]: true }
      } else {
        return { ...prev, [reg_id]: false }
      }
    })
  }

  const handleSaveAttendance = async () => {
    try {
      setSaving(true)
      
      // Mark attendance for all registrations
      for (const reg of registrations) {
        const status = attendance[reg.reg_id]
        
        // Only save if status is explicitly set
        if (status !== undefined) {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/attendance`,
            {
              method: 'POST',
              headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: status ? 'present' : 'absent',
                reg_id: reg.reg_id
              })
            }
          )

          if (!response.ok) {
            throw new Error(`Failed to mark attendance for ${reg.user_id}`)
          }
        }
      }

      setError(null)
      onClose(true) // Close with refresh flag
    } catch (err) {
      setError('Error saving attendance: ' + err.message)
      console.error('Error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Mark Attendance - {event.title}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto">
          {registrations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No registrations for this event.</p>
          ) : (
            <div className="space-y-2">
              {registrations.map((reg) => (
                <div
                  key={reg.reg_id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{reg.user_name || `User ${reg.user_id}`}</p>
                    <p className="text-xs text-gray-500">Registration ID: {reg.reg_id}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAttendanceToggle(reg.reg_id)}
                      className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                        attendance[reg.reg_id] === true
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : attendance[reg.reg_id] === false
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={
                        attendance[reg.reg_id] === true
                          ? 'Present'
                          : attendance[reg.reg_id] === false
                          ? 'Absent'
                          : 'Not marked'
                      }
                    >
                      {attendance[reg.reg_id] === true ? (
                        <Check className="h-5 w-5" />
                      ) : attendance[reg.reg_id] === false ? (
                        <X className="h-5 w-5" />
                      ) : (
                        '—'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttendanceModal
