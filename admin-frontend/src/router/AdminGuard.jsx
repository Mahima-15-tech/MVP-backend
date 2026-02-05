import { Navigate } from "react-router-dom";
import { getAdminToken } from "../utils/auth";

export default function AdminGuard({ children }) {
  const token = getAdminToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
