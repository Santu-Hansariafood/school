import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, User, Lock, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { createApiClient } from '@/lib/axiosInstance'

const Login = ({ onLogin, apiKey }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [showAdminOTP, setShowAdminOTP] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState(null)
  const [tempPassword, setTempPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [adminEmails, setAdminEmails] = useState([])
  const [selectedAdminEmail, setSelectedAdminEmail] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpMessage, setOtpMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const api = createApiClient(apiKey)
      const res = await api.post('/api/auth/login', {
        username: credentials.username,
        password: credentials.password
      })
      const { user } = res.data
      onLogin(user)
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
      setIsLoading(false)
    }
  }

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
    let password = ''
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setResetStatus(null)
    setTempPassword('')

    await new Promise(resolve => setTimeout(resolve, 1000))
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail)) {
      setResetStatus({ type: 'error', message: 'Please enter a valid email address' })
      setIsLoading(false)
      return
    }
    const newPassword = generateTempPassword()
    setTempPassword(newPassword)
    setResetStatus({ type: 'success', message: 'If the email exists, a reset link has been sent.' })
    setIsLoading(false)
  }

  const handleBackToLogin = () => {
    setShowReset(false)
    setShowAdminOTP(false)
    setResetEmail('')
    setResetStatus(null)
    setTempPassword('')
    setError('')
    setAdminEmails([])
    setSelectedAdminEmail('')
    setOtpCode('')
    setOtpMessage(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  }

  const shakeVariants = {
    shake: {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  }

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

        <AnimatePresence mode="wait">
          {!showReset && !showAdminOTP ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
              variants={containerVariants}
            >
              <motion.h2 variants={itemVariants} className="text-xl font-semibold text-center mb-6 text-gray-900">Sign in</motion.h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <motion.input type="text" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" whileFocus={{ scale: 1.005 }} required />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <motion.input type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" whileFocus={{ scale: 1.005 }} required />
                  </div>
                </motion.div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      variants={shakeVariants}
                      animate="shake"
                      className="bg-red-50 border border-red-200 rounded-xl p-3"
                    >
                      <p className="text-red-600 text-sm font-medium text-center">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button variants={itemVariants} type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed">
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : (
                    'Sign in'
                  )}
                </motion.button>
              </form>

              {/* Forgot password link */}
              <motion.div variants={itemVariants} className="mt-6 text-center">
                <motion.button onClick={() => setShowReset(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot password?</motion.button>
              </motion.div>
              <motion.div variants={itemVariants} className="mt-2 text-center">
                <motion.button
                  onClick={async () => {
                    setShowAdminOTP(true)
                    setOtpMessage(null)
                    try {
                      const api = createApiClient(apiKey)
                      const res = await api.get('/api/auth/admin/emails')
                      const emails = res.data?.emails || []
                      setAdminEmails(emails)
                      setSelectedAdminEmail(emails[0] || '')
                    } catch (e) {
                      setOtpMessage({ type: 'error', message: 'Failed to load admin emails' })
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in as Admin with OTP
                </motion.button>
              </motion.div>

              {/* Demo credentials */}
              <motion.div
                variants={itemVariants}
                className="mt-8 pt-6 border-t border-gray-200"
              >
                <p className="text-sm text-gray-600 text-center mb-3 font-medium">Demo Credentials:</p>
                <motion.div
                  className="space-y-2 text-xs text-gray-600"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  <motion.p
                    variants={itemVariants}
                    className="bg-gray-50 rounded-lg p-2"
                  >
                    <span className="font-semibold text-gray-800">Admin:</span> admin@school.com / admin123
                  </motion.p>
                  <motion.p
                    variants={itemVariants}
                    className="bg-gray-50 rounded-lg p-2"
                  >
                    <span className="font-semibold text-gray-800">Teacher:</span> teacher / teacher123
                  </motion.p>
                  <motion.p
                    variants={itemVariants}
                    className="bg-gray-50 rounded-lg p-2"
                  >
                    <span className="font-semibold text-gray-800">Student:</span> student / student123
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : showReset ? (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
              variants={containerVariants}
            >
              {/* Back button */}
              <motion.button
                variants={itemVariants}
                onClick={handleBackToLogin}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-300 group"
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-medium">Back to Login</span>
              </motion.button>

              <motion.h2 variants={itemVariants} className="text-xl font-semibold text-center mb-2 text-gray-900">Reset password</motion.h2>
              <motion.p variants={itemVariants} className="text-sm text-gray-600 text-center mb-8">Enter your email address and we&#39;ll generate a temporary password for you</motion.p>

              <form onSubmit={handleResetSubmit} className="space-y-6">
                {/* Email field */}
                <motion.div variants={itemVariants} className="relative">
                  <motion.label
                    className="absolute left-3 text-sm font-medium text-gray-600 transition-all duration-300"
                    animate={{
                      top: focusedField === 'email' || resetEmail ? '-10px' : '14px',
                      fontSize: focusedField === 'email' || resetEmail ? '0.75rem' : '0.875rem',
                      backgroundColor: focusedField === 'email' || resetEmail ? '#ffffff' : 'transparent',
                      paddingLeft: focusedField === 'email' || resetEmail ? '4px' : '0px',
                      paddingRight: focusedField === 'email' || resetEmail ? '4px' : '0px',
                    }}
                  >
                    Email Address
                  </motion.label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300" />
                    <motion.input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
                      whileFocus={{ scale: 1.01 }}
                      required
                    />
                  </div>
                </motion.div>

                {/* Status message */}
                <AnimatePresence>
                  {resetStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                      className={`p-4 rounded-xl ${
                        resetStatus.type === 'success'
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-red-50 border-2 border-red-200'
                      }`}
                    >
                      <div className="flex items-start">
                        {resetStatus.type === 'success' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          </motion.div>
                        )}
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              resetStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}
                          >
                            {resetStatus.message}
                          </p>
                          {tempPassword && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ delay: 0.3 }}
                              className="mt-3 p-3 bg-white rounded-lg border-2 border-green-300"
                            >
                              <p className="text-xs text-gray-600 mb-1 font-medium">Your temporary password:</p>
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-lg font-mono font-bold text-gray-800 break-all bg-gray-50 p-2 rounded"
                              >
                                {tempPassword}
                              </motion.p>
                              <p className="text-xs text-gray-500 mt-2">
                                Please save this password and change it after logging in
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span>Processing...</span>
                    </motion.div>
                  ) : (
                    'Reset Password'
                  )}
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </motion.button>
              </form>

              {/* Demo emails */}
              <motion.div
                variants={itemVariants}
                className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
              >
                <p className="text-xs text-gray-700 mb-2 font-semibold">Demo User Emails:</p>
                <motion.div
                  className="space-y-1 text-xs text-gray-700"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  <motion.p variants={itemVariants} className="bg-white/70 rounded p-2">
                    <span className="font-semibold text-gray-800">Admin:</span> admin@school.com
                  </motion.p>
                  <motion.p variants={itemVariants} className="bg-white/70 rounded p-2">
                    <span className="font-semibold text-gray-800">Teacher:</span> john@school.com
                  </motion.p>
                  <motion.p variants={itemVariants} className="bg-white/70 rounded p-2">
                    <span className="font-semibold text-gray-800">Student:</span> emma@school.com
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="admin-otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
              variants={containerVariants}
            >
              <motion.button
                variants={itemVariants}
                onClick={handleBackToLogin}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-300 group"
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-medium">Back to Login</span>
              </motion.button>

              <motion.h2 variants={itemVariants} className="text-xl font-semibold text-center mb-2 text-gray-900">Admin OTP Sign in</motion.h2>
              <motion.p variants={itemVariants} className="text-sm text-gray-600 text-center mb-8">Choose admin email and verify with a 6-digit code</motion.p>

              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                  <select
                    value={selectedAdminEmail}
                    onChange={(e) => setSelectedAdminEmail(e.target.value)}
                    className="w-full pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    {adminEmails.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div variants={itemVariants} className="flex gap-3">
                  <motion.button
                    onClick={async () => {
                      setOtpMessage(null)
                      if (!selectedAdminEmail) {
                        setOtpMessage({ type: 'error', message: 'Select an admin email' })
                        return
                      }
                      setOtpSending(true)
                      try {
                        const api = createApiClient(apiKey)
                        await api.post('/api/auth/admin/send-otp', { email: selectedAdminEmail })
                        setOtpMessage({ type: 'success', message: 'OTP sent to selected email' })
                      } catch (e) {
                        const msg = e?.response?.data?.message || 'Failed to send OTP'
                        setOtpMessage({ type: 'error', message: msg })
                      } finally {
                        setOtpSending(false)
                      }
                    }}
                    disabled={otpSending}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-70"
                    whileTap={{ scale: 0.98 }}
                  >
                    {otpSending ? 'Sending...' : 'Send OTP'}
                  </motion.button>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <motion.button
                    onClick={async () => {
                      setOtpMessage(null)
                      if (!selectedAdminEmail || otpCode.length !== 6) {
                        setOtpMessage({ type: 'error', message: 'Enter email and 6-digit OTP' })
                        return
                      }
                      setOtpVerifying(true)
                      try {
                        const api = createApiClient(apiKey)
                        const res = await api.post('/api/auth/admin/verify-otp', { email: selectedAdminEmail, otp: otpCode })
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
                    whileTap={{ scale: 0.98 }}
                  >
                    {otpVerifying ? 'Verifying...' : 'Verify'}
                  </motion.button>
                </motion.div>

                <AnimatePresence>
                  {otpMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`rounded-xl p-3 ${otpMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                    >
                      <p className={`${otpMessage.type === 'success' ? 'text-green-700' : 'text-red-700'} text-sm text-center`}>{otpMessage.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Login
