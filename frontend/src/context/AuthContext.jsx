import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem('agritrade_session')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (session) {
      localStorage.setItem('agritrade_session', JSON.stringify(session))
    } else {
      localStorage.removeItem('agritrade_session')
    }
  }, [session])

  const login = (sessionData) => {
    setSession(sessionData)
  }

  const logout = () => {
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, setSession, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuthContext() {
  return useContext(AuthContext)
}

export { AuthProvider, useAuthContext }
export default AuthContext


