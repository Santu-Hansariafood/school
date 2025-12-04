"use client"
import { createContext, useContext, useMemo, useState } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem("sm_user") : null
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const login = (userData) => {
    setUser(userData)
    try {
      localStorage.setItem("sm_user", JSON.stringify(userData))
    } catch {}
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("sm_user")
    } catch {}
  }

  const value = useMemo(() => ({ user, login, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
