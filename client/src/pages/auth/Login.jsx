import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import useAuth from '../../hooks/useAuth.js'
import Logo from '../../components/common/Logo.jsx'
import TextField from "../auth/TextField.jsx"
import PasswordInput from "../auth/PasswordInput.jsx"

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const googleWrapperRef = useRef(null)
  const [googleWidth, setGoogleWidth] = useState(336)

  useEffect(() => {
    const updateWidth = () => {
      if (googleWrapperRef.current) {
        setGoogleWidth(Math.floor(googleWrapperRef.current.offsetWidth))
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', formData)
      login(res.data.user, res.data.accessToken)
      toast.success('Login successful')
      navigate('/dashboard')
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', {
        credential: credentialResponse.credential
      })
      login(res.data.user, res.data.accessToken)
      toast.success('Login successful')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Google login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <Logo />
          <h1 className="text-xl sm:text-[22px] font-semibold text-slate-900 mt-4 tracking-tight text-center">
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm sm:text-[15px] mt-1 text-center">Sign in to CertiScan AI</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="rushi@gmail.com"
              required
            />

            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl font-medium text-[15px] hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:active:scale-100"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div ref={googleWrapperRef} className="flex justify-center w-full [&>div]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              shape="pill"
              width={googleWidth}
            />
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-slate-900 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login