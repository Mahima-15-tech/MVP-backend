import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/lightlogo.svg";

export default function ResetPassword() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {

      await api.post("/admin/reset-password", {
        token,
        newPassword: password,
      });

      setSuccess("Password reset successful. Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-xl p-10">

          <div className="flex justify-center mb-8">
            <img src={logo} alt="SoLo Admin" className="h-14" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-800 text-center">
            Reset Password
          </h1>

          <p className="text-sm text-gray-500 text-center mt-2 mb-8">
            Enter your new password
          </p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-2 rounded-lg mb-6 text-center">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="text-sm text-gray-600">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full mt-2 px-0 py-2 border-b border-gray-300 focus:border-indigo-600 focus:outline-none bg-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-black transition disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}