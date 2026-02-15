"use client"
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useApiClient } from '@/components/providers/ApiClientProvider'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, XCircle, Clock, ChevronDown, TrendingUp } from 'lucide-react'
import { useToast } from '@/components/common/Toast/ToastProvider'
const Attendance = ({ role }) => {
  const apiClient = useApiClient()
  const { showToast } = useToast()
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)
  const [attendanceData, setAttendanceData] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState({ type: '', message: '' })

  const loadStudents = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/students')
      setStudentsList(res.data || [])
    } catch (error) {
      console.error('Error loading students for attendance:', error)
      showToast({ type: 'error', message: 'Failed to load students for attendance' })
    }
  }, [apiClient, showToast])

  const loadAttendanceForMonth = useCallback(async (monthKey) => {
    try {
      const res = await apiClient.get(`/api/attendance?month=${monthKey}`)
      setAttendanceData(res.data || [])
    } catch (error) {
      console.error('Error loading attendance records:', error)
      showToast({ type: 'error', message: 'Failed to load attendance records' })
    }
  }, [apiClient, showToast])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  useEffect(() => {
    loadAttendanceForMonth(selectedMonth)
  }, [selectedMonth, loadAttendanceForMonth])

  const months = useMemo(() => {
    const monthSet = new Set()
    attendanceData.forEach(record => {
      const date = new Date(record.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthSet.add(monthKey)
    })
    return Array.from(monthSet).sort().reverse()
  }, [attendanceData])

  const monthlyRecords = useMemo(() => {
    return attendanceData.filter(record => {
      const recordMonth = record.date.substring(0, 7)
      return recordMonth === selectedMonth
    })
  }, [attendanceData, selectedMonth])

  const monthlyStats = useMemo(() => {
    const stats = { present: 0, absent: 0, late: 0, total: 0 }
    monthlyRecords.forEach(record => {
      if (record.status === 'present') stats.present++
      else if (record.status === 'absent') stats.absent++
      else if (record.status === 'late') stats.late++
      stats.total++
    })
    stats.percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0
    return stats
  }, [monthlyRecords])

  const getMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(year, parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const markAttendance = async (student, attendanceStatus) => {
    const studentId = student._id
    const className = student.class

    setAttendanceData(prev => {
      const existingIndex = prev.findIndex(r => r.studentId === studentId && r.date?.substring(0, 10) === selectedDate)
      if (existingIndex !== -1) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], status: attendanceStatus }
        return updated
      }
      return [...prev, { studentId, class: className, date: selectedDate, status: attendanceStatus }]
    })

    try {
      await apiClient.post('/api/attendance', {
        studentId,
        class: className,
        date: selectedDate,
        status: attendanceStatus,
      })
      setStatus({ type: 'success', message: 'Attendance updated' })
    } catch (error) {
      console.error('Error updating attendance:', error)
      setStatus({ type: 'error', message: 'Failed to update attendance' })
      showToast({ type: 'error', message: 'Failed to update attendance' })
    } finally {
      setTimeout(() => setStatus({ type: '', message: '' }), 2500)
    }
  }

  const todayRecords = attendanceData.filter(r => r.date && r.date.substring(0, 10) === selectedDate)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700 font-medium cursor-pointer"
            >
              {months.map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-emerald-700">Present</p>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">{monthlyStats.present}</p>
        </motion.div>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-red-700">Absent</p>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{monthlyStats.absent}</p>
        </motion.div>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-orange-700">Late</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">{monthlyStats.late}</p>
        </motion.div>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">Attendance Rate</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{monthlyStats.percentage}%</p>
        </motion.div>
      </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Attendance - {getMonthName(selectedMonth)}</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {monthlyRecords.length > 0 ? (
              monthlyRecords.map((record, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <span className={`flex items-center gap-2 font-semibold px-3 py-1 rounded-full text-sm ${
                    record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                    record.status === 'absent' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {record.status === 'present' ? <CheckCircle className="w-4 h-4" /> :
                     record.status === 'absent' ? <XCircle className="w-4 h-4" /> :
                     <Clock className="w-4 h-4" />}
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No attendance records for this month</p>
              </div>
            )}
          </div>
        </div>
        {status.message && (
          <div
            className={`mt-6 mb-2 p-3 rounded-lg text-sm border ${
              status.type === 'error'
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-emerald-50 border-emerald-300 text-emerald-700'
            }`}
          >
            {status.message}
          </div>
        )}
        {role !== 'student' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Mark Attendance - {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {studentsList.map(student => {
                    const record = todayRecords.find(r => r.studentId === student._id)
                    return (
                      <motion.tr
                        key={student._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">{student._id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.class}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => markAttendance(student, 'present')}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                record?.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => markAttendance(student, 'absent')}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                record?.status === 'absent'
                                  ? 'bg-red-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => markAttendance(student, 'late')}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                record?.status === 'late'
                                  ? 'bg-orange-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700'
                              }`}
                            >
                              Late
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </motion.div>
  )
}

export default Attendance
