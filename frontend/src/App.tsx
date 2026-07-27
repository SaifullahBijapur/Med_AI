import Layout from "./Layout"
import Dashboard from "./elements/Dashboard"
import Analytics from "./elements/Analytics"
import Appoinments from "./elements/Appoinments"
import Doctors from "./elements/Doctors"
import Patients from "./elements/Patients"
import Reports from "./elements/Reports"
import Settings from "./elements/Settings"
import Emergency from "./elements/Emergency"
import BedManagement from "./elements/BedManagement"
import Assistant from "./elements/Assistant"
import LoginPage from "./authentication/login"
import ProtectedRoute from "./authentication/ProtectedRoute"
import SuperAdminDashboard from "./elements/superadmin/SuperAdminDashboard"
import HospitalList from "./elements/superadmin/HospitalList"
import GlobalAnalytics from "./elements/superadmin/GlobalAnalytics"
import { Routes, Route, Navigate } from "react-router-dom"
import Register from "./authentication/Register"

export function App() {
  return (
    <Routes>
      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Register />} />

      {/* Super Admin Routes */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="hospitals" element={<HospitalList />} />
        <Route path="analytics" element={<GlobalAnalytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Hospital Admin / Doctor / Receptionist Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["hospital_admin", "doctor", "receptionist", "patient"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="appointments" element={<Appoinments />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="patients" element={<Patients />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="bedmanagement" element={<BedManagement />} />
        <Route path="assistant" element={<Assistant />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
