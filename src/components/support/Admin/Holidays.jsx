"use client"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Calendar, Trash2, Plus, Info } from "lucide-react"
import { useApiClient } from "@/components/providers/ApiClientProvider"
import { useToast } from "@/components/common/Toast/ToastProvider"

const Holidays = () => {
  const apiClient = useApiClient()
  const { showToast } = useToast()

  const [holidays, setHolidays] = useState([])
  const [date, setDate] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const loadHolidays = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/holidays")
      setHolidays(res.data || [])
    } catch (error) {
      console.error("Error loading holidays:", error)
      showToast({ type: "error", message: "Failed to load holidays" })
    }
  }, [apiClient, showToast])

  useEffect(() => {
    loadHolidays()
  }, [loadHolidays])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!date || !name.trim()) {
      showToast({ type: "error", message: "Please enter date and holiday name" })
      return
    }
    setIsSaving(true)
    try {
      const res = await apiClient.post("/api/holidays", {
        date,
        name: name.trim(),
        description: description.trim(),
      })
      const updated = holidays.filter((h) => h._id !== res.data._id)
      setHolidays(
        [...updated, res.data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      )
      setName("")
      setDescription("")
      showToast({ type: "success", message: "Holiday saved" })
    } catch (error) {
      console.error("Error saving holiday:", error)
      showToast({ type: "error", message: "Failed to save holiday" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return
    try {
      await apiClient.delete(`/api/holidays/${id}`)
      setHolidays((prev) => prev.filter((h) => h._id !== id))
      showToast({ type: "success", message: "Holiday deleted" })
    } catch (error) {
      console.error("Error deleting holiday:", error)
      showToast({ type: "error", message: "Failed to delete holiday" })
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">School Holidays</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Add Holiday
        </h2>
        <p className="text-xs text-gray-500 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-400" />
          Days added here will be treated as holidays. Attendance will not accept present on these dates.
        </p>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Independence Day"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short note shown to students and teachers"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Holiday"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Upcoming Holidays
          </h2>
        </div>
        <div className="space-y-3">
          {holidays.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming holidays configured.</p>
          ) : (
            holidays.map((holiday) => (
              <motion.div
                key={holiday._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{holiday.name}</p>
                  <p className="text-xs text-gray-500">
                    {holiday.date ? new Date(holiday.date).toLocaleDateString() : ""}
                    {holiday.description ? ` • ${holiday.description}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(holiday._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Holidays

