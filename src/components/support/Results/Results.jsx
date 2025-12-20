import { useState, useEffect, useCallback, startTransition } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, TrendingUp, Award, X } from 'lucide-react'
import { useApiClient } from '@/components/providers/ApiClientProvider'
import { useAuth } from '@/app/providers/AuthProvider'

const Results = ({ role }) => {
  const apiClient = useApiClient()
  const { user } = useAuth()
  const [studentsList, setStudentsList] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [resultsList, setResultsList] = useState([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingMarks, setEditingMarks] = useState({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fetchStudents = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/students')
      const list = res.data || []
      startTransition(() => {
        setStudentsList(list)
      })
      if (role === 'student') {
        const byEmail = user?.email ? list.find(s => s.email === user.email) : null
        startTransition(() => {
          setSelectedStudent(byEmail?._id || list[0]?._id || '')
        })
      } else {
        startTransition(() => {
          setSelectedStudent(list[0]?._id || '')
        })
      }
    } catch (error) {
      console.error('Error loading students for results:', error)
    }
  }, [apiClient, role, user])

  const fetchResults = useCallback(async (studentId) => {
    if (!studentId) return
    try {
      const res = await apiClient.get(`/api/results?studentId=${studentId}`)
      startTransition(() => {
        setResultsList(res.data || [])
      })
    } catch (error) {
      console.error('Error loading results:', error)
    }
  }, [apiClient])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  useEffect(() => {
    fetchResults(selectedStudent)
  }, [selectedStudent, fetchResults])

  const calculateAverage = () => {
    if (resultsList.length === 0) return 0
    const total = resultsList.reduce((sum, r) => sum + (r.marks || 0), 0)
    return (total / resultsList.length).toFixed(1)
  }

  const getGrade = (marks) => {
    if (marks >= 90) return 'A+'
    if (marks >= 80) return 'A'
    if (marks >= 70) return 'B+'
    if (marks >= 60) return 'B'
    if (marks >= 50) return 'C'
    return 'F'
  }

  const openEditModal = () => {
    const marksData = {}
    resultsList.forEach(result => {
      marksData[result.subject] = result.marks
    })
    setEditingMarks(marksData)
    setEditModalOpen(true)
    setSaveError('')
  }

  const handleMarkChange = (subject, value) => {
    const numValue = parseInt(value)
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      setEditingMarks(prev => ({ ...prev, [subject]: value === '' ? '' : numValue }))
      setSaveError('')
    } else {
      setSaveError('Marks must be between 0 and 100')
    }
  }

  const saveMarks = async () => {
    const hasEmptyFields = Object.values(editingMarks).some(mark => mark === '')
    if (hasEmptyFields) {
      setSaveError('Please fill all marks fields')
      return
    }

    const hasInvalidMarks = Object.values(editingMarks).some(mark => mark < 0 || mark > 100)
    if (hasInvalidMarks) {
      setSaveError('All marks must be between 0 and 100')
      return
    }

    try {
      const records = Object.entries(editingMarks).map(([subject, marks]) => ({ subject, marks }))
      await apiClient.post('/api/results', { studentId: selectedStudent, records })
      setSaveSuccess(true)
      await fetchResults(selectedStudent)
      setTimeout(() => {
        setSaveSuccess(false)
        setEditModalOpen(false)
      }, 1500)
    } catch (error) {
      console.error('Error saving marks:', error)
      setSaveError('Failed to save marks')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Academic Results</h1>
        {role !== 'student' && (
          <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            {studentsList.map(student => (
              <option key={student._id} value={student._id}>{student.name}</option>
            ))}
          </select>
        )}
      </div>

      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-lg flex items-center justify-between"
        >
          <span>Marks updated successfully!</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8" />
            <span className="text-3xl font-bold">{resultsList.length}</span>
          </div>
          <p className="text-blue-100">Total Subjects</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8" />
            <span className="text-3xl font-bold">{calculateAverage()}</span>
          </div>
          <p className="text-emerald-100">Average Marks</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8" />
            <span className="text-3xl font-bold">{getGrade(calculateAverage())}</span>
          </div>
          <p className="text-purple-100">Overall Grade</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Subject-wise Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Marks Obtained</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Total Marks</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Percentage</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resultsList.map((result, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{result.subject}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700">{result.marks}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">100</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700">{result.marks}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${result.marks >= 80 ? 'bg-emerald-100 text-emerald-700' : result.marks >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {getGrade(result.marks)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {(role === 'teacher' || role === 'admin') && (
          <button
            onClick={openEditModal}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Marks
          </button>
        )}
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Student Marks</h2>
              <button
                onClick={() => {
                  setEditModalOpen(false)
                  setSaveError('')
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {saveError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {saveError}
                </div>
              )}

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Student</p>
                <p className="font-semibold text-gray-800">
                  {studentsList.find(s => s._id === selectedStudent)?.name}
                </p>
              </div>

              <div className="space-y-4">
                {resultsList.map((result, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700">
                        {result.subject}
                      </label>
                      <span className="text-xs text-gray-500">Max: 100</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingMarks[result.subject] ?? ''}
                      onChange={(e) => handleMarkChange(result.subject, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter marks (0-100)"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Current: {result.marks}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        (editingMarks[result.subject] ?? result.marks) >= 80
                          ? 'bg-emerald-100 text-emerald-700'
                          : (editingMarks[result.subject] ?? result.marks) >= 60
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        Grade: {getGrade(editingMarks[result.subject] ?? result.marks)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setEditModalOpen(false)
                    setSaveError('')
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveMarks}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default Results
