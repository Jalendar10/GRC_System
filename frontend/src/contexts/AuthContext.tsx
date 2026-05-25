import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: string        // admin | grc_manager | auditor | risk_owner | viewer
  department: string | null
  is_active: boolean
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
  isAuthenticated: false,
})

const TOKEN_KEY = 'grc_access_token'
const USER_KEY  = 'grc_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [token, setToken]     = useState<string | null>(null)
  const [isLoading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser  = localStorage.getItem(USER_KEY)
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser
        setToken(storedToken)
        setUser(parsedUser)
        // Attach token to default axios headers immediately
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        // Verify token is still valid
        axios.get('/api/auth/me')
          .then(res => setUser(res.data))
          .catch(() => {
            // Token expired or invalid — log out silently
            clearSession()
          })
          .finally(() => setLoading(false))
      } catch {
        clearSession()
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    setToken(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password })
    const { access_token, user: userData } = res.data
    localStorage.setItem(TOKEN_KEY, access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    setToken(access_token)
    setUser(userData)
  }

  const logout = () => {
    clearSession()
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{
      user, token,
      login, logout,
      isLoading,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
