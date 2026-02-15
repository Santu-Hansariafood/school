"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import StatCard from "@/components/support/StatCard/StatCard"
import { Calendar, FileText, TrendingUp, BookOpen, DollarSign, BookOpenCheck } from "lucide-react"
import { useAuth } from "@/app/providers/AuthProvider"
import { useApiClient } from "@/components/providers/ApiClientProvider"

export default function StudentOverview() {
  const { user } = useAuth()
  const router = useRouter()
  const apiClient = useApiClient()
  const [student, setStudent] = useState(null)
  const [attendanceData, setAttendanceData] = useState([])
  const [results, setResults] = useState([])
  const [feeSummary] = useState({ total: 6000, paid: 5200, pending: 800 })
  const [issuedBooks, setIssuedBooks] = useState([])

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.replace("/")
      return
    }

    const load = async () => {
      if (!user?.email) return
      try {
        const studentRes = await apiClient.get(`/api/students?email=${encodeURIComponent(user.email)}`)
        const list = Array.isArray(studentRes.data) ? studentRes.data : []
        const me = list[0]
        if (!me) return
        setStudent(me)

        const [attendanceRes, resultsRes, booksRes] = await Promise.all([
          apiClient.get(`/api/attendance?studentId=${me._id}`),
          apiClient.get(`/api/results?studentId=${me._id}`),
          apiClient.get(`/api/library/books`)
        ])

        setAttendanceData(attendanceRes.data || [])
        setResults(resultsRes.data || [])

        const allBooks = booksRes.data || []
        const myBooks = allBooks.filter(b => String(b.issuedTo) === String(me._id))
        setIssuedBooks(myBooks)
      } catch (error) {
        console.error("Error loading student dashboard data:", error)
      }
    }
    load()
  }, [apiClient, user, router])

  const attendanceStats = useMemo(() => {
    if (!attendanceData.length) return { percentage: 0, present: 0, total: 0, series: [] }
    let present = 0
    const perDay = {}
    attendanceData.forEach(r => {
      if (r.status === "present") present += 1
      const key = new Date(r.date).toISOString().split("T")[0]
      perDay[key] = r.status
    })
    const total = attendanceData.length
    const percentage = total ? Number(((present / total) * 100).toFixed(1)) : 0
    const series = Object.entries(perDay)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-7)
    return { percentage, present, total, series }
  }, [attendanceData])

  const marksStats = useMemo(() => {
    if (!results.length) return { average: 0, grades: [] }
    const total = results.reduce((sum, r) => sum + (r.marks || 0), 0)
    const average = Number((total / results.length).toFixed(1))
    const grades = results.map(r => ({ subject: r.subject, marks: r.marks || 0 }))
    return { average, grades }
  }, [results])

  const stats = [
    { icon: Calendar, label: "Attendance", value: `${attendanceStats.percentage}%`, color: "blue" },
    { icon: TrendingUp, label: "Average Marks", value: marksStats.average ? `${marksStats.average}%` : "0%", color: "emerald" },
    { icon: DollarSign, label: "Fees Pending", value: `₹${feeSummary.pending}`, color: "orange" },
    { icon: BookOpenCheck, label: "Books Issued", value: issuedBooks.length, color: "purple" }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back{student ? `, ${student.name}` : ""}. Here is your academic snapshot.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Attendance Trend (Last 7 Days)</h2>
            <span className="text-xs text-gray-500">
              Present {attendanceStats.present}/{attendanceStats.total} days
            </span>
          </div>
          {attendanceStats.series.length === 0 ? (
            <p className="text-sm text-gray-500">No attendance records available yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {attendanceStats.series.map(([day, status]) => {
                const isPresent = status === "present"
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t-xl transition-all ${
                        isPresent ? "bg-emerald-500" : "bg-red-400"
                      }`}
                      style={{ height: isPresent ? "80%" : "35%" }}
                    />
                    <span className="text-[10px] text-gray-500">
                      {new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Fee Summary</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Total Fees</span>
              <span className="font-semibold">₹{feeSummary.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600">Paid</span>
              <span className="font-semibold text-emerald-600">₹{feeSummary.paid}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-600">Pending</span>
              <span className="font-semibold text-orange-600">₹{feeSummary.pending}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            For detailed payments and receipts, open the Fees section from the sidebar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Marks by Subject</h2>
          {marksStats.grades.length === 0 ? (
            <p className="text-sm text-gray-500">No marks available yet.</p>
          ) : (
            <div className="space-y-3">
              {marksStats.grades.map((g) => (
                <div key={g.subject} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700 flex-1">{g.subject}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(g.marks, 100)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs text-gray-600">{g.marks}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My Issued Books</h2>
          {issuedBooks.length === 0 ? (
            <p className="text-sm text-gray-500">No active book issuances.</p>
          ) : (
            <div className="space-y-3">
              {issuedBooks.map((book) => (
                <div
                  key={book._id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{book.title}</p>
                    <p className="text-xs text-gray-500">by {book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-500">
                      Due: {book.dueDate || "N/A"}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] mt-1">
                      Issued
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
