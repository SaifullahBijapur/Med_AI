import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const storedRole = localStorage.getItem("userRole")

      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        // Verify token with backend
        const response = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          const user = response.data.user
          setUserRole(user.role)
          localStorage.setItem("userRole", user.role)
          localStorage.setItem("hospitalId", user.hospitalId || "")
          localStorage.setItem("hospitalName", user.hospital?.name || "")

          // Check role permissions
          if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
          localStorage.removeItem("token")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuthenticated(false)
        localStorage.removeItem("token")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [allowedRoles])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect superadmin to superadmin dashboard
  if (userRole === "superadmin" && !window.location.pathname.startsWith("/superadmin")) {
    return <Navigate to="/superadmin" replace />
  }

  // Redirect non-superadmin away from superadmin routes
  if (userRole !== "superadmin" && window.location.pathname.startsWith("/superadmin")) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
