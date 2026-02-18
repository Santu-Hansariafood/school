"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers/AuthProvider"
import Sidebar from "@/components/common/Sidebar/Sidebar"
import { Calendar, FileText, BookOpen, DollarSign, BarChart3, UserPlus, Plus, Clock } from "lucide-react"

export default function AdminShell({ children }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "admin") router.replace("/")
  }, [user, router])

  if (!user || user.role !== "admin") return null

  const menuItems = [
    { icon: BarChart3, label: "Overview", path: "/admin" },
    { icon: Calendar, label: "Attendance", path: "/admin/attendance" },
    { icon: Calendar, label: "Holidays", path: "/admin/holidays" },
     { icon: Calendar, label: "Teacher Leaves", path: "/admin/teacher-leaves" },
    { icon: FileText, label: "Assignments", path: "/admin/assignments" },
    { icon: BookOpen, label: "Results", path: "/admin/results" },
    { icon: BookOpen, label: "Library", path: "/admin/library" },
    { icon: DollarSign, label: "Fees", path: "/admin/fees" },
    { icon: Clock, label: "Roster", path: "/admin/roster" },
    { icon: Plus, label: "Create Class", path: "/admin/classes" },
    { icon: UserPlus, label: "Register Admin", path: "/admin/register-admin" },
    { icon: UserPlus, label: "Register Teacher", path: "/admin/register-teacher" },
    { icon: UserPlus, label: "Register Student", path: "/admin/register-student" }
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} user={user} onLogout={logout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} ml-0`}>{children}</main>
    </div>
  )
}
