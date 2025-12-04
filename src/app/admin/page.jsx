"use client"
import StatCard from "@/components/support/StatCard/StatCard"
import { Users, FileText, BookOpen } from "lucide-react"
import { students, teachers, assignments, libraryBooks } from "@/data/mockData"

export default function AdminOverview() {
  const stats = [
    { icon: Users, label: 'Total Students', value: students.length, color: 'blue' },
    { icon: Users, label: 'Total Teachers', value: teachers.length, color: 'emerald' },
    { icon: FileText, label: 'Assignments', value: assignments.length, color: 'purple' },
    { icon: BookOpen, label: 'Library Books', value: libraryBooks.length, color: 'orange' }
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
