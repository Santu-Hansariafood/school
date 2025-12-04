"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import Login from '@/components/pages/Login/Login'

export default function Page() {
  const router = useRouter()
  const { user, login } = useAuth()

  useEffect(() => {
    if (user?.role) router.replace(`/${user.role}`)
  }, [user, router])

  return <Login onLogin={(u) => { login(u); router.replace(`/${u.role}`) }} />
}
