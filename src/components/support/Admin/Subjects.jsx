"use client"
import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { BookOpen, PlusCircle, Trash2 } from "lucide-react"
import { useApiClient } from "@/components/providers/ApiClientProvider"
import { useToast } from "@/components/common/Toast/ToastProvider"

const Subjects = () => {
  const apiClient = useApiClient()
  const { showToast } = useToast()
  const [subjects, setSubjects] = useState([])
  const [form, setForm] = useState({ name: "", code: "", class: "" })
  const [loading, setLoading] = useState(false)

  const loadSubjects = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/subjects")
      setSubjects(res.data || [])
    } catch (error) {
      console.error("Error loading subjects:", error)
      showToast({ type: "error", message: "Failed to load subjects" })
    }
  }, [apiClient, showToast])

  useEffect(() => {
    loadSubjects()
  }, [loadSubjects])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.class) {
      showToast({ type: "warning", message: "Subject name and class are required" })
      return
    }
    setLoading(true)
    try {
      await apiClient.post("/api/subjects", {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        class: form.class.trim(),
        createdByRole: "admin",
      })
      setForm({ name: "", code: "", class: "" })
      await loadSubjects()
      showToast({ type: "success", message: "Subject added" })
    } catch (error) {
      console.error("Error creating subject:", error)
      const message = error.response?.data?.message || "Failed to create subject"
      showToast({ type: "error", message })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject? It will still remain as text in existing records.")) return
    try {
      await apiClient.delete(`/api/subjects/${id}`)
      setSubjects((prev) => prev.filter((s) => s._id !== id))
      showToast({ type: "success", message: "Subject deleted" })
    } catch (error) {
      console.error("Error deleting subject:", error)
      showToast({ type: "error", message: "Failed to delete subject" })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-blue-600" />
        Subjects
      </h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mathematics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code</label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., MATH-101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
              <input
                type="text"
                name="class"
                value={form.class}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 10-A"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
            >
              <PlusCircle className="w-5 h-5" />
              {loading ? "Saving..." : "Add Subject"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Available Subjects</h2>
          <span className="text-sm text-gray-500">{subjects.length} subjects</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Class</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No subjects added yet.
                  </td>
                </tr>
              ) : (
                subjects.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.code || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{s.class || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default Subjects

