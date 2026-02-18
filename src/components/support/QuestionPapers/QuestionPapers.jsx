"use client"
import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { FileText, PlusCircle, Calendar, BookOpen, Printer } from "lucide-react"
import { useApiClient } from "@/components/providers/ApiClientProvider"
import { useToast } from "@/components/common/Toast/ToastProvider"
import { useAuth } from "@/app/providers/AuthProvider"

const QuestionPapers = ({ role }) => {
  const apiClient = useApiClient()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [subjects, setSubjects] = useState([])
  const [papers, setPapers] = useState([])
  const [filters, setFilters] = useState({ class: "", subjectId: "", year: "" })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: "",
    class: "",
    subjectId: "",
    year: new Date().getFullYear().toString(),
    textContent: "",
  })
  const [saving, setSaving] = useState(false)

  const loadSubjects = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/subjects")
      setSubjects(res.data || [])
    } catch (error) {
      console.error("Error loading subjects:", error)
    }
  }, [apiClient])

  const loadPapers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.class) params.set("class", filters.class)
      if (filters.subjectId) params.set("subjectId", filters.subjectId)
      if (filters.year) params.set("year", filters.year)
      const res = await apiClient.get(`/api/question-papers?${params.toString()}`)
      setPapers(res.data || [])
    } catch (error) {
      console.error("Error loading question papers:", error)
      showToast({ type: "error", message: "Failed to load question papers" })
    }
  }, [apiClient, filters, showToast])

  useEffect(() => {
    loadSubjects()
  }, [loadSubjects])

  useEffect(() => {
    loadPapers()
  }, [loadPapers])

  const classesOptions = Array.from(
    new Set(subjects.map((s) => s.class).filter(Boolean))
  ).sort()

  const subjectOptions = subjects.filter((s) =>
    filters.class ? s.class === filters.class : true
  )

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePrint = (paper) => {
    const w = window.open("", "_blank", "width=800,height=600")
    if (!w) return
    const title = paper.title || "Question Paper"
    const subject = paper.subjectName || ""
    const cls = paper.class || ""
    const year = paper.year || ""
    const text = paper.textContent || ""
    w.document.write(
      `<html><head><title>${title}</title><style>
      body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:24px;color:#111827}
      h1{font-size:24px;margin-bottom:4px}
      h2{font-size:16px;margin:0 0 12px 0;color:#4b5563}
      .meta{font-size:13px;margin-bottom:16px;color:#6b7280}
      pre{white-space:pre-wrap;font-family:inherit;font-size:14px;margin:0}
    </style></head><body>
      <h1>${title}</h1>
      <h2>${subject}</h2>
      <div class="meta">Class: ${cls || "-"} | Year: ${year}</div>
      <pre>${text}</pre>
    </body></html>`
    )
    w.document.close()
    w.focus()
    w.print()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title || !form.class || !form.subjectId || !form.year || !form.textContent) {
      showToast({ type: "warning", message: "All fields are required" })
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        class: form.class.trim(),
        subjectId: form.subjectId,
        year: form.year.trim(),
        textContent: form.textContent.trim(),
        addedByRole: role === "admin" ? "admin" : "teacher",
        addedById: user?._id,
      }
      await apiClient.post("/api/question-papers", payload)
      setForm({
        title: "",
        class: "",
        subjectId: "",
        year: new Date().getFullYear().toString(),
        textContent: "",
      })
      setShowForm(false)
      await loadPapers()
      showToast({ type: "success", message: "Question paper added" })
    } catch (error) {
      console.error("Error creating question paper:", error)
      showToast({ type: "error", message: "Failed to add question paper" })
    } finally {
      setSaving(false)
    }
  }

  const title =
    role === "admin"
      ? "Previous Year Question Papers (Admin)"
      : role === "teacher"
      ? "Previous Year Question Papers (Teacher)"
      : "Previous Year Question Papers"

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FileText className="w-8 h-8 text-blue-600" />
        {title}
      </h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
              <select
                name="class"
                value={filters.class}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All</option>
                {classesOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
              <select
                name="subjectId"
                value={filters.subjectId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All</option>
                {subjectOptions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.class ? `(${s.class})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
              <input
                type="text"
                name="year"
                placeholder="e.g., 2023"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {(role === "admin" || role === "teacher") && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium self-stretch md:self-auto justify-center"
            >
              <PlusCircle className="w-5 h-5" />
              {showForm ? "Close" : "Add Question Paper"}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mt-6 space-y-4 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g., Mathematics Term 1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class *</label>
                <input
                  type="text"
                  name="class"
                  value={form.class}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g., 10-A"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
                <select
                  name="subjectId"
                  value={form.subjectId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.class ? `(${s.class})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year *</label>
                <input
                  type="text"
                  name="year"
                  value={form.year}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g., 2024"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Question Paper Text *
                </label>
                <textarea
                  name="textContent"
                  value={form.textContent}
                  onChange={handleFormChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y"
                  placeholder="Enter full question paper here..."
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Question Paper"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Available Question Papers</h2>
          <span className="text-sm text-gray-500">{papers.length} records</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.length === 0 ? (
            <p className="text-sm text-gray-500">No question papers found for the selected filters.</p>
          ) : (
            papers.map((p) => (
              <div
                key={p._id}
                className="p-4 border border-gray-200 rounded-xl hover:border-blue-400 transition bg-white flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{p.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{p.subjectName || "Subject"}</span>
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>Class {p.class || "-"}</span>
                      <span className="mx-1">•</span>
                      <span>Year {p.year}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrint(p)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                  >
                    <Printer className="w-3 h-3" />
                    Print
                  </button>
                </div>
                <div className="mt-3 p-2 bg-gray-50 rounded-lg text-xs text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {p.textContent || "No text available."}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default QuestionPapers
