import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Users, ArrowLeft, GraduationCap } from 'lucide-react'
import { students, results, attendanceRecords, teachers } from '@/data/mockData'

const InfoCard = ({ icon: Icon, label, value, color = 'blue' }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderColor: `var(--color-${color})` }}>
    <div className="flex items-center gap-4">
      <div className={`p-3 bg-${color}-100 rounded-lg`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </motion.div>
)

const StudentProfile = ({ user }) => {
  const router = useRouter()
  const studentData = students.find(s => s.id === user.id) || students[0]
  const studentResults = results.filter(r => r.studentId === studentData.id)
  const studentAttendance = attendanceRecords.filter(a => a.studentId === studentData.id)
  const presentDays = studentAttendance.filter(a => a.status === 'present').length
  const totalDays = studentAttendance.length
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0
  const assignedTeacher = teachers.find(t => t.assignedClasses?.includes(studentData.class))


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{studentData.name}</h1>
                <p className="text-blue-100 text-lg">Student ID: {studentData.id}</p>
                <p className="text-blue-100">Class: {studentData.class}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoCard icon={Mail} label="Email" value={studentData.email} color="blue" />
              <InfoCard icon={Phone} label="Phone" value={studentData.phone} color="emerald" />
              <InfoCard icon={MapPin} label="Address" value={studentData.address} color="purple" />
              <InfoCard icon={Calendar} label="Date of Birth" value={studentData.dateOfBirth} color="orange" />
              <InfoCard icon={User} label="Gender" value={studentData.gender} color="pink" />
              <InfoCard icon={Users} label="Parent Name" value={studentData.parentName} color="indigo" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Academic Records</h2>
            </div>
            <div className="space-y-4">
              {studentResults.map((result, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div>
                    <p className="font-semibold text-gray-800">{result.subject}</p>
                    <p className="text-sm text-gray-600">Marks: {result.marks}/100</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      result.grade.includes('A') ? 'bg-emerald-100 text-emerald-700' :
                      result.grade.includes('B') ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {result.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-800">Attendance Overview</h2>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Attendance Rate</span>
                <span className="text-2xl font-bold text-emerald-600">{attendancePercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${attendancePercentage}%` }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Present Days</p>
                <p className="text-2xl font-bold text-emerald-600">{presentDays}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Absent Days</p>
                <p className="text-2xl font-bold text-orange-600">{totalDays - presentDays}</p>
              </div>
            </div>

            {assignedTeacher && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Class Teacher</h3>
                </div>
                <p className="text-gray-700">{assignedTeacher.name}</p>
                <p className="text-sm text-gray-600">{assignedTeacher.subject}</p>
                <p className="text-sm text-gray-600">{assignedTeacher.email}</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Performance Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Average Grade</p>
              <p className="text-3xl font-bold text-blue-600">A-</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Total Subjects</p>
              <p className="text-3xl font-bold text-emerald-600">{studentResults.length}</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Class Rank</p>
              <p className="text-3xl font-bold text-purple-600">3rd</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StudentProfile
