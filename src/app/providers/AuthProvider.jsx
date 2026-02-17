"use client"
import { createContext, useContext, useEffect, useMemo, useState, startTransition } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      if (typeof window === "undefined") return null
      const rawAuth = localStorage.getItem("sm_auth")
      const rawUser = localStorage.getItem("sm_user")
      if (rawAuth) {
        return JSON.parse(rawAuth)
      }
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser)
        const today = new Date().toISOString().slice(0, 10)
        return { user: parsedUser, token: null, loginDay: today }
      }
      return null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!auth) return
    const checkDayChange = () => {
      if (!auth?.loginDay) return
      const today = new Date().toISOString().slice(0, 10)
      if (auth.loginDay !== today) {
        startTransition(() => {
          setAuth(null)
        })
        try {
          localStorage.removeItem("sm_auth")
          localStorage.removeItem("sm_user")
        } catch {}
      }
    }

    checkDayChange()
    const id = setInterval(checkDayChange, 60 * 1000)
    return () => clearInterval(id)
  }, [auth])

  const login = (payload) => {
    const today = new Date().toISOString().slice(0, 10)
    let next
    if (payload && payload.user) {
      next = {
        user: payload.user,
        token: payload.token || null,
        loginDay: payload.loginDay || today,
      }
    } else {
      next = {
        user: payload || null,
        token: null,
        loginDay: today,
      }
    }
    startTransition(() => {
      setAuth(next)
    })
    try {
      localStorage.setItem("sm_auth", JSON.stringify(next))
      localStorage.removeItem("sm_user")
    } catch {}
  }

  const logout = () => {
    startTransition(() => {
      setAuth(null)
    })
    try {
      localStorage.removeItem("sm_auth")
      localStorage.removeItem("sm_user")
    } catch {}
  }

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      loginDay: auth?.loginDay || null,
      login,
      logout,
    }),
    [auth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
