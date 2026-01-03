import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, DollarSign, Calendar, FileText, BarChart3, UserPlus, BookPlus } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import Attendance from '../components/Attendance'
import Assignments from '../components/Assignments'
import Results from '../components/Results'
import Library from '../components/Library'
import Fees from '../components/Fees'
import { students, teachers, assignments, libraryBooks, registeredStudents, registeredTeachers, bookIssuanceRecords } from '../data/mockData'

const AdminDashboard = ({ user, onLogout }) => {
  const apiClient = useApiClient()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    assignmentsCount: 0,
    libraryBooksCount: 0
  })
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, assignmentsRes, booksRes] = await Promise.all([
          apiClient.get('/api/students'),
          apiClient.get('/api/teachers'),
          apiClient.get('/api/assignments'),
          apiClient.get('/api/library/books')
        ])
        
        setDashboardStats({
          studentsCount: studentsRes.data?.length || 0,
          teachersCount: teachersRes.data?.length || 0,
          assignmentsCount: assignmentsRes.data?.length || 0,
          libraryBooksCount: booksRes.data?.length || 0
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      }
    }
    
    fetchStats()
  }, [apiClient])

  const [selectedClass, setSelectedClass] = useState('all')
  const [studentAssignments, setStudentAssignments] = useState([])
  const classes = ['all', ...new Set(students.map(s => s.class))]

  const classOptions = Array.from(new Set([
    ...students.map(s => s.class),
    ...teachers.flatMap(t => t.assignedClasses || [])
  ])).sort()

  const RegisterStudent = () => {
    const [formData, setFormData] = useState({
      name: '',
      class: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      previousSchool: '',
      admissionDate: ''
    })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      const newStudent = {
        id: `S${String(students.length + 1).padStart(3, '0')}`,
        ...formData,
        registeredAt: new Date().toISOString()
      }
      registeredStudents.push(newStudent)
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          name: '',
          class: '',
          email: '',
          phone: '',
          address: '',
          dateOfBirth: '',
          gender: '',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          previousSchool: '',
          admissionDate: ''
        })
      }, 3000)
    }

    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Register New Student</h1>
        
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-lg">
            Student registered successfully! ID: {`S${String(students.length + 1).padStart(3, '0')}`}
          </motion.div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter student full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="student@school.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+1-555-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Full residential address"></textarea>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h3>
                <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                  <select name="class" value={formData.class} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Class</option>
                    {classOptions.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date *</label>
                    <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Previous School</label>
                    <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Name of previous school" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Parent/Guardian Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                    <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone *</label>
                    <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+1-555-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                    <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="parent@email.com" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => setFormData({
                name: '',
                class: '',
                email: '',
                phone: '',
                address: '',
                dateOfBirth: '',
                gender: '',
                parentName: '',
                parentPhone: '',
                parentEmail: '',
                previousSchool: '',
                admissionDate: ''
              })} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Reset
              </button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Register Student
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const RegisterTeacher = () => {
    const [formData, setFormData] = useState({
      name: '',
      subject: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      experience: '',
      assignedClasses: [],
      qualifications: [{ degree: '', institution: '', year: '' }]
    })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleClassSelection = (cls) => {
      setFormData(prev => ({
        ...prev,
        assignedClasses: prev.assignedClasses.includes(cls)
          ? prev.assignedClasses.filter(c => c !== cls)
          : [...prev.assignedClasses, cls]
      }))
    }

    const handleQualificationChange = (index, field, value) => {
      const newQualifications = [...formData.qualifications]
      newQualifications[index][field] = value
      setFormData({ ...formData, qualifications: newQualifications })
    }

    const addQualification = () => {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, { degree: '', institution: '', year: '' }]
      })
    }

    const removeQualification = (index) => {
      setFormData({
        ...formData,
        qualifications: formData.qualifications.filter((_, i) => i !== index)
      })
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      const newTeacher = {
        id: `T${String(teachers.length + 1).padStart(3, '0')}`,
        ...formData,
        registeredAt: new Date().toISOString()
      }
      registeredTeachers.push(newTeacher)
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          name: '',
          subject: '',
          email: '',
          phone: '',
          address: '',
          dateOfBirth: '',
          gender: '',
          experience: '',
          assignedClasses: [],
          qualifications: [{ degree: '', institution: '', year: '' }]
        })
      }, 3000)
    }

    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Register New Teacher</h1>
        
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-lg">
            Teacher registered successfully! ID: {`T${String(teachers.length + 1).padStart(3, '0')}`}
          </motion.div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter teacher full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="teacher@school.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+1-555-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Full residential address"></textarea>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Specialization *</label>
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Mathematics, Physics" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                    <input type="text" name="experience" value={formData.experience} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 5 Years" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Classes</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['9-A', '9-B', '10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(cls => (
                        <label key={cls} className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50">
                          <input type="checkbox" checked={formData.assignedClasses.includes(cls)} onChange={() => handleClassSelection(cls)} className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{cls}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Qualifications</h3>
                <div className="space-y-4">
                  {formData.qualifications.map((qual, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">Qualification {index + 1}</span>
                        {formData.qualifications.length > 1 && (
                          <button type="button" onClick={() => removeQualification(index)} className="text-red-600 text-sm hover:text-red-700">
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input type="text" value={qual.degree} onChange={(e) => handleQualificationChange(index, 'degree', e.target.value)} placeholder="Degree (e.g., M.Sc. Mathematics)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        <input type="text" value={qual.institution} onChange={(e) => handleQualificationChange(index, 'institution', e.target.value)} placeholder="Institution name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        <input type="text" value={qual.year} onChange={(e) => handleQualificationChange(index, 'year', e.target.value)} placeholder="Year (e.g., 2015)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addQualification} className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm">
                    + Add Another Qualification
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => setFormData({
                name: '',
                subject: '',
                email: '',
                phone: '',
                address: '',
                dateOfBirth: '',
                gender: '',
                experience: '',
                assignedClasses: [],
                qualifications: [{ degree: '', institution: '', year: '' }]
              })} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Reset
              </button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Register Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const IssueBooks = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [selectedBook, setSelectedBook] = useState(null)
    const [dueDate, setDueDate] = useState('')
    const [issued, setIssued] = useState(false)

    const availableBooks = libraryBooks.filter(book => book.status === 'available')
    const filteredStudents = students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleIssue = () => {
      if (selectedStudent && selectedBook && dueDate) {
        const issuanceRecord = {
          id: `ISS${String(bookIssuanceRecords.length + 1).padStart(3, '0')}`,
          bookId: selectedBook.id,
          studentId: selectedStudent.id,
          issuedDate: new Date().toISOString().split('T')[0],
          dueDate: dueDate,
          status: 'issued'
        }
        bookIssuanceRecords.push(issuanceRecord)
        
        const book = libraryBooks.find(b => b.id === selectedBook.id)
        if (book) {
          book.status = 'issued'
          book.issuedTo = selectedStudent.id
          book.dueDate = dueDate
        }
        
        setIssued(true)
        setTimeout(() => {
          setIssued(false)
          setSelectedStudent(null)
          setSelectedBook(null)
          setDueDate('')
          setSearchTerm('')
        }, 3000)
      }
    }

    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Issue Books</h1>
        
        {issued && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-lg">
            Book issued successfully! Due date: {dueDate}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Search Student</h2>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or ID..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4" />
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStudents.map(student => (
                  <motion.div key={student.id} whileHover={{ scale: 1.02 }} onClick={() => setSelectedStudent(student)} className={`p-3 border rounded-lg cursor-pointer transition ${
                    selectedStudent?.id === student.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-400'
                  }`}>
                    <p className="font-semibold text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.id} - {student.class}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Books ({availableBooks.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {availableBooks.map(book => (
                  <motion.div key={book.id} whileHover={{ scale: 1.02 }} onClick={() => setSelectedBook(book)} className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedBook?.id === book.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-400'
                  }`}>
                    <p className="font-semibold text-gray-800">{book.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{book.author}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {book.id}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedStudent && selectedBook && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Issue Details</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Student</p>
                    <p className="font-semibold text-gray-800">{selectedStudent.name} ({selectedStudent.id})</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Book</p>
                    <p className="font-semibold text-gray-800">{selectedBook.title}</p>
                    <p className="text-sm text-gray-600">by {selectedBook.author}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <button onClick={handleIssue} disabled={!dueDate} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <BookPlus className="w-5 h-5" />
                    Issue Book
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const AssignStudents = () => {
    const filteredStudents = selectedClass === 'all' ? students : students.filter(s => s.class === selectedClass)
    const availableTeachers = teachers.filter(t => selectedClass === 'all' || t.assignedClasses?.includes(selectedClass))

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
                const assignment = studentAssignments.find(a => a.studentId === student.id)
                const assignedTeacher = assignment ? teachers.find(t => t.id === assignment.teacherId) : null

                return (
                  <motion.div key={student.id} whileHover={{ scale: 1.02 }} className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition">
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
                const assignedCount = studentAssignments.filter(a => a.teacherId === teacher.id).length

                return (
                  <motion.div key={teacher.id} whileHover={{ scale: 1.02 }} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer">
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
                  <option key={s.id} value={s.id}>{s.name} - {s.class}</option>
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
                  <option key={t.id} value={t.id}>{t.name} - {t.subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const menuItems = [
    { icon: BarChart3, label: 'Overview', path: '/admin' },
    { icon: Calendar, label: 'Attendance', path: '/admin/attendance' },
    { icon: FileText, label: 'Assignments', path: '/admin/assignments' },
    { icon: BookOpen, label: 'Results', path: '/admin/results' },
    { icon: BookOpen, label: 'Library', path: '/admin/library' },
    { icon: DollarSign, label: 'Fees', path: '/admin/fees' },
    { icon: Users, label: 'Assign Students', path: '/admin/assign' },
    { icon: UserPlus, label: 'Register Student', path: '/admin/register-student' },
    { icon: UserPlus, label: 'Register Teacher', path: '/admin/register-teacher' },
    { icon: BookPlus, label: 'Issue Books', path: '/admin/issue-books' },
  ]

  const stats = [
    { icon: Users, label: 'Total Students', value: students.length, color: 'blue' },
    { icon: Users, label: 'Total Teachers', value: teachers.length, color: 'emerald' },
    { icon: FileText, label: 'Assignments', value: assignments.length, color: 'purple' },
    { icon: BookOpen, label: 'Library Books', value: libraryBooks.length, color: 'orange' }
  ]

  const Overview = () => (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activities</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <p className="text-sm text-gray-700">New assignment posted in Class {i}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Attendance Rate</span>
              <span className="font-semibold text-emerald-600">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Fees</span>
              <span className="font-semibold text-orange-600">$12,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Classes</span>
              <span className="font-semibold text-blue-600">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Books Issued</span>
              <span className="font-semibold text-purple-600">156</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} user={user} onLogout={onLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/attendance" element={<Attendance role="admin" />} />
          <Route path="/assignments" element={<Assignments role="admin" />} />
          <Route path="/results" element={<Results role="admin" />} />
          <Route path="/library" element={<Library role="admin" />} />
          <Route path="/fees" element={<Fees role="admin" />} />
          <Route path="/assign" element={<AssignStudents />} />
          <Route path="/register-student" element={<RegisterStudent />} />
          <Route path="/register-teacher" element={<RegisterTeacher />} />
          <Route path="/issue-books" element={<IssueBooks />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminDashboard
