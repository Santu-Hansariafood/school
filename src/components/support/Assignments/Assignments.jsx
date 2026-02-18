"use client"
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Upload, CheckCircle, Clock, Users, X, Check, Printer, Edit3 } from 'lucide-react'
import { useApiClient } from '@/components/providers/ApiClientProvider'

const Assignments = ({ role, userId }) => {
  const apiClient = useApiClient()
  const [assignmentList, setAssignmentList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    dueDate: '',
    description: '',
    assignedTo: [],
    createdBy: userId || ''
  })
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedStudents, setSelectedStudents] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [status, setStatus] = useState({ type: '', message: '' })
  const [answers, setAnswers] = useState({})
  const [subjects, setSubjects] = useState([])

  const loadStudents = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/students')
      setStudentsList(res.data || [])
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }, [apiClient])

  const loadSubjects = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/subjects')
      setSubjects(res.data || [])
    } catch (error) {
      console.error('Error loading subjects:', error)
    }
  }, [apiClient])

  const loadAssignments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (role === 'student' && userId) params.set('studentId', userId)
      params.set('withCounts', 'true')
      const res = await apiClient.get(`/api/assignments?${params.toString()}`)
      setAssignmentList(res.data || [])
    } catch (error) {
      console.error('Error loading assignments:', error)
    }
  }, [apiClient, role, userId])

  useEffect(() => {
    loadStudents()
    loadAssignments()
    loadSubjects()
  }, [loadStudents, loadAssignments, loadSubjects])

  const availableClasses = ['all', ...new Set(studentsList.map(s => s.class))]

  const filteredStudents = selectedClass === 'all' 
    ? studentsList
    : studentsList.filter(s => s.class === selectedClass)

  const handleNextStep = () => {
    if (newAssignment.title && newAssignment.subject && newAssignment.dueDate) {
      setCurrentStep(2)
    }
  }

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAllClass = () => {
    const classStudentIds = filteredStudents.map(s => s._id)
    const allSelected = classStudentIds.every(id => selectedStudents.includes(id))
    
    if (allSelected) {
      setSelectedStudents(prev => prev.filter(id => !classStudentIds.includes(id)))
    } else {
      setSelectedStudents(prev => [...new Set([...prev, ...classStudentIds])])
    }
  }

  const handleCreate = async () => {
    if (selectedStudents.length === 0) return
    try {
      const payload = {
        ...newAssignment,
        assignedTo: selectedStudents,
        class: selectedClass === 'all' ? undefined : selectedClass,
      }
      const res = await apiClient.post('/api/assignments', payload)
      setAssignmentList(prev => [res.data, ...prev])
      resetForm()
      setStatus({ type: 'success', message: 'Assignment created' })
    } catch (error) {
      console.error('Error creating assignment:', error)
      setStatus({ type: 'error', message: 'Failed to create assignment' })
    } finally {
      setTimeout(() => setStatus({ type: '', message: '' }), 2500)
    }
  }

  const resetForm = () => {
    setNewAssignment({
      title: '',
      subject: '',
      dueDate: '',
      description: '',
      assignedTo: [],
      createdBy: userId || ''
    })
    setSelectedStudents([])
    setSelectedClass('all')
    setCurrentStep(1)
    setShowForm(false)
  }

  const handleSubmit = async (assignment) => {
    try {
      await apiClient.post(`/api/assignments/${assignment._id}/submissions`, {
        studentId: userId,
        notes: answers[assignment._id] || '',
      })
      setStatus({ type: 'success', message: 'Answer submitted' })
      setAnswers(prev => ({ ...prev, [assignment._id]: '' }))
      setAssignmentList(prev => prev.map(a => a._id === assignment._id ? { ...a, submittedCount: (a.submittedCount || 0) + 1 } : a))
    } catch (error) {
      console.error('Error submitting assignment:', error)
      setStatus({ type: 'error', message: 'Failed to submit assignment' })
    } finally {
      setTimeout(() => setStatus({ type: '', message: '' }), 2500)
    }
  }

  const getAssignedCount = (assignment) => {
    return assignment.assignedTo?.length || 0
  }

  const handlePrint = (assignment) => {
    const w = window.open('', '_blank', 'width=800,height=600')
    if (!w) return
    const title = assignment.title || 'Assignment'
    const subject = assignment.subject || ''
    const due = assignment.dueDate || ''
    const desc = assignment.description || ''
    w.document.write(`<html><head><title>${title}</title><style>
      body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:24px;color:#111827}
      h1{font-size:24px;margin-bottom:4px}
      h2{font-size:16px;margin:0 0 12px 0;color:#4b5563}
      .meta{font-size:13px;margin-bottom:16px;color:#6b7280}
      .box{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-top:16px;min-height:160px}
      .label{font-size:13px;color:#6b7280;margin-bottom:4px}
      pre{white-space:pre-wrap;font-family:inherit;font-size:14px;margin:0}
    </style></head><body>
      <h1>${title}</h1>
      <h2>${subject}</h2>
      <div class="meta">Due: ${due}</div>
      <div>
        <div class="label">Questions / Instructions</div>
        <pre>${desc}</pre>
      </div>
      <div class="box">
        <div class="label">Student Answer</div>
      </div>
    </body></html>`)
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>
        {(role === 'teacher' || role === 'admin') && (
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Assignment
          </button>
        )}
      </div>
      {status.message && (
        <div className={`mb-6 p-3 rounded-lg text-sm border ${status.type === 'error' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'}`}>
          {status.message}
        </div>
      )}

      <AnimatePresence>
        {showForm && (role === 'teacher' || role === 'admin') && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentStep === 1 ? 'Create New Assignment' : 'Assign to Students'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Assignment Details</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Select Students</span>
              </div>
            </div>

            {currentStep === 1 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Algebra Problems" 
                      value={newAssignment.title} 
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}{s.class ? ` (${s.class})` : ''}
                      </option>
                    ))}
                  </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                    <input 
                      type="date" 
                      value={newAssignment.dueDate} 
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Questions / Instructions</label>
                  <textarea 
                    placeholder="Write questions and detailed instructions for the assignment..." 
                    value={newAssignment.description} 
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none" 
                    rows="4"
                  ></textarea>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleNextStep}
                    disabled={!newAssignment.title || !newAssignment.subject || !newAssignment.dueDate}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    Next: Select Students
                  </button>
                  <button 
                    onClick={resetForm} 
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
                  <div className="flex gap-2 flex-wrap">
                    {availableClasses.map(cls => (
                      <button
                        key={cls}
                        onClick={() => setSelectedClass(cls)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedClass === cls 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cls === 'all' ? 'All Classes' : `Class ${cls}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </p>
                  <button
                    onClick={handleSelectAllClass}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {filteredStudents.every(s => selectedStudents.includes(s.id)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg mb-6">
                  <div className="divide-y divide-gray-200">
                    {filteredStudents.map(student => (
                      <label 
                        key={student._id}
                        className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleStudentToggle(student._id)}
                          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-sm text-gray-600">Class {student.class} • {student.email}</p>
                        </div>
                        {selectedStudents.includes(student._id) && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={selectedStudents.length === 0}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    Create & Assign
                  </button>
                  <button 
                    onClick={resetForm} 
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignmentList.map(assignment => (
          <motion.div 
            key={assignment._id || assignment.id} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            whileHover={{ scale: 1.02 }} 
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <button
                type="button"
                onClick={() => handlePrint(assignment)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{assignment.title}</h3>
            <p className="text-sm text-gray-600 mb-1">{assignment.subject}</p>
            <p className="text-xs text-gray-500 mb-3">Due: {assignment.dueDate}</p>
            {assignment.description && (
              <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{assignment.description}</p>
            )}
            {role !== 'student' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pt-3 border-t border-gray-100">
                <Users className="w-4 h-4" />
                <span>{(assignment.assignedTo?.length || 0)} assigned · {(assignment.submittedCount || 0)} submitted</span>
              </div>
            )}
            {role === 'student' && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Write your answer below</p>
                  <textarea
                    value={answers[assignment._id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [assignment._id]: e.target.value }))}
                    rows="4"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none text-sm"
                    placeholder="Type your answer here..."
                  />
                </div>
                <button 
                  onClick={() => handleSubmit(assignment)} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  Submit Answer
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Assignments
