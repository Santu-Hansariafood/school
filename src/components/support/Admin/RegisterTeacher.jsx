import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { teachers, registeredTeachers } from '@/data/mockData'

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

export default RegisterTeacher

