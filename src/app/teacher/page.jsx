"use client"
import { useEffect, useMemo, useState } from "react"
import StatCard from "@/components/support/StatCard/StatCard"
import { Users, FileText, Calendar, BookOpen, Clock } from "lucide-react"
import { useApiClient } from "@/components/providers/ApiClientProvider"
import { useAuth } from "@/app/providers/AuthProvider"

export default function TeacherOverview() {
  const { user } = useAuth()
  const apiClient = useApiClient()
  const [teacher, setTeacher] = useState(null)
  const [counts, setCounts] = useState({
    students: 0,
    assignments: 0,
  })
  const [leaves, setLeaves] = useState([])
  const [roster, setRoster] = useState([])
  const [holidays, setHolidays] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, assignmentsRes, teacherRes] = await Promise.all([
          apiClient.get("/api/students"),
          apiClient.get("/api/assignments"),
          user?.email
            ? apiClient
                .get(`/api/teachers?email=${encodeURIComponent(user.email)}`)
                .then((res) => {
                  const list = Array.isArray(res.data) ? res.data : []
                  return list[0] || null
                })
            : Promise.resolve(null),
        ])

        setCounts({
          students: Array.isArray(studentsRes.data) ? studentsRes.data.length : 0,
          assignments: Array.isArray(assignmentsRes.data) ? assignmentsRes.data.length : 0,
        })

        if (teacherRes) {
          setTeacher(teacherRes)
          try {
            const [leavesRes, rosterRes, holidaysRes] = await Promise.all([
              apiClient.get(`/api/teacher-leaves?teacherId=${teacherRes._id}`),
              apiClient.get(`/api/roster?teacherId=${teacherRes._id}`),
              apiClient.get("/api/holidays"),
            ])
            setLeaves(leavesRes.data || [])
            setRoster(rosterRes.data || [])
            setHolidays(holidaysRes.data || [])
          } catch {
            setLeaves([])
            setRoster([])
            setHolidays([])
          }
        }
      } catch (error) {
        console.error("Error loading teacher overview data:", error)
      }
    }
    if (user) load()
  }, [apiClient, user])

  const leaveSummary = useMemo(() => {
    if (!leaves.length) return { total: 0, approved: 0, pending: 0, rejected: 0 }
    let approved = 0
    let pending = 0
    let rejected = 0
    leaves.forEach((l) => {
      if (l.status === "approved") approved += 1
      else if (l.status === "pending") pending += 1
      else if (l.status === "rejected") rejected += 1
    })
    return { total: leaves.length, approved, pending, rejected }
  }, [leaves])

  const todaySchedule = useMemo(() => {
    if (!roster.length) return []
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const now = new Date()
    const todayName = dayNames[now.getDay()]
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    return roster
      .filter((entry) => {
        if (entry.month && entry.year) {
          return entry.month === currentMonth && entry.year === currentYear
        }
        return true
      })
      .filter((entry) => entry.dayOfWeek === todayName)
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
  }, [roster])

  const upcomingHolidays = useMemo(() => {
    if (!holidays.length) return []
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return holidays
      .filter((h) => h.date && new Date(h.date).getTime() >= now.getTime())
      .slice(0, 5)
  }, [holidays])

  const stats = [
    { icon: Users, label: "My Students", value: counts.students, color: "blue" },
    { icon: FileText, label: "Assignments", value: counts.assignments, color: "purple" },
    { icon: Calendar, label: "Classes Today", value: todaySchedule.length, color: "emerald" },
    { icon: BookOpen, label: "Approved Leaves", value: leaveSummary.approved, color: "orange" },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 rounded-2xl p-[1px] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/95 rounded-2xl px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">
              Welcome back{teacher ? `, ${teacher.name}` : ""}. Here is your overview.
            </p>
          </div>
        </div>
      </div>

      {teacher && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md border border-indigo-50 p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Teacher Details</h2>
            <p className="text-xs text-slate-500 mt-1">Profile and assigned classes</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-slate-800">
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Name</span>
                <span className="font-semibold">{teacher.name}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Subject</span>
                <span className="font-semibold">{teacher.subject}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Email</span>
                <span>{teacher.email}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Phone</span>
                <span>{teacher.phone}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Address</span>
                <span>{teacher.address}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Experience</span>
                <span>{teacher.experience}</span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-slate-500 text-[11px] uppercase tracking-wide">Assigned Classes</span>
                <span>{teacher.assignedClasses?.length ? teacher.assignedClasses.join(", ") : "No classes assigned"}</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-64">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Leave Summary</h3>
            {leaveSummary.total === 0 ? (
              <p className="text-xs text-slate-500">No leave records found.</p>
            ) : (
              <div className="space-y-1 text-xs text-slate-800">
                <div className="flex items-center justify-between">
                  <span>Total Requests</span>
                  <span className="font-semibold">{leaveSummary.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Approved</span>
                  <span className="font-semibold text-emerald-600">{leaveSummary.approved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending</span>
                  <span className="font-semibold text-amber-600">{leaveSummary.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rejected</span>
                  <span className="font-semibold text-rose-600">{leaveSummary.rejected}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {todaySchedule.length > 0 && (
        <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Today&apos;s Roster
            </h2>
          </div>
          <div className="space-y-3">
            {todaySchedule.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{entry.className}</p>
                  {entry.subject && <p className="text-xs text-slate-500">{entry.subject}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs font-medium text-slate-800">
                    {entry.startTime} – {entry.endTime}
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">Present = Green</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 ml-3" />
                    <span className="text-slate-500">Absent = Red</span>
                  </div>
                </div>
              </div>
            ))}
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
                  <p className="text-sm font-semibold text-slate-900">{holiday.name}</p>
                  <p className="text-xs text-slate-500">
                    {holiday.date ? new Date(holiday.date).toLocaleDateString() : ""}
                    {holiday.description ? ` • ${holiday.description}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
