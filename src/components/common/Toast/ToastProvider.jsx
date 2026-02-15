"use client"
import { createContext, useCallback, useContext, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    ({ type = "info", message = "", duration = 3000 }) => {
      if (!message) return
      const id = Date.now() + Math.random()
      const toast = { id, type, message, duration }
      setToasts((prev) => [...prev, toast])
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const value = { showToast }

  const getClasses = (type) => {
    if (type === "success") {
      return "border-emerald-200 bg-emerald-50 text-emerald-800"
    }
    if (type === "error") {
      return "border-red-200 bg-red-50 text-red-800"
    }
    if (type === "warning") {
      return "border-amber-200 bg-amber-50 text-amber-800"
    }
    return "border-slate-200 bg-white text-slate-800"
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-50 top-4 right-4 flex flex-col gap-3 max-w-sm">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${getClasses(
                toast.type
              )}`}
            >
              <div className="flex-1 text-sm leading-snug">{toast.message}</div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-xs uppercase tracking-wide"
              >
                Close
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

