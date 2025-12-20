"use client"
import { createContext, useContext, useMemo } from "react"
import { createApiClient } from "@/lib/axiosInstance"

const ApiClientContext = createContext(null)

export function ApiClientProvider({ apiKey, children }) {
  const client = useMemo(() => createApiClient(apiKey), [apiKey])
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>
}

export function useApiClient() {
  const ctx = useContext(ApiClientContext)
  if (!ctx) throw new Error("useApiClient must be used within ApiClientProvider")
  return ctx
}

