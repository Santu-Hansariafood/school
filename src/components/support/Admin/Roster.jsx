import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, Users, Trash2, Plus } from "lucide-react"
import { useApiClient } from "@/components/providers/ApiClientProvider"
import { useToast } from "@/components/common/Toast/ToastProvider"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const AdminRoster = () => {
  const apiClient = useApiClient()
  const { showToast } = useToast()

  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [entries, setEntries] = useState([])

  const [selectedClass, setSelectedClass] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState(days[0])
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [subject, setSubject] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const loadInitial = useCallback(async () => {
    try {
      const [classesRes, teachersRes, rosterRes] = await Promise.all([
        apiClient.get("/api/classes"),
        apiClient.get("/api/teachers"),
        apiClient.get("/api/roster"),
      ])
      const classNames = (classesRes.data || []).map((c) => c.name)
      setClasses(classNames)
      setTeachers(teachersRes.data || [])
      setEntries(rosterRes.data || [])
      if (!selectedClass && classNames.length) setSelectedClass(classNames[0])
    } catch (error) {
      console.error("Error loading roster data:", error)
      showToast({ type: "error", message: "Failed to load roster data" })
    }
  }, [apiClient, selectedClass, showToast])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!selectedClass || !selectedTeacher || !dayOfWeek || !startTime || !endTime) {
      showToast({ type: "error", message: "Please fill class, teacher, day and time" })
      return
    }
    setIsSaving(true)
    try {
      const payload = {
        teacherId: selectedTeacher,
        className: selectedClass,
        dayOfWeek,
        startTime,
        endTime,
        subject,
      }
      const res = await apiClient.post("/api/roster", payload)
      setEntries((prev) => [res.data, ...prev])
      setStartTime("")
      setEndTime("")
      setSubject("")
      showToast({ type: "success", message: "Roster entry added" })
    } catch (error) {
      console.error("Error creating roster entry:", error)
      showToast({ type: "error", message: "Failed to create roster entry" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this roster entry?")) return
    try {
      await apiClient.delete(`/api/roster/${id}`)
      setEntries((prev) => prev.filter((e) => e._id !== id))
      showToast({ type: "success", message: "Roster entry deleted" })
    } catch (error) {
      console.error("Error deleting roster entry:", error)
      showToast({ type: "error", message: "Failed to delete roster entry" })
    }
  }

  const filteredEntries = entries
    .filter((entry) => (!selectedClass || entry.className === selectedClass) && (!selectedTeacher || entry.teacherId?._id === selectedTeacher || entry.teacherId === selectedTeacher))
    .sort((a, b) => {
      const dayIndexA = days.indexOf(a.dayOfWeek)
      const dayIndexB = days.indexOf(b.dayOfWeek)
      if (dayIndexA !== dayIndexB) return dayIndexA - dayIndexB
      return (a.startTime || "").localeCompare(b.startTime || "")
    })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Class Roster</h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Create Roster Entry
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} - {t.subject}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-600" />
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-600" />
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject (optional)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {isSaving ? "Saving..." : "Add to Roster"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Current Roster
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-sm font-semibold text-gray-700">Class</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Teacher</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Day</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Time</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Subject</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No roster entries found.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const teacherObj = entry.teacherId && typeof entry.teacherId === "object" ? entry.teacherId : teachers.find((t) => t._id === entry.teacherId)
                  return (
                    <motion.tr
                      key={entry._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3 text-sm text-gray-800">{entry.className}</td>
                      <td className="p-3 text-sm text-gray-800">
                        {teacherObj ? `${teacherObj.name} (${teacherObj.subject})` : "—"}
                      </td>
                      <td className="p-3 text-sm text-gray-700">{entry.dayOfWeek}</td>
                      <td className="p-3 text-sm text-gray-700">
                        {entry.startTime} – {entry.endTime}
                      </td>
                      <td className="p-3 text-sm text-gray-700">{entry.subject || "—"}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminRoster

