import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Building2, AlertCircle } from 'lucide-react'
import { login as loginAPI } from '../../utils/auth.js'
import { useAuth } from '../../context/AuthContext.jsx'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)

  function validate() {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!email.includes('@')) newErrors.email = 'Enter a valid email'
    if (!password.trim()) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Minimum 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      // Call real backend API
      const data = await loginAPI({ email, password })

      // Update global auth context
      login(data.user)

      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (data.user.role === 'owner') {
        navigate('/owner/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      // Show exact error from backend
      const message = err.response?.data?.error || 'Login failed. Please try again.'
      setErrors({ email: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 size={28} className="text-teal-700" />
            <span className="text-2xl font-bold text-teal-700">BookMyVenue</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors ${
                    errors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-teal-400'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-600">Password</label>
                <button type="button" className="text-xs text-teal-600 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full border rounded-xl pl-10 pr-11 py-3 text-sm outline-none transition-colors ${
                    errors.password
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 focus:border-teal-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                loading
                  ? 'bg-teal-400 text-white cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Demo hints */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6">
            <p className="text-xs font-medium text-teal-800 mb-2">Demo accounts</p>
            <div className="space-y-1 text-xs text-teal-700">
              <p>Customer → rinshan@test.com / test123</p>
              <p>Owner → owner@bookmyvenue-demo.com / demo1234</p>
              <p>Admin → admin@bookmyvenue.com / admin1234</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-700 font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage