"use client"
import { useEffect, useState } from "react"
import StatCard from "@/components/support/StatCard/StatCard"
import { Users, FileText, Calendar, BookOpen } from "lucide-react"
import { useApiClient } from "@/components/providers/ApiClientProvider"

export default function TeacherOverview() {
  const apiClient = useApiClient()
  const [counts, setCounts] = useState({
    students: 0,
    assignments: 0,
  })

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [studentsRes, assignmentsRes] = await Promise.all([
          apiClient.get("/api/students"),
          apiClient.get("/api/assignments"),
        ])

        setCounts({
          students: Array.isArray(studentsRes.data) ? studentsRes.data.length : 0,
          assignments: Array.isArray(assignmentsRes.data) ? assignmentsRes.data.length : 0,
        })
      } catch (error) {
        console.error("Error loading teacher overview counts:", error)
      }
    }
    loadCounts()
  }, [apiClient])

  const stats = [
    { icon: Users, label: "My Students", value: counts.students, color: "blue" },
    { icon: FileText, label: "Assignments", value: counts.assignments, color: "purple" },
    { icon: Calendar, label: "Classes Today", value: 5, color: "emerald" },
    { icon: BookOpen, label: "Pending Grades", value: 12, color: "orange" },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
      </div>
    </div>
  )
}
