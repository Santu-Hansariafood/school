"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers/AuthProvider"
import Sidebar from "@/components/common/Sidebar/Sidebar"
import { Calendar, FileText, BookOpen, DollarSign, BarChart3 } from "lucide-react"

export default function StudentLayout({ children }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "student") router.replace("/")
  }, [user, router])

  const menuItems = [
    { icon: BarChart3, label: "Overview", path: "/student" },
    { icon: Calendar, label: "Attendance", path: "/student/attendance" },
    { icon: FileText, label: "Assignments", path: "/student/assignments" },
    { icon: BookOpen, label: "Results", path: "/student/results" },
    { icon: BookOpen, label: "Library", path: "/student/library" },
    { icon: FileText, label: "Question Papers", path: "/student/question-papers" },
    { icon: DollarSign, label: "Fees", path: "/student/fees" }
  ]

  if (!user || user.role !== "student") return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} user={user} onLogout={logout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>{children}</main>
    </div>
  )
}
