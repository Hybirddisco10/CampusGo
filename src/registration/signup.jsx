import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "",
    password: "", confirm: "",
    studentId: "", vehicleType: "", licenseNumber: ""
  });
  const [strength, setStrength] = useState(0);
  const [errors, setErrors] = useState({});

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "password") {
      const p = e.target.value;
      let score = 0;
      if (p.length >= 8) score++;
      if (/[A-Z]/.test(p)) score++;
      if (/[0-9]/.test(p)) score++;
      if (/[^A-Za-z0-9]/.test(p)) score++;
      setStrength(score);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.includes("@")) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    if (role === "user" && !form.studentId.trim()) errs.studentId = "Student ID is required";
    if (role === "rider" && !form.vehicleType) errs.vehicleType = "Please select a vehicle type";
    // if (role === "rider" && !form.licenseNumber.trim()) errs.licenseNumber = "License number is required";
    // if (!agreed) errs.agreed = "You must agree to the terms";
    // return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // Show success message
    setSubmitted(true);

    // Countdown and redirect
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
    `w-full px-4 py-3 rounded-xl bg-white border text-[#14291d] text-sm placeholder-[#a8b5ae] focus:outline-none focus:ring-2 focus:ring-[#15803d]/20 transition-all ${
      errors[field] ? "border-red-500" : "border-[#d8ded9] focus:border-[#15803d]/60"
    }`;

  // ── ROLE SELECTION SCREEN ──
  if (!role) {
    return (
      <div className="min-h-screen bg-white text-[#14291d] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        <nav className="py-4 px-6 pr-24 flex justify-end items-center">
          <p className="text-sm text-[#5c7768] m-0 py-4 px-6">
            Already have an account?{" "}
            <Link to="/signin" className="text-[#15803d] font-semibold hover:text-[#166534] transition-colors no-underline">Sign In</Link>
          </p>
        </nav>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg">

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-[#eab308]/10 border border-[#eab308]/35 text-[#a16207] px-4 py-1.5 rounded-full text-xs mb-5 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] animate-pulse" />
                Get started
              </div>
              <h1 className="text-4xl font-bold text-[#0f2e1c] mb-3">
                Join <span className="text-[#15803d]">CampusGo</span>
              </h1>
              <p className="text-sm text-[#5c7768] font-light leading-relaxed">
                Are you here to send and receive deliveries, <br /> or to earn by delivering for others?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">

              {/* User Card */}
              <button
                onClick={() => setRole("user")}
                className="group flex flex-col items-center text-center p-8 bg-white border border-[#e5e9e6] rounded-2xl hover:border-[#15803d]/40 hover:bg-[#15803d]/5 transition-all duration-200 cursor-pointer"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🎒</div>
                <h3 className="text-lg font-semibold text-[#0f2e1c] mb-2">I'm a User</h3>
                <p className="text-xs text-[#5c7768] leading-relaxed font-light">
                  I want to send items or request deliveries across campus
                </p>
                <div className="mt-5 px-4 py-1.5 bg-[#eab308]/10 border border-[#eab308]/30 text-[#a16207] text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Sign up as User →
                </div>
              </button>

              {/* Rider Card */}
              <button
                onClick={() => setRole("rider")}
                className="group flex flex-col items-center text-center p-8 bg-white border border-[#e5e9e6] rounded-2xl hover:border-[#15803d]/40 hover:bg-[#15803d]/5 transition-all duration-200 cursor-pointer"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🏍️</div>
                <h3 className="text-lg font-semibold text-[#0f2e1c] mb-2">I'm a Rider</h3>
                <p className="text-xs text-[#5c7768] leading-relaxed font-light">
                  I want to earn by picking up and delivering items on campus
                </p>

                <div className="mt-5 px-4 py-1.5 bg-[#eab308]/10 border border-[#eab308]/30 text-[#a16207] text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Sign up as Rider →
                </div>
              </button>

            </div>

            <p className="text-center text-xs text-[#a8b5ae]">
              You can always switch roles later from your account settings
            </p>

          </div>
        </main>

        <footer className="text-center py-4 border-t border-[#e5e9e6]">
          <p className="text-xs text-[#a8b5ae] m-0">© 2026 CampusGo. All rights reserved.</p>
        </footer>

      </div>
    );
  }

  // ── SIGN UP FORM ──
  return (
    <div className="min-h-screen bg-white text-[#14291d] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <nav className="py-4 px-6 pr-24 flex justify-between items-center">
        <button
          onClick={() => { setRole(null); setErrors({}); setSubmitted(false); setCountdown(3); setForm({ fullName: "", email: "", phone: "", password: "", confirm: "", studentId: "", vehicleType: "", licenseNumber: "" }); }}
          className="flex items-center gap-2 text-sm text-[#5c7768] hover:text-[#15803d] transition-colors bg-transparent border-none cursor-pointer p-0 py-4 px-6"
        >
          ← Change role
        </button>
        <p className="text-sm text-[#5c7768] m-0">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#15803d] font-semibold hover:text-[#166534] transition-colors no-underline">Sign In</Link>
        </p>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#eab308]/10 border border-[#eab308]/35 text-[#a16207] px-4 py-1.5 rounded-full text-xs mb-5 tracking-wide">
              {role === "user" ? "🎒 Signing up as a User" : "🏍️ Signing up as a Rider"}
            </div>
            <h1 className="text-4xl font-bold text-[#0f2e1c] mb-2">Create your account</h1>
            <p className="text-sm text-[#5c7768] font-light">
              {role === "user"
                ? "Request deliveries across campus, fast and easy."
                : "Earn money delivering items across campus on your schedule."}
            </p>
          </div>

          <div className="bg-[#FAFAF8] border border-[#e5e9e6] rounded-2xl p-8">

            {/* Google */}
            <button
              onClick={() => alert("Connect Firebase for Google Auth!")}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#e5e9e6] text-[#14291d] py-3 rounded-xl text-sm font-medium hover:bg-[#F7FAF8] hover:border-[#eab308]/40 transition-all duration-200 mb-6"
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
              <div className="flex-1 h-px bg-[#e5e9e6]" />
              <span className="text-xs text-[#a8b5ae]">or sign up with email</span>
              <div className="flex-1 h-px bg-[#e5e9e6]" />
            </div>

            <div className="flex flex-col gap-4">

              {/* Full Name */}
              <div>
                <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. Kofi Mensah" className={inputClass("fullName")} />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass("email")} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">Phone Number</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="e.g. 0244000000" className={inputClass("phone")} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* USER ONLY */}
              {role === "user" && (
                <div>
                  <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">Student ID</label>
                  <input name="studentId" value={form.studentId} onChange={handleChange} placeholder="e.g. 20-23456" className={inputClass("studentId")} />
                  {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
                </div>
              )}

              {/* RIDER ONLY */}
              {role === "rider" && (
                <>
                  <div>
                    <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">Vehicle Type</label>
                    <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className={inputClass("vehicleType")}>
                      <option value="" disabled>Select your vehicle</option>
                      <option value="bicycle">🚲 Bicycle</option>
                      <option value="motorbike">🏍️ Motorbike</option>
                      <option value="car">🚗 Car</option>
                      <option value="on-foot">🚶 On Foot</option>
                    </select>
                    {errors.vehicleType && <p className="text-xs text-red-500 mt-1">{errors.vehicleType}</p>}
                  </div>
                  {/* <div>
                    <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">License Number</label>
                    <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="e.g. GH-1234-56" className={inputClass("licenseNumber")} />
                    {errors.licenseNumber && <p className="text-xs text-red-500 mt-1">{errors.licenseNumber}</p>}
                  </div> */}
                </>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">Password</label>
                <div className="relative">
                  <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Min. 8 characters" className={inputClass("password")} />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a90] hover:text-[#15803d] transition-colors text-lg bg-transparent border-none cursor-pointer">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : "bg-[#e5e9e6]"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-[#8a9a90] m-0">{strengthLabel[strength]} password</p>
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">Confirm Password</label>
                <div className="relative">
                  <input name="confirm" type={showConfirm ? "text" : "password"} value={form.confirm} onChange={handleChange} placeholder="Re-enter your password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-white border text-[#14291d] text-sm placeholder-[#a8b5ae] focus:outline-none focus:ring-2 focus:ring-[#15803d]/20 transition-all ${
                      errors.confirm ? "border-red-500" : form.confirm && form.confirm === form.password ? "border-green-500" : "border-[#d8ded9] focus:border-[#15803d]/60"
                    }`}
                  />
                  <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a90] hover:text-[#15803d] transition-colors text-lg bg-transparent border-none cursor-pointer">
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
                {form.confirm && form.confirm === form.password && (
                  <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                )}
                {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
              </div>

              {/* Terms */}
              {/* <div onClick={() => { setAgreed(!agreed); setErrors({ ...errors, agreed: "" }); }} className="flex items-start gap-3 cursor-pointer">
                <div className={`w-4 h-4 mt-0.5 rounded shrink-0 flex items-center justify-center border transition-all duration-200 ${agreed ? "bg-[#eab308] border-[#eab308]" : "border-[#d8ded9]"}`}>
                  {agreed && <span className="text-[#14291d] text-xs font-bold">✓</span>}
                </div>
                <p className="text-xs text-[#8a9a90] leading-relaxed m-0">
                  I agree to the{" "}
                  <Link to="/terms" className="text-[#15803d] hover:text-[#166534] transition-colors no-underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-[#15803d] hover:text-[#166534] transition-colors no-underline">Privacy Policy</Link>
                </p>
              </div> */}
              {errors.agreed && <p className="text-xs text-red-500 -mt-2">{errors.agreed}</p>}

              {/* Submit / Success */}
              {submitted ? (
                <div className="w-full bg-green-500/8 border border-green-500/25 rounded-xl p-5 text-center mt-1">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-sm font-semibold text-green-600 mb-1">
                    Account created successfully!
                  </p>
                  <p className="text-xs text-[#8a9a90] m-0">
                    {role === "rider" ? "Welcome aboard, Rider!" : "Welcome to CampusGo!"} Redirecting in{" "}
                    <span className="text-[#15803d] font-bold">{countdown}</span>{" "}
                    second{countdown !== 1 ? "s" : ""}...
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-[#14291d] py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#eab308]/25 mt-1"
                >
                  {role === "rider" ? "Register as Rider →" : "Create My Account →"}
                </button>
              )}

            </div>
          </div>

        </div>
      </main>

      <footer className="text-center py-4 border-t border-[#e5e9e6]">
        <p className="text-xs text-[#a8b5ae] m-0">© 2026 CampusGo. All rights reserved. </p>
      </footer>

    </div>
  );
}

export default SignUp;