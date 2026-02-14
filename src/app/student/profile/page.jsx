"use client"
import { useEffect, useState } from "react"
import { useApiClient } from "@/components/providers/ApiClientProvider"
import { useAuth } from "@/app/providers/AuthProvider"
import { Mail, Phone, MapPin, Calendar, Users, GraduationCap } from "lucide-react"

export default function StudentProfilePage() {
  const { user } = useAuth()
  const apiClient = useApiClient()
  const [student, setStudent] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return
      try {
        const res = await apiClient.get(`/api/students?email=${encodeURIComponent(user.email)}`)
        const list = Array.isArray(res.data) ? res.data : []
        setStudent(list[0] || null)
      } catch {
        setStudent(null)
      }
    }
    load()
  }, [apiClient, user])

  if (!user || user.role !== "student") return null
  if (!student) return null
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
              <p className="text-blue-100">Class: {student.class}</p>
            </div>
          </div>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">{student.email}</span>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-gray-800">{student.phone}</span>
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-800">{student.address}</span>
            </div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-gray-800">{student.dateOfBirth}</span>
            </div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg md:col-span-2">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-800">{student.parentName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
