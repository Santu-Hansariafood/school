import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { Calendar, FileText, BookOpen, Users, BarChart3 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import Attendance from '../components/Attendance'
import Assignments from '../components/Assignments'
import Results from '../components/Results'
import { students, assignments } from '../data/mockData'

const TeacherDashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { icon: BarChart3, label: 'Overview', path: '/teacher' },
    { icon: Calendar, label: 'Attendance', path: '/teacher/attendance' },
    { icon: FileText, label: 'Assignments', path: '/teacher/assignments' },
    { icon: BookOpen, label: 'Results', path: '/teacher/results' }
  ]

  const myClasses = ['Class 10-A', 'Class 10-B', 'Class 9-A']
  const stats = [
    { icon: Users, label: 'My Students', value: students.length, color: 'blue' },
    { icon: FileText, label: 'Assignments', value: assignments.length, color: 'purple' },
    { icon: Calendar, label: 'Classes Today', value: 5, color: 'emerald' },
    { icon: BookOpen, label: 'Pending Grades', value: 12, color: 'orange' }
  ]

  const Overview = () => (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">My Classes</h2>
          <div className="space-y-3">
            {myClasses.map((cls, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-800">{cls}</span>
                </div>
                <span className="text-sm text-gray-600">{30 + i} students</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Today's Schedule</h2>
          <div className="space-y-3">
            {[{ time: '09:00 AM', class: 'Class 10-A', subject: 'Mathematics' }, { time: '11:00 AM', class: 'Class 10-B', subject: 'Physics' }, { time: '02:00 PM', class: 'Class 9-A', subject: 'Chemistry' }].map((schedule, i) => (
              <div key={i} className="p-3 border-l-4 border-emerald-500 bg-gray-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{schedule.subject}</p>
                    <p className="text-sm text-gray-600">{schedule.class}</p>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">{schedule.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} user={user} onLogout={onLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/attendance" element={<Attendance role="teacher" />} />
          <Route path="/assignments" element={<Assignments role="teacher" userId={user?.id} />} />
          <Route path="/results" element={<Results role="teacher" />} />
        </Routes>
      </main>
    </div>
  )
}

export default TeacherDashboard