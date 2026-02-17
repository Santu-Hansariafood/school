"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import Login from '@/components/pages/Login/Login'

export default function Page() {
  const router = useRouter()
  const { user, login } = useAuth()
  const apiKey = process.env.NEXT_PUBLIC_API_KEY

  useEffect(() => {
    if (user?.role) router.replace(`/${user.role}`)
  }, [user, router])

  return (
    <Login
      apiKey={apiKey}
      onLogin={(authData) => {
        login(authData)
        const nextRole = authData?.user?.role || authData?.role
        if (nextRole) {
          router.replace(`/${nextRole}`)
        }
      }}
    />
  )
}
