import { createContext, useState, useEffect } from 'react'
import api from '../services/api.js'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
    } catch (error) {
      localStorage.removeItem('accessToken')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const login = (userData, accessToken) => {
    localStorage.setItem('accessToken', accessToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}