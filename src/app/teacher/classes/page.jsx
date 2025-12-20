"use client"
import ClassesManager from '@/components/support/Classes/ClassesManager'

export default function TeacherClassesPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Class Management</h1>
      <ClassesManager />
    </div>
  )
}
