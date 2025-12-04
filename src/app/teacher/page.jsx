"use client"
import StatCard from "@/components/support/StatCard/StatCard"
import { Users, FileText, Calendar, BookOpen } from "lucide-react"
import { students, assignments } from "@/data/mockData"

export default function TeacherOverview() {
  const stats = [
    { icon: Users, label: 'My Students', value: students.length, color: 'blue' },
    { icon: FileText, label: 'Assignments', value: assignments.length, color: 'purple' },
    { icon: Calendar, label: 'Classes Today', value: 5, color: 'emerald' },
    { icon: BookOpen, label: 'Pending Grades', value: 12, color: 'orange' }
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

