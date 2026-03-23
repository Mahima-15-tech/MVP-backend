import { useState } from "react";
import api from "../api/axios";
import { setAdminToken } from "../utils/auth";
import { NavLink } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import SoloLogo from "../components/SoloLogo";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/admin/login", {
        email,
        password,
      });

      setAdminToken(res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      window.location.href = "/dashboard";

    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (

<div className="min-h-screen flex items-center justify-center bg-[#002c3e] px-6">

  <div className="w-full max-w-[500px] py-20">

    {/* Card */}
    <div className="bg-[#f5f5f5] rounded-[22px] shadow-[0_20px_40px_rgba(0,0,0,0.25)] px-12 py-10">

      {/* Logo */}
      <div className="flex justify-center mb-8">
      <img 
    src="/logo2.png"   // ✅ correct path
    alt="logo"
    className="h-full w-62 object-contain"
  />
      </div>

      {/* Title */}
      <h1 className="text-[26px] font-semibold text-[#002c3e] text-center">
        Admin Login
      </h1>

      {/* Subtitle */}
      <p className="text-[14px] text-[#5a6c7d] text-center   mb-10">
        Sign In to Access the Dashboard
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">

        {/* Email */}
        <div>
          <label className="text-[14px] font-medium text-[#5a6c7d]">
            Email
          </label>

          <input
            type="email"
            placeholder="admin@solo.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-2 px-0 py-2 text-[#606060] placeholder-[#b6b9b3] border-b border-[#7f8f93]/50 focus:border-[#002c3e] focus:outline-none bg-transparent"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-[14px] font-medium text-[#5a6c7d]">
            Password
          </label>

          <div className="relative mt-2">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-0 py-2 pr-10 text-[#606060] placeholder-[#b6b9b3] border-b border-[#7f8f93]/50 focus:border-[#002c3e] focus:outline-none bg-transparent"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#7f8f93]"
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>

          </div>
        </div>

        {/* Forgot password */}
        <div className="text-right">
          <NavLink
            to="/forgot-password"
            className="text-[14px] text-[#5a6c7d] hover:text-[#002c3e]"
          >
            Forgot password?
          </NavLink>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-[14px] rounded-full bg-[#0cb4ab] text-[#f5f5f5] font-semibold text-[16px] hover:opacity-90 transition"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

      </form>

    </div>

    {/* Footer */}
    <p className="text-[12px] text-[#d1d9e0] text-center mt-6">
    SOLO © 2026 Social Rebels™ Design Admin Panel
    </p>

  </div>

</div>
  );
}