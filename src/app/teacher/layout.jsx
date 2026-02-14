"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers/AuthProvider"
import Sidebar from "@/components/common/Sidebar/Sidebar"
import { Calendar, FileText, BookOpen, BarChart3, Users } from "lucide-react"

export default function TeacherLayout({ children }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "teacher") router.replace("/")
  }, [user, router])

  const menuItems = [
    { icon: BarChart3, label: "Overview", path: "/teacher" },
    { icon: Calendar, label: "Attendance", path: "/teacher/attendance" },
    { icon: FileText, label: "Assignments", path: "/teacher/assignments" },
    { icon: BookOpen, label: "Results", path: "/teacher/results" },
    { icon: Users, label: "Register Student", path: "/teacher/register-student" }
  ]

  if (!user || user.role !== "teacher") return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} user={user} onLogout={logout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>{children}</main>
    </div>
  )
}
