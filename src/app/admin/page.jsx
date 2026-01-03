"use client"
import { useState, useEffect } from "react"
import StatCard from "@/components/support/StatCard/StatCard"
import { Users, FileText, BookOpen } from "lucide-react"
import { useApiClient } from "@/components/providers/ApiClientProvider"

export default function AdminOverview() {
  const apiClient = useApiClient()
  const [statsData, setStatsData] = useState({
    students: 0,
    teachers: 0,
    assignments: 0,
    books: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, assignmentsRes, booksRes] = await Promise.all([
          apiClient.get('/api/students'),
          apiClient.get('/api/teachers'),
          apiClient.get('/api/assignments'),
          apiClient.get('/api/library/books')
        ])
        
        setStatsData({
          students: studentsRes.data?.length || 0,
          teachers: teachersRes.data?.length || 0,
          assignments: assignmentsRes.data?.length || 0,
          books: booksRes.data?.length || 0
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      }
    }
    
    fetchStats()
  }, [apiClient])

  const stats = [
    { icon: Users, label: 'Total Students', value: statsData.students, color: 'blue' },
    { icon: Users, label: 'Total Teachers', value: statsData.teachers, color: 'emerald' },
    { icon: FileText, label: 'Assignments', value: statsData.assignments, color: 'purple' },
    { icon: BookOpen, label: 'Library Books', value: statsData.books, color: 'orange' }
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
