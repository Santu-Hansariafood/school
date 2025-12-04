"use client"
import Assignments from "@/components/support/Assignments/Assignments"
import { useAuth } from "@/app/providers/AuthProvider"

export default function TeacherAssignments() {
  const { user } = useAuth()
  return <Assignments role="teacher" userId={user?.id} />
}

