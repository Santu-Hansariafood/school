import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Edit, Trash2 } from 'lucide-react'
import { useApiClient } from '@/components/providers/ApiClientProvider'
import { students as mockStudents, teachers as mockTeachers } from '@/data/mockData'

const RegisterTeacher = () => {
  const apiClient = useApiClient()
  const [teachersList, setTeachersList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })

  const initialFormState = {
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
  }

  const [formData, setFormData] = useState(initialFormState)
  const [classOptions, setClassOptions] = useState([])

  useEffect(() => {
    fetchTeachers()
    const fetchClasses = async () => {
      try {
        const res = await apiClient.get('/api/classes')
        const names = (res.data || []).map(c => c.name)
        setClassOptions(names.length > 0 ? names : Array.from(new Set([
          ...mockStudents.map(s => s.class),
          ...mockTeachers.flatMap(t => t.assignedClasses || [])
        ])).sort())
      } catch {
        setClassOptions(Array.from(new Set([
          ...mockStudents.map(s => s.class),
          ...mockTeachers.flatMap(t => t.assignedClasses || [])
        ])).sort())
      }
    }
    fetchClasses()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await apiClient.get('/api/teachers')
      setTeachersList(response.data)
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: '', message: '' })

    try {
      if (isEditing) {
        await apiClient.put(`/api/teachers/${editId}`, formData)
        setStatus({ type: 'success', message: 'Teacher updated successfully!' })
      } else {
        await apiClient.post('/api/teachers', formData)
        setStatus({ type: 'success', message: 'Teacher registered successfully!' })
      }
      
      setFormData(initialFormState)
      setIsEditing(false)
      setEditId(null)
      fetchTeachers()
    } catch (error) {
      console.error('Error saving teacher:', error)
      setStatus({ type: 'error', message: error.response?.data?.message || 'Something went wrong' })
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus({ type: '', message: '' }), 3000)
    }
  }

  const handleEdit = (teacher) => {
    setFormData({
      name: teacher.name,
      subject: teacher.subject,
      email: teacher.email,
      phone: teacher.phone,
      address: teacher.address,
      dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.split('T')[0] : '',
      gender: teacher.gender,
      experience: teacher.experience,
      assignedClasses: teacher.assignedClasses || [],
      qualifications: teacher.qualifications && teacher.qualifications.length > 0 
        ? teacher.qualifications 
        : [{ degree: '', institution: '', year: '' }]
    })
    setIsEditing(true)
    setEditId(teacher._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return

    try {
      await apiClient.delete(`/api/teachers/${id}`)
      fetchTeachers()
      setStatus({ type: 'success', message: 'Teacher deleted successfully!' })
    } catch (error) {
      console.error('Error deleting teacher:', error)
      setStatus({ type: 'error', message: 'Failed to delete teacher' })
    } finally {
      setTimeout(() => setStatus({ type: '', message: '' }), 3000)
    }
  }

  

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Teacher' : 'Register New Teacher'}
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
                  <select
                    multiple
                    value={formData.assignedClasses}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions).map(o => o.value)
                      setFormData({ ...formData, assignedClasses: values })
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-32"
                  >
                    {classOptions.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple classes</p>
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
            <button type="button" onClick={() => {
              setFormData(initialFormState)
              setIsEditing(false)
              setEditId(null)
            }} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              {isLoading ? 'Saving...' : (isEditing ? 'Update Teacher' : 'Register Teacher')}
              {!isLoading && <UserPlus className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>

      {/* List of Registered Teachers */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Registered Teachers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 font-semibold text-gray-700">Name</th>
                <th className="p-3 font-semibold text-gray-700">Subject</th>
                <th className="p-3 font-semibold text-gray-700">Email</th>
                <th className="p-3 font-semibold text-gray-700">Classes</th>
                <th className="p-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachersList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">No teachers found.</td>
                </tr>
              ) : (
                teachersList.map(teacher => (
                  <tr key={teacher._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{teacher.name}</td>
                    <td className="p-3">{teacher.subject}</td>
                    <td className="p-3">{teacher.email}</td>
                    <td className="p-3">
                      {teacher.assignedClasses?.length > 0 
                        ? teacher.assignedClasses.join(', ') 
                        : 'None'}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button 
                        onClick={() => handleEdit(teacher)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher._id)}
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

export default RegisterTeacher
