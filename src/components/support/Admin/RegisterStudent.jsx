import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { students, registeredStudents } from '@/data/mockData'

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
                    {['9-A', '9-B', '10-A', '10-B', '11-A', '11-B', '12-A', '12-B'].map(cls => (
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

export default RegisterStudent

