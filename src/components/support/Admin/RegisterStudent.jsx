import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Edit, Trash2 } from 'lucide-react'
import { useApiClient } from '@/components/providers/ApiClientProvider'
import { classes as mockClasses } from '@/data/mockData'

const RegisterStudent = ({ availableClasses }) => {
  const apiClient = useApiClient()
  const [studentsList, setStudentsList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  
  const initialFormState = {
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
  }
  
  const [formData, setFormData] = useState(initialFormState)
  const [status, setStatus] = useState({ type: '', message: '' })

  const fetchStudents = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/students')
      setStudentsList(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }, [apiClient])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: '', message: '' })
    
    try {
      if (isEditing) {
        await apiClient.put(`/api/students/${editId}`, formData)
        setStatus({ type: 'success', message: 'Student updated successfully!' })
      } else {
        await apiClient.post('/api/students', formData)
        setStatus({ type: 'success', message: 'Student registered successfully!' })
      }
      
      setFormData(initialFormState)
      setIsEditing(false)
      setEditId(null)
      fetchStudents()
    } catch (error) {
      console.error('Error saving student:', error)
      setStatus({ type: 'error', message: error.response?.data?.message || 'Something went wrong' })
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus({ type: '', message: '' }), 3000)
    }
  }

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      class: student.class,
      email: student.email,
      phone: student.phone,
      address: student.address,
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      gender: student.gender,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      previousSchool: student.previousSchool || '',
      admissionDate: student.admissionDate ? student.admissionDate.split('T')[0] : ''
    })
    setIsEditing(true)
    setEditId(student._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return
    
    try {
      await apiClient.delete(`/api/students/${id}`)
      fetchStudents()
      setStatus({ type: 'success', message: 'Student deleted successfully!' })
    } catch (error) {
      console.error('Error deleting student:', error)
      setStatus({ type: 'error', message: 'Failed to delete student' })
    } finally {
      setTimeout(() => setStatus({ type: '', message: '' }), 3000)
    }
  }

  const [classOptions, setClassOptions] = useState(availableClasses || mockClasses)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await apiClient.get('/api/classes')
        const names = (res.data || []).map(c => c.name)
        if (names.length > 0) setClassOptions(names)
      } catch {
        setClassOptions(availableClasses || mockClasses)
      }
    }
    fetchClasses()
  }, [apiClient, availableClasses])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Student' : 'Register New Student'}
      </h1>

      {status.message && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className={`mb-6 p-4 border rounded-lg ${
            status.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-emerald-100 border-emerald-400 text-emerald-700'
          }`}
        >
          {status.message}
        </motion.div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
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
            <button type="button" onClick={() => {
              setFormData(initialFormState)
              setIsEditing(false)
              setEditId(null)
            }} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              {isLoading ? 'Saving...' : (isEditing ? 'Update Student' : 'Register Student')}
              {!isLoading && <UserPlus className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>

      {/* List of Registered Students */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Registered Students</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 font-semibold text-gray-700">Name</th>
                <th className="p-3 font-semibold text-gray-700">Class</th>
                <th className="p-3 font-semibold text-gray-700">Email</th>
                <th className="p-3 font-semibold text-gray-700">Parent</th>
                <th className="p-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentsList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">No students found.</td>
                </tr>
              ) : (
                studentsList.map(student => (
                  <tr key={student._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">{student.class}</td>
                    <td className="p-3">{student.email}</td>
                    <td className="p-3">{student.parentName}</td>
                    <td className="p-3 flex gap-2">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(student._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RegisterStudent
