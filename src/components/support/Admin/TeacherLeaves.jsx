import { useEffect, useState, useCallback } from "react"
import { useApiClient } from "@/components/providers/ApiClientProvider"
import { useToast } from "@/components/common/Toast/ToastProvider"
import { Calendar, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react"

export default function TeacherLeavesAdmin() {
  const apiClient = useApiClient()
  const { showToast } = useToast()
  const [teachers, setTeachers] = useState([])
  const [leaves, setLeaves] = useState([])
  const [form, setForm] = useState({
    teacherId: "",
    fromDate: "",
    toDate: "",
    reason: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadTeachers = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/teachers")
      setTeachers(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Error loading teachers for leaves:", error)
      showToast({ type: "error", message: "Failed to load teachers" })
    }
  }, [apiClient, showToast])

  const loadLeaves = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/teacher-leaves")
      setLeaves(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Error loading teacher leaves:", error)
      showToast({ type: "error", message: "Failed to load leaves" })
    }
  }, [apiClient, showToast])

  useEffect(() => {
    loadTeachers()
    loadLeaves()
  }, [loadTeachers, loadLeaves])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.teacherId || !form.fromDate || !form.toDate) return
    setIsSubmitting(true)
    try {
      await apiClient.post("/api/teacher-leaves", {
        teacherId: form.teacherId,
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason || "",
      })
      showToast({ type: "success", message: "Leave generated for teacher" })
      setForm({
        teacherId: "",
        fromDate: "",
        toDate: "",
        reason: "",
      })
      await loadLeaves()
    } catch (error) {
      console.error("Error creating teacher leave:", error)
      showToast({ type: "error", message: "Failed to create leave" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await apiClient.patch(`/api/teacher-leaves/${id}`, { status })
      showToast({ type: "success", message: `Leave ${status}` })
      await loadLeaves()
    } catch (error) {
      console.error("Error updating teacher leave status:", error)
      showToast({ type: "error", message: "Failed to update status" })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this leave request?")) return
    try {
      await apiClient.delete(`/api/teacher-leaves/${id}`)
      showToast({ type: "success", message: "Leave deleted" })
      setLeaves((prev) => prev.filter((l) => l._id !== id))
    } catch (error) {
      console.error("Error deleting teacher leave:", error)
      showToast({ type: "error", message: "Failed to delete leave" })
    }
  }

  const teacherName = (id) => {
    const t = teachers.find((x) => x._id === id)
    return t ? `${t.name} (${t.subject})` : "Unknown Teacher"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Leaves</h1>
        <p className="text-sm text-gray-500">
          Generate and manage leave for teachers from the admin panel.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Generate Leave</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Teacher</label>
            <select
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              required
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.subject})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              name="fromDate"
              value={form.fromDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              name="toDate"
              value={form.toDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
            <input
              type="text"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Generate Leave"}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">All Teacher Leaves</h2>
            <p className="text-xs text-gray-500">Approve, reject or delete leave entries.</p>
          </div>
        </div>
        {leaves.length === 0 ? (
          <p className="text-sm text-gray-500">No teacher leave records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Teacher</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">From</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">To</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Reason</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{teacherName(leave.teacherId)}</td>
                    <td className="px-3 py-2">
                      {leave.fromDate
                        ? new Date(leave.fromDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {leave.toDate ? new Date(leave.toDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-3 py-2 max-w-xs truncate" title={leave.reason || ""}>
                      {leave.reason || "-"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          leave.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : leave.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {leave.status === "approved" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : leave.status === "rejected" ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateStatus(leave._id, "approved")}
                          className="px-2 py-1 rounded text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(leave._id, "rejected")}
                          className="px-2 py-1 rounded text-xs bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleDelete(leave._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

