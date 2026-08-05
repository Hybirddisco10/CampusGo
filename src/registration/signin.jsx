// src/registration/signin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function SignIn() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [role, setRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const errs = {};
    if (!form.email.includes("@")) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    const result = await login({
      ...form,
      accountType: role === "rider" ? "RIDER" : "CUSTOMER",
    });
    setIsSubmitting(false);

    if (!result.success) {
      // Error is already toasted in AuthContext
      // Optionally set field errors if needed
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-white border text-[#14291d] text-sm placeholder-[#a8b5ae] focus:outline-none focus:ring-2 focus:ring-[#15803d]/20 transition-all ${
      errors[field]
        ? "border-red-500"
        : "border-[#d8ded9] focus:border-[#15803d]/60"
    }`;

  // ── ROLE SELECTION SCREEN ──
  if (!role) {
    return (
      <div
        className="min-h-screen bg-white text-[#14291d] flex flex-col"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <nav className="py-4 px-6 pr-24 flex justify-end items-center">
          <p className="text-sm text-[#5c7768] m-0 py-4 px-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-[#15803d] font-semibold hover:text-[#166534] transition-colors no-underline"
            >
              Sign Up
            </Link>
          </p>
        </nav>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-[#eab308]/10 border border-[#eab308]/35 text-[#a16207] px-4 py-1.5 rounded-full text-xs mb-5 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] animate-pulse" />
                Welcome back
              </div>
              <h1 className="text-4xl font-bold text-[#0f2e1c] mb-3">
                Sign in to <span className="text-[#15803d]">CampusGo</span>
              </h1>
              <p className="text-sm text-[#5c7768] font-light leading-relaxed">
                Are you signing in to send deliveries, <br /> or to ride and
                deliver for others?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setRole("user")}
                className="group flex flex-col items-center text-center p-8 bg-white border border-[#e5e9e6] rounded-2xl hover:border-[#15803d]/40 hover:bg-[#15803d]/5 transition-all duration-200 cursor-pointer"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  🎒
                </div>
                <h3 className="text-lg font-semibold text-[#0f2e1c] mb-2">
                  I'm a User
                </h3>
                <p className="text-xs text-[#5c7768] leading-relaxed font-light">
                  Sign in to request and track deliveries
                </p>
                <div className="mt-5 px-4 py-1.5 bg-[#eab308]/10 border border-[#eab308]/30 text-[#a16207] text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Sign in as User →
                </div>
              </button>

              <button
                onClick={() => setRole("rider")}
                className="group flex flex-col items-center text-center p-8 bg-white border border-[#e5e9e6] rounded-2xl hover:border-[#15803d]/40 hover:bg-[#15803d]/5 transition-all duration-200 cursor-pointer"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  🏍️
                </div>
                <h3 className="text-lg font-semibold text-[#0f2e1c] mb-2">
                  I'm a Rider
                </h3>
                <p className="text-xs text-[#5c7768] leading-relaxed font-light">
                  Sign in to view and accept delivery requests
                </p>
                <div className="mt-5 px-4 py-1.5 bg-[#eab308]/10 border border-[#eab308]/30 text-[#a16207] text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Sign in as Rider →
                </div>
              </button>
            </div>

            <p className="text-center text-xs text-[#a8b5ae]">
              Signing in as the wrong role? You can switch on the next screen.
            </p>
          </div>
        </main>

        <footer className="text-center py-4 border-t border-[#e5e9e6]">
          <p className="text-xs text-[#a8b5ae] m-0">
            © 2026 CampusGo. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  // ── SIGN IN FORM ──
  return (
    <div
      className="min-h-screen bg-white text-[#14291d] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <nav className="py-4 px-6 pr-24 flex justify-between items-center">
        <button
          onClick={() => {
            setRole(null);
            setErrors({});
            setForm({ email: "", password: "" });
          }}
          className="flex items-center gap-2 text-sm text-[#5c7768] hover:text-[#15803d] transition-colors bg-transparent border-none cursor-pointer p-0 py-4 px-6"
        >
          ← Change role
        </button>
        <p className="text-sm text-[#5c7768] m-0">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#15803d] font-semibold hover:text-[#166534] transition-colors no-underline"
          >
            Sign Up
          </Link>
        </p>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#eab308]/10 border border-[#eab308]/35 text-[#a16207] px-4 py-1.5 rounded-full text-xs mb-5 tracking-wide">
              {role === "user"
                ? "🎒 Signing in as a User"
                : "🏍️ Signing in as a Rider"}
            </div>
            <h1 className="text-4xl font-bold text-[#0f2e1c] mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-[#5c7768] font-light">
              {role === "user"
                ? "Sign in to request and track your deliveries."
                : "Sign in to view requests and start earning."}
            </p>
          </div>

          <div className="bg-[#FAFAF8] border border-[#e5e9e6] rounded-2xl p-8">
            <div className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-[#33513f] font-medium tracking-wide">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#15803d] hover:text-[#166534] transition-colors no-underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={inputClass("password")}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a90] hover:text-[#15803d] transition-colors text-lg bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || loading}
                className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-[#14291d] py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#eab308]/25 mt-1 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting
                  ? "Signing in..."
                  : role === "rider"
                  ? "Sign In as Rider →"
                  : "Sign In →"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 border-t border-[#e5e9e6]">
        <p className="text-xs text-[#a8b5ae] m-0">
          © 2026 CampusGo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default SignIn;
