"use client"
import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import RegisterStudent from '@/components/support/Admin/RegisterStudent'
import { useApiClient } from '@/components/providers/ApiClientProvider'
import { useToast } from '@/components/common/Toast/ToastProvider'

export default function ClassesManager() {
  const apiClient = useApiClient()
  const { showToast } = useToast()
  const [classes, setClasses] = useState([])
  const [newClass, setNewClass] = useState('')
  const [showAddClass, setShowAddClass] = useState(false)
  const [activeTab, setActiveTab] = useState('register') // 'register' or 'classes'

  const handleAddClass = (e) => {
    e.preventDefault()
    if (!newClass) return
    if (classes.includes(newClass)) {
      showToast({ type: 'warning', message: 'Class already exists' })
      return
    }
    apiClient.post('/api/classes', { name: newClass })
      .then(res => {
        setClasses(prev => [...prev, res.data.name].sort())
        setNewClass('')
        setShowAddClass(false)
        showToast({ type: 'success', message: 'Class added successfully' })
      })
      .catch(() => {
        showToast({ type: 'error', message: 'Failed to add class' })
      })
  }

  useEffect(() => {
    apiClient.get('/api/classes')
      .then(res => {
        const names = (res.data || []).map(c => c.name)
        setClasses(names.sort())
      })
      .catch(() => {
        showToast({ type: 'error', message: 'Failed to load classes' })
      })
  }, [apiClient])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Class Management</h2>
        <button
          onClick={() => setShowAddClass(!showAddClass)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showAddClass ? <X size={20} /> : <Plus size={20} />}
          {showAddClass ? 'Cancel' : 'Add New Class'}
        </button>
      </div>

      {showAddClass && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4">Add New Class</h3>
          <form onSubmit={handleAddClass} className="flex gap-4">
            <input
              type="text"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="e.g. 11-A"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newClass}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Class
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'register' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Register Student
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'classes' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Available Classes
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'register' ? (
            <RegisterStudent availableClasses={classes} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {classes.map((cls) => (
                <div key={cls} className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center font-semibold text-gray-700 hover:bg-white hover:shadow-md transition">
                  {cls}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
