import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Loader2, Shield, User } from 'lucide-react'
import { createApiClient } from '@/lib/axiosInstance'

const Login = ({ onLogin, apiKey }) => {
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpMessage, setOtpMessage] = useState(null)
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-200/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-white">School Portal</h1>
              <p className="text-xs text-white/80">Access your dashboard securely</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 p-1 rounded-xl">
            {['admin','teacher','student'].map((r) => (
              <button
                key={r}
                onClick={async () => {
                  setRole(r)
                  setOtpMessage(null)
                  setOtpCode('')
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
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {role === 'admin' ? 'Admin Email' : 'Email'}
              </label>
              <Mail className="absolute left-3 top-10 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  setOtpMessage(null)
                  if (!email) {
                    setOtpMessage({ type: 'error', message: 'Enter/select an email' })
                    return
                  }
                  setOtpSending(true)
                  try {
                    const api = createApiClient(apiKey)
                    await api.post('/api/auth/send-otp', { email, role })
                    setOtpMessage({ type: 'success', message: 'OTP sent to email' })
                  } catch (e) {
                    const status = e?.response?.status
                    const msg = e?.response?.data?.message || 'Failed to send OTP'
                    setOtpMessage({ type: 'error', message: status === 403 ? 'Connect to admin for access' : msg })
                  } finally {
                    setOtpSending(false)
                  }
                }}
                disabled={otpSending}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow disabled:opacity-70"
              >
                {otpSending ? <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</span> : 'Send OTP'}
              </button>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e)=>setOtpCode(e.target.value.replace(/\\D/g,''))}
                placeholder="Enter 6-digit OTP"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none font-mono tracking-widest text-lg"
              />
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
                    const { user } = res.data
                    onLogin(user)
                  } catch (e) {
                    const status = e?.response?.status
                    const msg = e?.response?.data?.message || 'Invalid OTP'
                    setOtpMessage({ type: 'error', message: status === 403 ? 'Connect to admin for access' : msg })
                  } finally {
                    setOtpVerifying(false)
                  }
                }}
                disabled={otpVerifying}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow disabled:opacity-70"
              >
                {otpVerifying ? <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...</span> : 'Verify'}
              </button>
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
  )
}

export default Login
