import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Loader2 } from 'lucide-react'
import { createApiClient } from '@/lib/axiosInstance'

const Login = ({ onLogin, apiKey }) => {
  const [role, setRole] = useState('admin')
  const [adminEmails, setAdminEmails] = useState([])
  const [email, setEmail] = useState('')
  const [selectedAdminEmail, setSelectedAdminEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpMessage, setOtpMessage] = useState(null)
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold ml-3 text-gray-900">School Portal</h1>
        </div>

        <div>
          <div className="mb-6 grid grid-cols-3 gap-2">
            {['admin','teacher','student'].map((r) => (
              <button
                key={r}
                onClick={async () => {
                  setRole(r)
                  setOtpMessage(null)
                  setOtpCode('')
                  setEmail('')
                  if (r === 'admin') {
                    try {
                      const api = createApiClient(apiKey)
                      const res = await api.get('/api/auth/admin/emails')
                      const emails = res.data?.emails || []
                      setAdminEmails(emails)
                      setSelectedAdminEmail(emails[0] || '')
                    } catch {
                      setAdminEmails([])
                      setSelectedAdminEmail('')
                    }
                  }
                }}
                className={`py-2 rounded-lg border ${role===r?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300'}`}
              >
                {r.charAt(0).toUpperCase()+r.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {role === 'admin' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                <select
                  value={selectedAdminEmail}
                  onChange={(e) => setSelectedAdminEmail(e.target.value)}
                  className="w-full pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  {adminEmails.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            ) : (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Mail className="absolute left-3 top-10 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setOtpMessage(null)
                  const chosenEmail = role==='admin' ? selectedAdminEmail : email
                  if (!chosenEmail) {
                    setOtpMessage({ type: 'error', message: 'Enter/select an email' })
                    return
                  }
                  setOtpSending(true)
                  try {
                    const api = createApiClient(apiKey)
                    await api.post('/api/auth/send-otp', { email: chosenEmail, role })
                    setOtpMessage({ type: 'success', message: 'OTP sent to email' })
                  } catch (e) {
                    const msg = e?.response?.data?.message || 'Failed to send OTP'
                    setOtpMessage({ type: 'error', message: msg })
                  } finally {
                    setOtpSending(false)
                  }
                }}
                disabled={otpSending}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-70"
              >
                {otpSending ? <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</span> : 'Send OTP'}
              </button>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e)=>setOtpCode(e.target.value.replace(/\\D/g,''))}
                placeholder="Enter 6-digit OTP"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <button
                onClick={async () => {
                  setOtpMessage(null)
                  const chosenEmail = role==='admin' ? selectedAdminEmail : email
                  if (!chosenEmail || otpCode.length!==6) {
                    setOtpMessage({ type: 'error', message: 'Enter email and 6-digit OTP' })
                    return
                  }
                  setOtpVerifying(true)
                  try {
                    const api = createApiClient(apiKey)
                    const res = await api.post('/api/auth/verify-otp', { email: chosenEmail, role, otp: otpCode })
                    const { user } = res.data
                    onLogin(user)
                  } catch (e) {
                    const msg = e?.response?.data?.message || 'Invalid OTP'
                    setOtpMessage({ type: 'error', message: msg })
                  } finally {
                    setOtpVerifying(false)
                  }
                }}
                disabled={otpVerifying}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-70"
              >
                {otpVerifying ? <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...</span> : 'Verify'}
              </button>
            </div>

            {otpMessage && (
              <div className={`rounded-xl p-3 ${otpMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`${otpMessage.type === 'success' ? 'text-green-700' : 'text-red-700'} text-sm text-center`}>{otpMessage.message}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
