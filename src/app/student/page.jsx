"use client"
import StatCard from "@/components/support/StatCard/StatCard"
import { Calendar, FileText, TrendingUp, BookOpen } from "lucide-react"

export default function StudentOverview() {
  const stats = [
    { icon: Calendar, label: 'Attendance', value: '92%', color: 'blue' },
    { icon: FileText, label: 'Pending Assignments', value: 3, color: 'orange' },
    { icon: TrendingUp, label: 'Average Grade', value: 'A-', color: 'emerald' },
    { icon: BookOpen, label: 'Books Issued', value: 2, color: 'purple' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
      </div>
    </div>
  )
}

