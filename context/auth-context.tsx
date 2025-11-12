"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

axios.defaults.withCredentials = true 
interface User {
  user_id: string
  username: string
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, full_name: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

   const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        { username, password },
        { withCredentials: true }
      )

      const data = response.data
      const userData = {
        user_id: data.user_id,
        username: data.username,
        is_admin: true,
      }

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }
  const signup = async (username: string, full_name: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, full_name, password ,player_role:"BATSMAN"}),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Signup failed")
      }

      const data = await response.json()
      const userData = {
        user_id: data.user_id,
        username: data.username,
        is_admin: true,
        
      }
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
