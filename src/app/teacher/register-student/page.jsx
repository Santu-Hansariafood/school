"use client"
import { useEffect, useState } from "react"
import RegisterStudent from "@/components/support/Admin/RegisterStudent"
import { useApiClient } from "@/components/providers/ApiClientProvider"
import { useAuth } from "@/app/providers/AuthProvider"

export default function TeacherRegisterStudentPage() {
  const { user } = useAuth()
  const apiClient = useApiClient()
  const [classOptions, setClassOptions] = useState([])

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await apiClient.get("/api/classes")
        const names = Array.isArray(res.data) ? res.data.map((c) => c.name) : []
        setClassOptions(names)
      } catch {
        setClassOptions([])
      }
    }
    loadClasses()
  }, [apiClient])

  if (!user || user.role !== "teacher") return null
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Register Students</h1>
      <RegisterStudent availableClasses={classOptions} />
    </div>
  )
}
