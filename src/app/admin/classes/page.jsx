"use client"
import ClassesManager from '@/components/support/Classes/ClassesManager'

export default function AdminClassesPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Classes & Students</h1>
      <ClassesManager />
    </div>
  )
}
