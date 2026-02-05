import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import AdminGuard from "./AdminGuard";
import Users from "../pages/Users";
import Alerts from "../pages/Alerts";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
  path="/dashboard"
  element={
    <AdminGuard>
      <Dashboard />
    </AdminGuard>
  }
/>
<Route
  path="/users"
  element={
    <AdminGuard>
      <Users />
    </AdminGuard>
  }
/>

<Route
  path="/alerts"
  element={
    <AdminGuard>
      <Alerts />
    </AdminGuard>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}
