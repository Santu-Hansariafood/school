import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Upload, CheckCircle, Clock, Users, X, Check } from 'lucide-react'
import { assignments as initialAssignments, students, teachers } from '@/data/mockData'

const Assignments = ({ role, userId }) => {
  const [assignmentList, setAssignmentList] = useState(initialAssignments)
  const [showForm, setShowForm] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', 
    subject: '', 
    dueDate: '', 
    description: '',
    assignedTo: [],
    createdBy: userId || 'T001'
  })
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedStudents, setSelectedStudents] = useState([])

  const currentTeacher = teachers.find(t => t.id === (userId || 'T001'))
  const teacherClasses = currentTeacher?.assignedClasses || ['10-A', '10-B', '9-A']
  const availableClasses = ['all', ...teacherClasses]

  const filteredStudents = selectedClass === 'all' 
    ? students.filter(s => teacherClasses.includes(s.class))
    : students.filter(s => s.class === selectedClass)

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
    const classStudentIds = filteredStudents.map(s => s.id)
    const allSelected = classStudentIds.every(id => selectedStudents.includes(id))
    
    if (allSelected) {
      setSelectedStudents(prev => prev.filter(id => !classStudentIds.includes(id)))
    } else {
      setSelectedStudents(prev => [...new Set([...prev, ...classStudentIds])])
    }
  }

  const handleCreate = () => {
    if (selectedStudents.length > 0) {
      const assignment = {
        id: assignmentList.length + 1,
        ...newAssignment,
        assignedTo: selectedStudents,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      setAssignmentList([...assignmentList, assignment])
      resetForm()
    }
  }

  const resetForm = () => {
    setNewAssignment({ 
      title: '', 
      subject: '', 
      dueDate: '', 
      description: '',
      assignedTo: [],
      createdBy: userId || 'T001'
    })
    setSelectedStudents([])
    setSelectedClass('all')
    setCurrentStep(1)
    setShowForm(false)
  }

  const handleSubmit = (id) => {
    setAssignmentList(prev => prev.map(a => a.id === id ? { ...a, status: 'submitted' } : a))
  }

  const getAssignedCount = (assignment) => {
    return assignment.assignedTo?.length || 0
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>
        {role === 'teacher' && (
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Assignment
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && role === 'teacher' && (
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
                    <input 
                      type="text" 
                      placeholder="e.g., Mathematics" 
                      value={newAssignment.subject} 
                      onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })} 
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    placeholder="Provide detailed instructions for the assignment..." 
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
                        key={student.id}
                        className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentToggle(student.id)}
                          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-sm text-gray-600">Class {student.class} • {student.email}</p>
                        </div>
                        {selectedStudents.includes(student.id) && (
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
            key={assignment.id} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            whileHover={{ scale: 1.02 }} 
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                assignment.status === 'submitted' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {assignment.status === 'submitted' ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />Submitted
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />Pending
                  </span>
                )}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{assignment.title}</h3>
            <p className="text-sm text-gray-600 mb-1">{assignment.subject}</p>
            <p className="text-xs text-gray-500 mb-3">Due: {assignment.dueDate}</p>
            {assignment.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
            )}
            {role === 'teacher' && assignment.assignedTo && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pt-3 border-t border-gray-100">
                <Users className="w-4 h-4" />
                <span>{getAssignedCount(assignment)} student{getAssignedCount(assignment) !== 1 ? 's' : ''} assigned</span>
              </div>
            )}
            {role === 'student' && assignment.status === 'pending' && (
              <button 
                onClick={() => handleSubmit(assignment.id)} 
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                Submit Assignment
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Assignments
