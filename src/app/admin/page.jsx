"use client"
import { useEffect, useState } from "react"
import StatCard from "@/components/support/StatCard/StatCard"
import { Users, FileText, BookOpen } from "lucide-react"
import { useApiClient } from "@/components/providers/ApiClientProvider"

export default function AdminOverview() {
  const apiClient = useApiClient()
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    assignments: 0,
    books: 0,
  })

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [studentsRes, teachersRes, assignmentsRes, booksRes] = await Promise.all([
          apiClient.get("/api/students"),
          apiClient.get("/api/teachers"),
          apiClient.get("/api/assignments"),
          apiClient.get("/api/library/books"),
        ])

        setCounts({
          students: Array.isArray(studentsRes.data) ? studentsRes.data.length : 0,
          teachers: Array.isArray(teachersRes.data) ? teachersRes.data.length : 0,
          assignments: Array.isArray(assignmentsRes.data) ? assignmentsRes.data.length : 0,
          books: Array.isArray(booksRes.data) ? booksRes.data.length : 0,
        })
      } catch (error) {
        console.error("Error loading admin overview counts:", error)
      }
    }
    loadCounts()
  }, [apiClient])

  const stats = [
    { icon: Users, label: "Total Students", value: counts.students, color: "blue" },
    { icon: Users, label: "Total Teachers", value: counts.teachers, color: "emerald" },
    { icon: FileText, label: "Assignments", value: counts.assignments, color: "purple" },
    { icon: BookOpen, label: "Library Books", value: counts.books, color: "orange" },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
      </div>
    </div>
  )
}
