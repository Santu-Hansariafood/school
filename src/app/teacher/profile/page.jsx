"use client"
import { useAuth } from "@/app/providers/AuthProvider"
import { useApiClient } from "@/components/providers/ApiClientProvider"
import { useEffect, useState } from "react"
import { Mail, Phone, MapPin, GraduationCap } from "lucide-react"

export default function TeacherProfilePage() {
  const { user } = useAuth()
  const apiClient = useApiClient()
  const [teacher, setTeacher] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return
      try {
        const res = await apiClient.get(`/api/teachers?email=${encodeURIComponent(user.email)}`)
        const list = Array.isArray(res.data) ? res.data : []
        setTeacher(list[0] || null)
      } catch {
        setTeacher(null)
      }
    }
    load()
  }, [apiClient, user])

  if (!user) return null
  if (!teacher) return null
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{teacher.name}</h1>
              <p className="text-blue-100">Subject: {teacher.subject}</p>
            </div>
          </div>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">{teacher.email}</span>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-gray-800">{teacher.phone}</span>
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg md:col-span-2">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-800">{teacher.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
