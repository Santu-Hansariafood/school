"use client"
import Assignments from "@/components/support/Assignments/Assignments"
import { useAuth } from "@/app/providers/AuthProvider"

export default function StudentAssignments() {
  const { user } = useAuth()
  return <Assignments role="student" userId={user?.id} />
}
