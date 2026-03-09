import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiPost } from '../utils/api'

type AuthContextValue = {
  isAuthenticated: boolean
  user: { id: string; email: string; name: string } | null
  login: (token: string, user: { id: string; email: string; name: string }) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const TOKEN_KEY = 'baesh-token'
const USER_KEY = 'baesh-user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(TOKEN_KEY)
    } catch {
      return false
    }
  })

  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (isAuthenticated && user) {
        localStorage.setItem(TOKEN_KEY, localStorage.getItem(TOKEN_KEY) || '')
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    } catch {}
  }, [isAuthenticated, user])

  const login = useCallback((token: string, userData: { id: string; email: string; name: string }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(() => ({ isAuthenticated, user, login, logout }), [isAuthenticated, user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


