"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Edit, Trash2 } from 'lucide-react'
import { useApiClient } from '@/components/providers/ApiClientProvider'

const RegisterAdmin = () => {
  const apiClient = useApiClient()
  const [adminsList, setAdminsList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })

  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: ''
  }

  const [formData, setFormData] = useState(initialFormState)

  const fetchAdmins = async () => {
    try {
      const response = await apiClient.get('/api/admins')
      setAdminsList(response.data)
    } catch (error) {
      console.error('Error fetching admins:', error)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: '', message: '' })

    try {
      if (isEditing) {
        await apiClient.put(`/api/admins/${editId}`, formData)
        setStatus({ type: 'success', message: 'Admin updated successfully!' })
      } else {
        await apiClient.post('/api/admins', formData)
        setStatus({ type: 'success', message: 'Admin registered successfully!' })
      }
      setFormData(initialFormState)
      setIsEditing(false)
      setEditId(null)
      fetchAdmins()
    } catch (error) {
      console.error('Error saving admin:', error)
      setStatus({ type: 'error', message: error.response?.data?.message || 'Something went wrong' })
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus({ type: '', message: '' }), 3000)
    }
  }

  const handleEdit = (admin) => {
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      address: admin.address,
      dateOfBirth: admin.dateOfBirth ? admin.dateOfBirth.split('T')[0] : '',
      gender: admin.gender
    })
    setIsEditing(true)
    setEditId(admin._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return
    try {
      await apiClient.delete(`/api/admins/${id}`)
      fetchAdmins()
      setStatus({ type: 'success', message: 'Admin deleted successfully!' })
    } catch (error) {
      console.error('Error deleting admin:', error)
      setStatus({ type: 'error', message: 'Failed to delete admin' })
    } finally {
      setTimeout(() => setStatus({ type: '', message: '' }), 3000)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Admin' : 'Register New Admin'}
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
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter admin full name" />
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
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="admin@school.com" />
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
              {isLoading ? 'Saving...' : (isEditing ? 'Update Admin' : 'Register Admin')}
              {!isLoading && <UserPlus className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Registered Admins</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 font-semibold text-gray-700">Name</th>
                <th className="p-3 font-semibold text-gray-700">Email</th>
                <th className="p-3 font-semibold text-gray-700">Phone</th>
                <th className="p-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminsList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">No admins found.</td>
                </tr>
              ) : (
                adminsList.map(admin => (
                  <tr key={admin._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{admin.name}</td>
                    <td className="p-3">{admin.email}</td>
                    <td className="p-3">{admin.phone}</td>
                    <td className="p-3 flex gap-2">
                      <button 
                        onClick={() => handleEdit(admin)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(admin._id)}
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

export default RegisterAdmin
