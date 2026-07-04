import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Mail, Lock, Eye, EyeOff, Building2,
  User, Phone, AlertCircle, CheckCircle
} from 'lucide-react'
import { signup } from '../../utils/auth.js'

function SignupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const defaultRole = searchParams.get('role') === 'owner' ? 'owner' : 'customer'

  const [role, setRole]               = useState(defaultRole)
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [phone, setPhone]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [businessName, setBusinessName]       = useState('')
  const [errors, setErrors]           = useState({})
  const [loading, setLoading]         = useState(false)

  function getPasswordStrength(pwd) {
    if (pwd.length === 0) return null
    if (pwd.length < 6)   return { label: 'Too short', color: 'bg-red-400',    width: 'w-1/4' }
    if (pwd.length < 8)   return { label: 'Weak',      color: 'bg-orange-400', width: 'w-2/4' }
    if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/))
                          return { label: 'Strong',    color: 'bg-teal-500',   width: 'w-full' }
    return                       { label: 'Fair',      color: 'bg-amber-400',  width: 'w-3/4' }
  }

  const passwordStrength = getPasswordStrength(password)

  function validate() {
    const newErrors = {}
    if (!name.trim())     newErrors.name     = 'Full name is required'
    if (!email.trim())    newErrors.email    = 'Email is required'
    else if (!email.includes('@')) newErrors.email = 'Enter a valid email'
    if (!phone.trim())    newErrors.phone    = 'Phone is required'
    else if (phone.length < 10)   newErrors.phone = 'Enter a valid 10-digit number'
    if (!password)        newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Minimum 6 characters'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (role === 'owner' && !businessName.trim())
      newErrors.businessName = 'Business name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSignup(e) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const data = await signup({
        name, email, phone, password, role, businessName
      })
      if (data.user.role === 'owner') {
        navigate('/owner/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setErrors({
        email: err.response?.data?.error || 'Signup failed. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  function inputClass(field) {
    return `w-full border rounded-xl py-3 text-sm outline-none transition-colors ${
      errors[field]
        ? 'border-red-300 bg-red-50 focus:border-red-400'
        : 'border-gray-200 focus:border-teal-400 bg-white'
    }`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building2 size={28} className="text-teal-700" />
            <span className="text-2xl font-bold text-teal-700">BookMyVenue</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Create your account</h1>
          <p className="text-sm text-gray-400 mt-1">India's smartest venue booking platform</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">

          {/* Role selector */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === 'customer'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              I want to book
            </button>
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === 'owner'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              I own a venue
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">

            {/* Full name */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Full name *</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Rinshan Khan"
                  className={`${inputClass('name')} pl-10`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.name}
                </p>
              )}
            </div>

            {/* Business name — owners only */}
            {role === 'owner' && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Business / venue name *</label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="Grand Banquet Hall"
                    className={`${inputClass('businessName')} pl-10`}
                  />
                </div>
                {errors.businessName && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.businessName}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email address *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputClass('email')} pl-10`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Phone number *</label>
              <div className="flex gap-2">
                <span className="border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-500 bg-gray-50 shrink-0">+91</span>
                <div className="relative flex-1">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className={`${inputClass('phone')} pl-10`}
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`${inputClass('password')} pl-10 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {passwordStrength && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
                  </div>
                  <p className={`text-xs mt-1 ${passwordStrength.label === 'Strong' ? 'text-teal-600' : 'text-gray-400'}`}>
                    {passwordStrength.label === 'Strong' && <CheckCircle size={11} className="inline mr-1" />}
                    {passwordStrength.label}
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Confirm password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`${inputClass('confirmPassword')} pl-10 pr-11`}
                />
                {confirmPassword && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {password === confirmPassword
                      ? <CheckCircle size={15} className="text-teal-500" />
                      : <AlertCircle size={15} className="text-red-400" />
                    }
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.confirmPassword}
                </p>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center">
              By signing up you agree to our{' '}
              <span className="text-teal-600 cursor-pointer hover:underline">Terms</span>
              {' '}and{' '}
              <span className="text-teal-600 cursor-pointer hover:underline">Privacy Policy</span>
            </p>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
                loading
                  ? 'bg-teal-400 text-white cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-800 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </span>
              ) : `Create ${role === 'owner' ? 'owner' : ''} account`}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-700 font-medium hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default SignupPage