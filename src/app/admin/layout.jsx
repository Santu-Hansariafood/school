"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers/AuthProvider"
import Sidebar from "@/components/common/Sidebar/Sidebar"
import { Calendar, FileText, BookOpen, DollarSign, BarChart3 } from "lucide-react"

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "admin") router.replace("/")
  }, [user, router])

  const menuItems = [
    { icon: BarChart3, label: "Overview", path: "/admin" },
    { icon: Calendar, label: "Attendance", path: "/admin/attendance" },
    { icon: FileText, label: "Assignments", path: "/admin/assignments" },
    { icon: BookOpen, label: "Results", path: "/admin/results" },
    { icon: BookOpen, label: "Library", path: "/admin/library" },
    { icon: DollarSign, label: "Fees", path: "/admin/fees" }
  ]

  if (!user || user.role !== "admin") return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} user={user} onLogout={logout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>{children}</main>
    </div>
  )
}

