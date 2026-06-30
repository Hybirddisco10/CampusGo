import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignIn() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [userName, setUserName] = useState("");

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

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // In production, this is where you'd call your backend/auth provider
    // and it would return the user's actual name from the database.
    // For now we derive a placeholder name from the email.
    const nameFromEmail = form.email.split("@")[0].split(/[._]/)[0];
    const displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    setUserName(displayName);

    setSubmitted(true);

    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        navigate(role === "rider" ? "/rider-dashboard" : "/user-dashboard");
      }
    }, 1000);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-white/[0.05] border text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
      errors[field] ? "border-red-500" : "border-white/10 focus:border-orange-500/60"
    }`;

  // ── ROLE SELECTION SCREEN ──
  if (!role) {
    return (
      <div className="min-h-screen bg-[#0a1628] text-white flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        <nav className="py-4 px-6 pr-24 flex justify-end items-center">
          <p className="text-sm text-white/50 m-0">
            Don't have an account?{" "}
            <Link to="/signup" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors no-underline">Sign Up</Link>
          </p>
        </nav>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg">

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 text-orange-400 px-4 py-1.5 rounded-full text-xs mb-5 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Welcome back
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Sign in to <span className="text-orange-500">CampusGo</span>
              </h1>
              <p className="text-sm text-white/45 font-light leading-relaxed">
                Are you signing in to send deliveries, <br /> or to ride and deliver for others?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">

              {/* User Card */}
              <button
                onClick={() => setRole("user")}
                className="group flex flex-col items-center text-center p-8 bg-white/3 border border-white/10 rounded-2xl hover:border-orange-500/40 hover:bg-orange-500/5 transition-all duration-200 cursor-pointer"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🎒</div>
                <h3 className="text-lg font-semibold text-white mb-2">I'm a User</h3>
                <p className="text-xs text-white/40 leading-relaxed font-light">
                  Sign in to request and track deliveries
                </p>
                <div className="mt-5 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Sign in as User →
                </div>
              </button>

              {/* Rider Card */}
              <button
                onClick={() => setRole("rider")}
                className="group flex flex-col items-center text-center p-8 bg-white/3 border border-white/10 rounded-2xl hover:border-orange-500/40 hover:bg-orange-500/5 transition-all duration-200 cursor-pointer"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🏍️</div>
                <h3 className="text-lg font-semibold text-white mb-2">I'm a Rider</h3>
                <p className="text-xs text-white/40 leading-relaxed font-light">
                  Sign in to view and accept delivery requests
                </p>
                <div className="mt-5 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Sign in as Rider →
                </div>
              </button>

            </div>

            <p className="text-center text-xs text-white/25">
              Signing in as the wrong role? You can switch on the next screen.
            </p>

          </div>
        </main>

        <footer className="text-center py-4 border-t border-white/5">
          <p className="text-xs text-white/20 m-0">© 2026 CampusGo. All rights reserved. 🚀</p>
        </footer>

      </div>
    );
  }

  // ── SIGN IN FORM ──
  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <nav className="py-4 px-6 pr-24 flex justify-between items-center">
        <button
          onClick={() => { setRole(null); setErrors({}); setSubmitted(false); setCountdown(3); setForm({ email: "", password: "" }); }}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-orange-400 transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          ← Change role
        </button>
        <p className="text-sm text-white/50 m-0">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors no-underline">Sign Up</Link>
        </p>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 text-orange-400 px-4 py-1.5 rounded-full text-xs mb-5 tracking-wide">
              {role === "user" ? "🎒 Signing in as a User" : "🏍️ Signing in as a Rider"}
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {submitted ? `Welcome back, ${userName}!` : "Welcome back"}
            </h1>
            <p className="text-sm text-white/45 font-light">
              {submitted
                ? "Great to see you again."
                : role === "user"
                  ? "Sign in to request and track your deliveries."
                  : "Sign in to view requests and start earning."}
            </p>
          </div>

          <div className="bg-white/3 border border-white/10 rounded-2xl p-8 backdrop-blur-md">

            {submitted ? (
              /* ── SUCCESS STATE ── */
              <div className="w-full bg-green-500/8 border border-green-500/25 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">👋</div>
                <p className="text-base font-semibold text-green-400 mb-1">
                  Signed in successfully!
                </p>
                <p className="text-xs text-white/40 m-0">
                  Taking you to your {role === "rider" ? "rider" : "user"} dashboard in{" "}
                  <span className="text-orange-400 font-bold">{countdown}</span>{" "}
                  second{countdown !== 1 ? "s" : ""}...
                </p>
              </div>
            ) : (
              <>
                {/* Google */}
                <button
                  onClick={() => alert("Connect Firebase for Google Auth!")}
                  className="w-full flex items-center justify-center gap-3 bg-white/3 border border-white/10 text-white py-3 rounded-xl text-sm font-medium hover:bg-white/5 hover:border-orange-500/30 transition-all duration-200 mb-6"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/25">or sign in with email</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="flex flex-col gap-4">

                  {/* Email */}
                  <div>
                    <label className="block text-xs text-white/55 mb-2 font-medium tracking-wide">Email Address</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass("email")} />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-white/55 font-medium tracking-wide">Password</label>
                      <Link to="/forgot-password" className="text-xs text-orange-400 hover:text-orange-300 transition-colors no-underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Enter your password" className={inputClass("password")} />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-orange-400 transition-colors text-lg bg-transparent border-none cursor-pointer">
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-orange-500/25 mt-1"
                  >
                    {role === "rider" ? "Sign In as Rider →" : "Sign In →"}
                  </button>

                </div>
              </>
            )}

          </div>

        </div>
      </main>

      <footer className="text-center py-4 border-t border-white/5">
        <p className="text-xs text-white/20 m-0">© 2026 CampusGo. All rights reserved. 🚀</p>
      </footer>

    </div>
  );
}

export default SignIn;