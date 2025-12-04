import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { Calendar, FileText, BookOpen, DollarSign, BarChart3, TrendingUp } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import Attendance from '../components/Attendance'
import Assignments from '../components/Assignments'
import Results from '../components/Results'
import Library from '../components/Library'
import Fees from '../components/Fees'
import { assignments } from '../data/mockData'

const StudentDashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { icon: BarChart3, label: 'Overview', path: '/student' },
    { icon: Calendar, label: 'Attendance', path: '/student/attendance' },
    { icon: FileText, label: 'Assignments', path: '/student/assignments' },
    { icon: BookOpen, label: 'Results', path: '/student/results' },
    { icon: BookOpen, label: 'Library', path: '/student/library' },
    { icon: DollarSign, label: 'Fees', path: '/student/fees' }
  ]

  const stats = [
    { icon: Calendar, label: 'Attendance', value: '92%', color: 'blue' },
    { icon: FileText, label: 'Pending Assignments', value: 3, color: 'orange' },
    { icon: TrendingUp, label: 'Average Grade', value: 'A-', color: 'emerald' },
    { icon: BookOpen, label: 'Books Issued', value: 2, color: 'purple' }
  ]

  const Overview = () => (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Upcoming Assignments</h2>
          <div className="space-y-3">
            {assignments.slice(0, 4).map(assignment => (
              <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${assignment.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {assignment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{assignment.subject}</p>
                <p className="text-xs text-gray-500">Due: {assignment.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Grades</h2>
          <div className="space-y-3">
            {[{ subject: 'Mathematics', grade: 'A', marks: '95/100' }, { subject: 'Physics', grade: 'A-', marks: '88/100' }, { subject: 'Chemistry', grade: 'B+', marks: '82/100' }, { subject: 'English', grade: 'A', marks: '92/100' }].map((result, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{result.subject}</p>
                  <p className="text-sm text-gray-600">{result.marks}</p>
                </div>
                <span className="text-lg font-bold text-emerald-600">{result.grade}</span>
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
          <Route path="/attendance" element={<Attendance role="student" />} />
          <Route path="/assignments" element={<Assignments role="student" />} />
          <Route path="/results" element={<Results role="student" />} />
          <Route path="/library" element={<Library role="student" />} />
          <Route path="/fees" element={<Fees role="student" />} />
        </Routes>
      </main>
    </div>
  )
}

export default StudentDashboard