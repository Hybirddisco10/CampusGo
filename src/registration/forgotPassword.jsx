import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp + new password, 3: success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(30);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const otpRefs = useRef([]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  /* ── Step 1: Request OTP ── */
  const handleRequestOtp = () => {
    if (!email.includes("@")) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }
    setErrors({});
    setStep(2);
    startResendTimer();
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  /* ── OTP input handling ── */
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    setErrors({ ...errors, otp: "" });
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  /* ── Password strength ── */
  const handlePasswordChange = (value) => {
    setNewPassword(value);
    setErrors({ ...errors, newPassword: "" });
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    setStrength(score);
  };

  /* ── Step 2: Verify OTP + Reset password ── */
  const handleResetPassword = () => {
    const errs = {};
    if (otp.join("").length !== 6) errs.otp = "Please enter the full 6-digit code";
    if (newPassword.length < 8) errs.newPassword = "Password must be at least 8 characters";
    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match";

    // Demo OTP check — replace with real backend verification
    if (otp.join("").length === 6 && otp.join("") !== "123456") {
      errs.otp = "Incorrect code. Please check your email and try again.";
    }

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setStep(3);
    setSubmitted(true);

    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        navigate("/signin");
      }
    }, 1000);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-white/[0.05] border text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
      errors[field] ? "border-red-500" : "border-white/10 focus:border-orange-500/60"
    }`;

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Navbar */}
      <nav className="py-4 px-6 flex justify-between items-center">
        <Link to="/signin" className="flex items-center gap-2 text-sm text-white/40 hover:text-orange-400 transition-colors no-underline">
          ← Back to Sign In
        </Link>
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🚀</span>
          <span className="text-xl font-bold text-white">Campus<span className="text-orange-500">Go</span></span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* ── STEP 1: REQUEST OTP ── */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 text-orange-400 px-4 py-1.5 rounded-full text-xs mb-5 tracking-wide">
                  🔐 Password Reset
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Forgot your password?</h1>
                <p className="text-sm text-white/45 font-light leading-relaxed">
                  Enter the email linked to your account and we'll send you a 6-digit code to reset your password.
                </p>
              </div>

              <div className="bg-white/3 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs text-white/55 mb-2 font-medium tracking-wide">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                      placeholder="you@example.com"
                      className={inputClass("email")}
                      onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                    />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                  </div>

                  <button
                    onClick={handleRequestOtp}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-orange-500/25 mt-1"
                  >
                    Send Reset Code →
                  </button>
                </div>
              </div>

              <p className="text-center text-xs text-white/25 mt-6">
                Remembered your password?{" "}
                <Link to="/signin" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors no-underline">Sign in here</Link>
              </p>
            </>
          )}

          {/* ── STEP 2: ENTER OTP + NEW PASSWORD ── */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 text-orange-400 px-4 py-1.5 rounded-full text-xs mb-5 tracking-wide">
                  📧 Code Sent
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Check your inbox</h1>
                <p className="text-sm text-white/45 font-light leading-relaxed">
                  We sent a 6-digit code to <span className="text-orange-400 font-medium">{email}</span>. Enter it below along with your new password.
                </p>
              </div>

              <div className="bg-white/3 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                <div className="flex flex-col gap-5">

                  {/* OTP Boxes */}
                  <div>
                    <label className="block text-xs text-white/55 mb-3 font-medium tracking-wide text-center">Enter 6-Digit Code</label>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className={`w-11 h-13 text-center text-lg font-semibold rounded-xl bg-white/5 border text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                            errors.otp ? "border-red-500" : "border-white/10 focus:border-orange-500/60"
                          }`}
                          style={{ height: "52px" }}
                        />
                      ))}
                    </div>
                    {errors.otp && <p className="text-xs text-red-400 mt-2 text-center">{errors.otp}</p>}

                    {/* Resend */}
                    <div className="text-center mt-4">
                      {resendTimer > 0 ? (
                        <p className="text-xs text-white/30 m-0">Resend code in {resendTimer}s</p>
                      ) : (
                        <button
                          onClick={startResendTimer}
                          className="text-xs text-orange-400 hover:text-orange-300 transition-colors bg-transparent border-none cursor-pointer p-0"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* New Password */}
                  <div>
                    <label className="block text-xs text-white/55 mb-2 font-medium tracking-wide">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Min. 8 characters"
                        className={inputClass("newPassword")}
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-orange-400 transition-colors text-lg bg-transparent border-none cursor-pointer">
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {newPassword.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : "bg-white/10"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-white/35 m-0">{strengthLabel[strength]} password</p>
                      </div>
                    )}
                    {errors.newPassword && <p className="text-xs text-red-400 mt-1">{errors.newPassword}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs text-white/55 mb-2 font-medium tracking-wide">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: "" }); }}
                        placeholder="Re-enter your new password"
                        className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                          errors.confirmPassword ? "border-red-500" : confirmPassword && confirmPassword === newPassword ? "border-green-500" : "border-white/10 focus:border-orange-500/60"
                        }`}
                      />
                      <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-orange-400 transition-colors text-lg bg-transparent border-none cursor-pointer">
                        {showConfirm ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword === newPassword && (
                      <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
                    )}
                    {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <button
                    onClick={handleResetPassword}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-orange-500/25 mt-1"
                  >
                    Reset Password →
                  </button>

                  <button
                    onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); setErrors({}); }}
                    className="text-xs text-white/30 hover:text-orange-400 transition-colors bg-transparent border-none cursor-pointer text-center"
                  >
                    ← Use a different email
                  </button>

                </div>
              </div>
            </>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === 3 && (
            <div className="text-center">
              <div className="bg-white/3 border border-white/10 rounded-2xl p-10 backdrop-blur-md">
                <div className="w-full bg-green-500/8 border border-green-500/25 rounded-xl p-6">
                  <div className="text-5xl mb-4">🎉</div>
                  <p className="text-lg font-semibold text-green-400 mb-2">
                    Password Reset Successful!
                  </p>
                  <p className="text-sm text-white/45 mb-1">
                    Your password has been updated.
                  </p>
                  <p className="text-xs text-white/35 m-0">
                    Redirecting you to sign in in{" "}
                    <span className="text-orange-400 font-bold">{countdown}</span>{" "}
                    second{countdown !== 1 ? "s" : ""}...
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="text-center py-4 border-t border-white/5">
        <p className="text-xs text-white/20 m-0">© 2026 CampusGo. All rights reserved. 🚀</p>
      </footer>

    </div>
  );
}

export default ForgotPassword;