import { useState, useEffect, useCallback, useMemo, startTransition } from 'react'
import { motion } from 'framer-motion'
import { useApiClient } from '@/components/providers/ApiClientProvider'
import { useToast } from '@/components/common/Toast/ToastProvider'

const AssignStudents = () => {
  const apiClient = useApiClient()
  const { showToast } = useToast()
  const [selectedClass, setSelectedClass] = useState('all')
  const [studentAssignments, setStudentAssignments] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [teachersList, setTeachersList] = useState([])

  const loadStudents = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/students')
      const list = res.data || []
      startTransition(() => {
        setStudentsList(list)
      })
    } catch (error) {
      console.error('Error loading students for assignment:', error)
      showToast({ type: 'error', message: 'Failed to load students' })
    }
  }, [apiClient, showToast])

  const loadTeachers = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/teachers')
      const list = res.data || []
      startTransition(() => {
        setTeachersList(list)
      })
    } catch (error) {
      console.error('Error loading teachers for assignment:', error)
      showToast({ type: 'error', message: 'Failed to load teachers' })
    }
  }, [apiClient, showToast])

  useEffect(() => {
    loadStudents()
    loadTeachers()
  }, [loadStudents, loadTeachers])

  const classes = useMemo(
    () => ['all', ...new Set(studentsList.map(s => s.class))],
    [studentsList]
  )

  const filteredStudents = selectedClass === 'all'
    ? studentsList
    : studentsList.filter(s => s.class === selectedClass)

  const availableTeachers = teachersList.filter(
    t => selectedClass === 'all' || t.assignedClasses?.includes(selectedClass)
  )

  const handleAssign = (studentId, teacherId) => {
    setStudentAssignments(prev => {
      const existing = prev.find(a => a.studentId === studentId)
      if (existing) {
        return prev.map(a => a.studentId === studentId ? { ...a, teacherId } : a)
      }
      return [...prev, { studentId, teacherId }]
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Assign Students to Teachers</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          {classes.map(cls => (
            <option key={cls} value={cls}>{cls === 'all' ? 'All Classes' : `Class ${cls}`}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Students ({filteredStudents.length})</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredStudents.map(student => {
              const assignment = studentAssignments.find(a => a.studentId === student._id)
              const assignedTeacher = assignment ? teachersList.find(t => t._id === assignment.teacherId) : null

              return (
                <motion.div key={student._id} whileHover={{ scale: 1.02 }} className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.class}</p>
                    </div>
                    {assignedTeacher && (
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        Assigned
                      </span>
                    )}
                  </div>
                  {assignedTeacher && (
                    <p className="text-sm text-gray-600 mt-2">Teacher: {assignedTeacher.name}</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Teachers</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableTeachers.map(teacher => {
              const assignedCount = studentAssignments.filter(a => a.teacherId === teacher._id).length

              return (
                <motion.div key={teacher._id} whileHover={{ scale: 1.02 }} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{teacher.name}</p>
                      <p className="text-sm text-gray-600">{teacher.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Classes: {teacher.assignedClasses?.join(', ') || 'None'}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {assignedCount} students
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Assign</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onChange={(e) => {
              const studentId = e.target.value
              if (studentId) {
                const teacherSelect = document.getElementById('teacher-select')
                teacherSelect.dataset.studentId = studentId
              }
            }}>
              <option value="">Choose a student...</option>
              {filteredStudents.map(s => (
                <option key={s._id} value={s._id}>{s.name} - {s.class}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Teacher</label>
            <select id="teacher-select" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onChange={(e) => {
              const teacherId = e.target.value
              const studentId = e.target.dataset.studentId
              if (studentId && teacherId) {
                handleAssign(studentId, teacherId)
              }
            }}>
              <option value="">Choose a teacher...</option>
              {availableTeachers.map(t => (
                <option key={t._id} value={t._id}>{t.name} - {t.subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignStudents
