import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Loader2, Shield, User } from 'lucide-react'
import { createApiClient } from '@/lib/axiosInstance'

const Login = ({ onLogin, apiKey }) => {
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''))
  const [otpMessage, setOtpMessage] = useState(null)
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const otpCode = otpDigits.join('')
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)
  const otpRefs = useRef([])

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtpDigits(prev => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < otpDigits.length - 1) {
      const nextInput = otpRefs.current[index + 1]
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = otpRefs.current[index - 1]
      if (prevInput) prevInput.focus()
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden px-4 py-8 flex items-center">
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 w-80 h-80 rounded-full bg-blue-300/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-10 w-96 h-96 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="relative z-10 mx-auto w-full max-w-6xl grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >
          <div className="rounded-3xl border border-blue-100 bg-white backdrop-blur-xl px-8 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-xs font-medium mb-6">
              <Shield className="w-4 h-4" />
              <span>OTP based secure access</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Smart School
              <span className="block text-blue-600 text-3xl mt-1">Management Portal</span>
            </h1>
            <p className="text-sm text-slate-600 max-w-md mb-8">
              Sign in as Admin, Teacher, or Student using a one-time password sent to your registered email. No passwords to remember, just fast and secure access.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  Student
                </p>
                <p className="text-[11px] text-slate-600">View attendance, marks, fees and library in one place.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-500" />
                  Teacher
                </p>
                <p className="text-[11px] text-slate-600">Manage classes, mark attendance and publish results.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  Admin
                </p>
                <p className="text-[11px] text-slate-600">Control users, classes, library, and overall configuration.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-pink-500" />
                  Email OTP
                </p>
                <p className="text-[11px] text-slate-600">Secure login via one-time code valid for a short time.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md justify-self-center bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <div className="flex items-center">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-white leading-tight">School Portal Login</h2>
                <p className="text-[11px] text-blue-100/90">Choose role, enter email, and verify OTP</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 bg-white">
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 p-1 rounded-xl">
            {['admin','teacher','student'].map((r) => (
              <button
                key={r}
                onClick={async () => {
                  setRole(r)
                  setOtpMessage(null)
                  setOtpDigits(Array(6).fill(''))
                  setOtpSent(false)
                  setEmail('')
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm sm:text-base transition-all
                 ${role===r
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-700 hover:bg-white/80'}`}
              >
                {r === 'admin' && <Shield className="w-4 h-4" />}
                {r === 'teacher' && <User className="w-4 h-4" />}
                {r === 'student' && <GraduationCap className="w-4 h-4" />}
                <span className="font-medium">{r.charAt(0).toUpperCase()+r.slice(1)}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">
                {roleLabel} Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={async () => {
                  setOtpMessage(null)
                  setOtpDigits(Array(6).fill(''))
                  setOtpSent(false)
                  if (!email) {
                    setOtpMessage({ type: 'error', message: 'Enter/select an email' })
                    return
                  }
                  setOtpSending(true)
                  try {
                    const api = createApiClient(apiKey)
                    await api.post('/api/auth/send-otp', { email, role })
                    setOtpMessage({ type: 'success', message: 'OTP sent to email' })
                    setOtpSent(true)
                  } catch (e) {
                    const status = e?.response?.status
                    const msg = e?.response?.data?.message || 'Failed to send OTP'
                    setOtpMessage({ type: 'error', message: status === 403 ? 'Connect to admin for access' : msg })
                  } finally {
                    setOtpSending(false)
                  }
                }}
                disabled={otpSending}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow disabled:opacity-70"
              >
                {otpSending ? <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</span> : 'Send OTP'}
              </button>

              {otpSent && (
                <div className="space-y-3">
                  <div className="flex justify-center gap-2 flex-wrap">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e)=>handleOtpChange(index, e.target.value)}
                        onKeyDown={(e)=>handleOtpKeyDown(index, e)}
                        className="w-10 h-11 sm:w-11 sm:h-11 border-2 border-gray-200 rounded-xl text-center text-lg font-mono focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    ))}
                  </div>

                  {otpCode.length === 6 && (
                    <button
                      onClick={async () => {
                        setOtpMessage(null)
                        if (!email || otpCode.length!==6) {
                          setOtpMessage({ type: 'error', message: 'Enter email and 6-digit OTP' })
                          return
                        }
                        setOtpVerifying(true)
                        try {
                          const api = createApiClient(apiKey)
                          const res = await api.post('/api/auth/verify-otp', { email, role, otp: otpCode })
                          const { user, token, loginDay } = res.data
                          onLogin({ user, token, loginDay })
                        } catch (e) {
                          const status = e?.response?.status
                          const msg = e?.response?.data?.message || 'Invalid OTP'
                          setOtpMessage({ type: 'error', message: status === 403 ? 'Connect to admin for access' : msg })
                        } finally {
                          setOtpVerifying(false)
                        }
                      }}
                      disabled={otpVerifying}
                      className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow disabled:opacity-70"
                    >
                      {otpVerifying ? <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...</span> : 'Verify'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {otpMessage && (
              <div className={`rounded-xl p-3 border ${otpMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`${otpMessage.type === 'success' ? 'text-green-700' : 'text-red-700'} text-sm text-center font-medium`}>{otpMessage.message}</p>
              </div>
            )}
          </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
