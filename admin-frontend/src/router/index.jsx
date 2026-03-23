import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Alerts from "../pages/Alerts";
import CheckinLogs from "../pages/CheckinLogs";
import AdminGuard from "./AdminGuard";
import AdminLayout from "../layouts/AdminLayout";
import UserDetail from "../pages/UserDetail";
import SettingsPage from "../pages/Settings/AdminSettings";
import ProfileSection from "../pages/Settings/ProfileSection";
import ChangePassword from "../pages/Settings/ChangePassword";
import AdminManagement from "../pages/Settings/AdminManagement";
import SystemHealth from "../pages/Settings/SystemHealth";
import AdminSMSLogs from "../pages/AdminSMSLogs";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import SupportTickets from "../pages/SupportTickets";

export default function AppRouter() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <AdminGuard>
              <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                <Dashboard />
              </AdminLayout>
            </AdminGuard>
          }
        />

        <Route
          path="/users"
          element={
            <AdminGuard>
              <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                <Users />
              </AdminLayout>
            </AdminGuard>
          }
        />

        <Route
          path="/alerts"
          element={
            <AdminGuard>
              <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                <Alerts />
              </AdminLayout>
            </AdminGuard>
          }
        />

        <Route
          path="/checkins"
          element={
            <AdminGuard>
              <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                <CheckinLogs />
              </AdminLayout>
            </AdminGuard>
          }
        />

<Route
  path="/users/:id"
  element={
    <AdminGuard>
      <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}>
        <UserDetail />
      </AdminLayout>
    </AdminGuard>
  }
/>

<Route
  path="/sms-logs"
  element={
    <AdminGuard>
      <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}>
        <AdminSMSLogs />
      </AdminLayout>
    </AdminGuard>
  }
/>


<Route
  path="/support"
  element={
    <AdminGuard>
      <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}>
        <SupportTickets />
      </AdminLayout>
    </AdminGuard>
  }
/>

<Route
  path="/settings"
  element={
    <AdminGuard>
      <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}>
        <SettingsPage />
      </AdminLayout>
    </AdminGuard>
  }
/>




<Route path="/settings/profile" element={ <AdminGuard>
      <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}><ProfileSection /></AdminLayout>
    </AdminGuard>} />
<Route path="/settings/security" element={ <AdminGuard>
      <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}><ChangePassword /></AdminLayout>
    </AdminGuard>} />
<Route path="/settings/admin-access" element={ <AdminGuard>
      <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}><AdminManagement /></AdminLayout>
    </AdminGuard>} />
<Route path="/settings/system-health" element={<AdminGuard>
      <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode}><SystemHealth /></AdminLayout>
    </AdminGuard>}  />



      </Routes>
    </BrowserRouter>
  );
}