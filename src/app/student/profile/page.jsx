"use client"
import { useAuth } from "@/app/providers/AuthProvider"
import StudentProfile from "@/components/pages/StudentProfile/StudentProfile"

export default function StudentProfilePage() {
  const { user } = useAuth()
  if (!user) return null
  return <StudentProfile user={user} />
}

