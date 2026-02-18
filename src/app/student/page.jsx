"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import StatCard from "@/components/support/StatCard/StatCard"
import { Calendar, FileText, TrendingUp, BookOpen, DollarSign, BookOpenCheck, Clock } from "lucide-react"
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
  const [libraryStats, setLibraryStats] = useState({ totalIssued: 0, active: 0, returned: 0 })
  const [assignmentFeedback, setAssignmentFeedback] = useState({ score: 0, totalAssigned: 0, completed: 0 })
  const [classRoster, setClassRoster] = useState([])
  const [holidays, setHolidays] = useState([])

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

        const [attendanceRes, resultsRes, booksRes, rosterRes, holidaysRes] = await Promise.all([
          apiClient.get(`/api/attendance?studentId=${me._id}`),
          apiClient.get(`/api/results?studentId=${me._id}`),
          apiClient.get(`/api/library/books`),
          apiClient.get(`/api/roster?class=${encodeURIComponent(me.class || "")}`),
          apiClient.get("/api/holidays")
        ])

        setAttendanceData(attendanceRes.data || [])
        setResults(resultsRes.data || [])

        const allBooks = booksRes.data || []
        const myBooks = allBooks.filter(b => String(b.issuedTo) === String(me._id))
        setIssuedBooks(myBooks)

        setClassRoster(rosterRes.data || [])
        setHolidays(holidaysRes.data || [])

        const [issuancesRes, assignmentsRes] = await Promise.all([
          apiClient.get(`/api/library/issuances?studentId=${me._id}`),
          apiClient.get(`/api/assignments?studentId=${me._id}`)
        ])

        const issuances = issuancesRes.data || []
        const totalIssued = issuances.length
        const active = issuances.filter(i => i.status === "issued").length
        const returned = totalIssued - active
        setLibraryStats({ totalIssued, active, returned })

        const assignments = assignmentsRes.data || []
        let completed = 0
        if (assignments.length) {
          const submissionsPerAssignment = await Promise.all(
            assignments.map(a =>
              apiClient
                .get(`/api/assignments/${a._id}/submissions?studentId=${me._id}`)
                .then(res => res.data || [])
                .catch(() => [])
            )
          )
          submissionsPerAssignment.forEach(list => {
            if (Array.isArray(list) && list.length > 0) {
              completed += 1
            }
          })
        }
        const totalAssigned = assignments.length
        const score = totalAssigned ? Math.round((completed / totalAssigned) * 100) : 0
        setAssignmentFeedback({ score, totalAssigned, completed })
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

  const todayClasses = useMemo(() => {
    if (!classRoster.length) return []
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const todayName = dayNames[new Date().getDay()]
    return classRoster
      .filter((entry) => entry.dayOfWeek === todayName)
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
  }, [classRoster])

  const upcomingHolidays = useMemo(() => {
    if (!holidays.length) return []
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return holidays
      .filter((h) => h.date && new Date(h.date).getTime() >= now.getTime())
      .slice(0, 5)
  }, [holidays])

  const handlePrintProfile = () => {
    if (!student) return
    const w = window.open("", "_blank", "width=900,height=700")
    if (!w) return
    const s = student
    const rows = [
      ["Student Name", s.name],
      ["Class", s.class],
      ["Email", s.email],
      ["Phone", s.phone],
      ["Address", s.address],
      ["Date of Birth", s.dateOfBirth],
      ["Gender", s.gender],
      ["Parent/Guardian Name", s.parentName],
      ["Parent Phone", s.parentPhone],
      ["Parent Email", s.parentEmail],
      ["Previous School", s.previousSchool || ""],
      ["Admission Date", s.admissionDate]
    ]
    const tableRows = rows
      .map(
        ([label, value]) =>
          `<tr><td class="label">${label}</td><td class="value">${value || "-"}</td></tr>`
      )
      .join("")
    w.document.write(
      `<html><head><title>ABC School - Student Profile</title><style>
      body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:32px;background:#f3f4f6;color:#111827}
      .card{max-width:900px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(15,23,42,0.08);padding:28px 32px;}
      .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
      .school{font-size:22px;font-weight:700;color:#111827;}
      .subtitle{font-size:13px;color:#6b7280;margin-top:4px;}
      .meta{margin-top:4px;font-size:12px;color:#6b7280;}
      table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px;}
      .label{width:32%;padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#6b7280;}
      .value{padding:8px 10px;border-bottom:1px solid #e5e7eb;color:#111827;font-weight:500;}
      </style></head><body onload="window.print()">
      <div class="card">
        <div class="header">
          <div>
            <div class="school">ABC School</div>
            <div class="subtitle">Student Registration Profile</div>
          </div>
          <div class="meta">
            <div>Generated: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <table>${tableRows}</table>
      </div>
      </body></html>`
    )
    w.document.close()
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 rounded-2xl p-[1px] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/95 rounded-2xl px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">ABC School • Student Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">
              Welcome back{student ? `, ${student.name}` : ""}. Here is your academic snapshot.
            </p>
          </div>
        </div>
      </div>

      {student && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md border border-indigo-50 p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Student Details</h2>
            <p className="text-xs text-slate-500 mt-1">Registered profile at ABC School</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-slate-800">
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Name</span>
                <span className="font-semibold">{student.name}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Class</span>
                <span className="font-semibold">{student.class}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Email</span>
                <span>{student.email}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Phone</span>
                <span>{student.phone}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Address</span>
                <span>{student.address}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Date of Birth</span>
                <span>{student.dateOfBirth}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Gender</span>
                <span>{student.gender}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Admission Date</span>
                <span>{student.admissionDate}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Parent/Guardian</span>
                <span>{student.parentName}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Parent Phone</span>
                <span>{student.parentPhone}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Parent Email</span>
                <span>{student.parentEmail}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Previous School</span>
                <span>{student.previousSchool || "-"}</span>
              </div>
            </div>
          </div>
          <div className="flex md:flex-col gap-3">
            <button
              onClick={handlePrintProfile}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-indigo-200 text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
            >
              <FileText className="w-4 h-4 mr-2" />
              Print Details
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {upcomingHolidays.length > 0 && (
        <div className="bg-white/95 rounded-2xl shadow-sm border border-blue-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Holidays
            </h2>
          </div>
          <div className="space-y-3">
            {upcomingHolidays.map((holiday) => (
              <div
                key={holiday._id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{holiday.name}</p>
                  <p className="text-xs text-gray-500">
                    {holiday.date ? new Date(holiday.date).toLocaleDateString() : ""}
                    {holiday.description ? ` • ${holiday.description}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {todayClasses.length > 0 && (
        <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Today&apos;s Class Roster
            </h2>
          </div>
          <div className="space-y-3">
            {todayClasses.map((entry) => {
              const teacher = entry.teacherId && typeof entry.teacherId === "object" ? entry.teacherId : null
              return (
                <div
                  key={entry._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{entry.subject || "Class"}</p>
                    {teacher && (
                      <p className="text-xs text-gray-500">
                        {teacher.name} {teacher.subject ? `(${teacher.subject})` : ""}
                      </p>
                    )}
                  </div>
                  <div className="text-xs font-medium text-gray-700">
                    {entry.startTime} – {entry.endTime}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/95 rounded-2xl shadow-sm border border-indigo-50 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Attendance Trend (Last 7 Days)</h2>
            <span className="text-xs text-slate-500">
              Present {attendanceStats.present}/{attendanceStats.total} days
            </span>
          </div>
          {attendanceStats.series.length === 0 ? (
            <p className="text-sm text-slate-500">No attendance records available yet.</p>
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

        <div className="bg-white/95 rounded-2xl shadow-sm border border-amber-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Fee Summary</h2>
          <div className="space-y-3 text-sm text-slate-800">
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
          <p className="mt-4 text-xs text-slate-500">
            For detailed payments and receipts, open the Fees section from the sidebar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/95 rounded-2xl shadow-sm border border-purple-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Marks by Subject</h2>
          {marksStats.grades.length === 0 ? (
            <p className="text-sm text-slate-500">No marks available yet.</p>
          ) : (
            <div className="space-y-3">
              {marksStats.grades.map((g) => (
                <div key={g.subject} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-800 flex-1">{g.subject}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(g.marks, 100)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs text-slate-600">{g.marks}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Teacher Feedback</h2>
          {assignmentFeedback.totalAssigned === 0 ? (
            <p className="text-sm text-slate-500">No assignments assigned yet.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-800">
                <span>Assignments completed</span>
                <span className="font-semibold">
                  {assignmentFeedback.completed}/{assignmentFeedback.totalAssigned}
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${assignmentFeedback.score}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Completion rate based on assignments given by your teachers.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/95 rounded-2xl shadow-sm border border-sky-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Library Activity</h2>
          {libraryStats.totalIssued === 0 ? (
            <p className="text-sm text-slate-500 mb-3">No books issued yet.</p>
          ) : (
            <div className="mb-4 space-y-2 text-sm text-slate-800">
              <div className="flex items-center justify-between">
                <span>Total issued</span>
                <span className="font-semibold">{libraryStats.totalIssued}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active</span>
                <span className="font-semibold">{libraryStats.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Returned</span>
                <span className="font-semibold">{libraryStats.returned}</span>
              </div>
            </div>
          )}
          <h3 className="text-sm font-semibold text-slate-900 mb-2">My Issued Books</h3>
          {issuedBooks.length === 0 ? (
            <p className="text-sm text-slate-500">No active book issuances.</p>
          ) : (
            <div className="space-y-3">
              {issuedBooks.map((book) => (
                <div
                  key={book._id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{book.title}</p>
                    <p className="text-xs text-slate-500">by {book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">Due: {book.dueDate || "N/A"}</p>
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
