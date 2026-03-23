import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import logo from "../assets/lightlogo.svg";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputsRef = useRef([]);

  // 🔥 Countdown Timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // 🔥 OTP Change Handler
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // 🔥 Password Strength
  const getStrength = () => {
    if (password.length < 6) return 1;
    if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return 3;
    return 2;
  };

  const strength = getStrength();

  // STEP 1: Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/admin/forgot-password", { email });
      setStep(2);
      setTimer(60);
      setMessage("OTP sent to your registered number.");
    } catch (err) {
      setError(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 + 3: Verify OTP + Reset Password
  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/admin/reset-password", {
        email,
        otp: otp.join(""),
        newPassword: password,
      });

      setMessage("Password reset successful!");
      setTimeout(() => navigate("/"), 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">

        <div className="flex justify-center mb-6">
          <img src={logo} alt="SoLo Admin" className="h-14" />
        </div>

        <h1 className="text-2xl text-gray-500 font-semibold text-center mb-2">
          {step === 1 ? "Forgot Password" : "Verify & Reset"}
        </h1>

        {message && (
          <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm text-center mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm text-center mb-4">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={sendOtp} className="space-y-6">

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 px-0 py-2 text-gray-900 border-b border-gray-300 focus:border-indigo-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white rounded-lg"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

          </form>
        )}

        {step === 2 && (
          <form onSubmit={resetPassword} className="space-y-6">

            {/* OTP Input */}
            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(e.target.value, index)
                  }
                  className="w-12 h-12 text-center text-gray-500 text-lg border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ))}
            </div>

            {/* Resend */}
            <div className="text-center text-sm">
              {timer > 0 ? (
                <span className="text-gray-500">
                  Resend OTP in {timer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={sendOtp}
                  className="text-indigo-600 hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm text-gray-600">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 px-0 py-2 text-gray-500 border-b border-gray-300 focus:border-indigo-600 outline-none"
              />

              {/* Strength Meter */}
              <div className="h-2 mt-2 bg-gray-200 rounded">
                <div
                  className={`h-2 rounded ${
                    strength === 1
                      ? "w-1/3 bg-red-500"
                      : strength === 2
                      ? "w-2/3 bg-yellow-500"
                      : "w-full bg-green-500"
                  }`}
                ></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white rounded-lg"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}