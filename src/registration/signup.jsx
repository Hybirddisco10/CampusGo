// src/registration/signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function SignUp() {
  const navigate = useNavigate();
  const { initiateRegistration, verifyRegistration, resendOtp, loading } =
    useAuth();

  const [role, setRole] = useState(null);
  const [step, setStep] = useState(1); // 1: form, 2: otp verification
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    studentId: "",
    vehicleType: "",
    licenseNumber: "",
  });
  const [otp, setOtp] = useState("");
  const [documents, setDocuments] = useState({});
  const [strength, setStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-500",
  ];

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
    if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    if (role === "user" && !form.studentId.trim())
      errs.studentId = "Student ID is required";
    if (role === "rider" && !form.vehicleType)
      errs.vehicleType = "Please select a vehicle type";
    if (role === "rider" && !form.licenseNumber.trim())
      errs.licenseNumber = "License number is required";
    // if (!agreed) errs.agreed = "You must agree to the terms";
    return errs;
  };

  // Step 1: Send OTP (initiate registration)
  const handleSendOtp = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    const payload = {
      name: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: role === "rider" ? "RIDER" : "CUSTOMER",
    };
    const result = await initiateRegistration(payload);
    setIsSubmitting(false);
    if (result.success) {
      setStep(2);
      setResendTimer(30);
      startResendTimer();
    }
  };

  // Step 2: Verify OTP and complete registration
  // Step 2: Verify OTP and complete registration
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: "Please enter the full 6-digit code" });
      return;
    }
    setIsSubmitting(true);

    let payload = { email: form.email, otp };

    if (role === "rider") {
      const requiredDocuments = [
        "ghana_card_front",
        "ghana_card_back",
        "driver_license",
        "vehicle_license",
      ];
      const missing = requiredDocuments.filter((key) => !documents[key]);
      if (missing.length > 0) {
        setIsSubmitting(false);
        setErrors({ documents: `Please upload: ${missing.join(", ")}` });
        return;
      }

      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("otp", otp);
      formData.append("vehicleType", form.vehicleType);
      formData.append("licenceNumber", form.licenseNumber);

      // Append files
      requiredDocuments.forEach((key) => {
        if (documents[key]) {
          formData.append(key, documents[key]);
        }
      });

      // Debug: log FormData entries
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      payload = formData;
    } else {
      payload = { email: form.email, otp };
    }

    const result = await verifyRegistration(payload);
    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      if (result.pendingApproval) {
        setTimeout(() => navigate("/signin"), 1500);
        return;
      }
      let count = 3;
      const timer = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(timer);
          navigate(role === "rider" ? "/rider-dashboard" : "/user-dashboard");
        }
      }, 1000);
    }
  };

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsSubmitting(true);
    const result = await resendOtp(form.email);
    setIsSubmitting(false);
    if (result.success) {
      setResendTimer(30);
      startResendTimer();
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
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-[#15803d] font-semibold hover:text-[#166534] transition-colors no-underline"
            >
              Sign In
            </Link>
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
                Are you here to send and receive deliveries, <br /> or to earn
                by delivering for others?
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
                  I want to send items or request deliveries across campus
                </p>
                <div className="mt-5 px-4 py-1.5 bg-[#eab308]/10 border border-[#eab308]/30 text-[#a16207] text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Sign up as User →
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
          <p className="text-xs text-[#a8b5ae] m-0">
            © 2026 CampusGo. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  // ── SIGN UP FORM ──
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
            setSubmitted(false);
            setStep(1);
            setForm({
              fullName: "",
              email: "",
              phone: "",
              password: "",
              confirm: "",
              studentId: "",
              vehicleType: "",
              licenseNumber: "",
            });
          }}
          className="flex items-center gap-2 text-sm text-[#5c7768] hover:text-[#15803d] transition-colors bg-transparent border-none cursor-pointer p-0 py-4 px-6"
        >
          ← Change role
        </button>
        <p className="text-sm text-[#5c7768] m-0">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-[#15803d] font-semibold hover:text-[#166534] transition-colors no-underline"
          >
            Sign In
          </Link>
        </p>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#eab308]/10 border border-[#eab308]/35 text-[#a16207] px-4 py-1.5 rounded-full text-xs mb-5 tracking-wide">
              {step === 1
                ? role === "user"
                  ? "🎒 Signing up as a User"
                  : "🏍️ Signing up as a Rider"
                : "📧 Verify Your Email"}
            </div>
            <h1 className="text-4xl font-bold text-[#0f2e1c] mb-2">
              {step === 1
                ? "Create your account"
                : "Enter the verification code"}
            </h1>
            <p className="text-sm text-[#5c7768] font-light">
              {step === 1
                ? role === "user"
                  ? "Request deliveries across campus, fast and easy."
                  : "Earn money delivering items across campus on your schedule."
                : `We sent a 6-digit code to ${form.email}. Please enter it below.`}
            </p>
          </div>

          <div className="bg-[#FAFAF8] border border-[#e5e9e6] rounded-2xl p-8">
            {step === 1 ? (
              // ── Step 1: Registration Form ──
              <div className="flex flex-col gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Kofi Mensah"
                    className={inputClass("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

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

                {/* Phone */}
                <div>
                  <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0244000000"
                    className={inputClass("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* USER ONLY */}
                {role === "user" && (
                  <div>
                    <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">
                      Student ID
                    </label>
                    <input
                      name="studentId"
                      value={form.studentId}
                      onChange={handleChange}
                      placeholder="e.g. 20-23456"
                      className={inputClass("studentId")}
                    />
                    {errors.studentId && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.studentId}
                      </p>
                    )}
                  </div>
                )}

                {/* RIDER ONLY */}
                {role === "rider" && (
                  <>
                    <div>
                      <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">
                        Vehicle Type
                      </label>
                      <select
                        name="vehicleType"
                        value={form.vehicleType}
                        onChange={handleChange}
                        className={inputClass("vehicleType")}
                      >
                        <option value="" disabled>
                          Select your vehicle
                        </option>
                        <option value="BICYCLE">🚲 Bicycle</option>
                        <option value="SCOOTER">🏍️ Scooter</option>
                        <option value="CAR">🚗 Car</option>
                      </select>
                      {errors.vehicleType && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.vehicleType}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">
                        License Number
                      </label>
                      <input
                        name="licenseNumber"
                        value={form.licenseNumber}
                        onChange={handleChange}
                        placeholder="e.g. GH-1234-56"
                        className={inputClass("licenseNumber")}
                      />
                      {errors.licenseNumber && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.licenseNumber}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Password */}
                <div>
                  <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className={inputClass("password")}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a90] hover:text-[#15803d] transition-colors text-lg bg-transparent border-none cursor-pointer"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                              i <= strength
                                ? strengthColor[strength]
                                : "bg-[#e5e9e6]"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#8a9a90] m-0">
                        {strengthLabel[strength]} password
                      </p>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirm"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirm}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className={`w-full px-4 py-3 pr-12 rounded-xl bg-white border text-[#14291d] text-sm placeholder-[#a8b5ae] focus:outline-none focus:ring-2 focus:ring-[#15803d]/20 transition-all ${
                        errors.confirm
                          ? "border-red-500"
                          : form.confirm && form.confirm === form.password
                          ? "border-green-500"
                          : "border-[#d8ded9] focus:border-[#15803d]/60"
                      }`}
                    />
                    <button
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a90] hover:text-[#15803d] transition-colors text-lg bg-transparent border-none cursor-pointer"
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {form.confirm && form.confirm === form.password && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Passwords match
                    </p>
                  )}
                  {errors.confirm && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirm}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSendOtp}
                  disabled={isSubmitting || loading}
                  className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-[#14291d] py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#eab308]/25 mt-1 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting
                    ? "Sending OTP..."
                    : role === "rider"
                    ? "Register as Rider →"
                    : "Create My Account →"}
                </button>
              </div>
            ) : (
              // ── Step 2: OTP Verification ──
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-[#33513f] mb-2 font-medium tracking-wide">
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 123456"
                    className={`w-full px-4 py-3 rounded-xl bg-white border text-[#14291d] text-sm placeholder-[#a8b5ae] focus:outline-none focus:ring-2 focus:ring-[#15803d]/20 transition-all ${
                      errors.otp
                        ? "border-red-500"
                        : "border-[#d8ded9] focus:border-[#15803d]/60"
                    }`}
                  />
                  {errors.otp && (
                    <p className="text-xs text-red-500 mt-1">{errors.otp}</p>
                  )}
                </div>

                {role === "rider" && (
                  <div>
                    <p className="text-xs text-[#33513f] mb-2 font-medium tracking-wide">
                      Verification Documents
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["ghana_card_front", "Ghana card front"],
                        ["ghana_card_back", "Ghana card back"],
                        ["driver_license", "Driver license"],
                        ["vehicle_license", "Vehicle license"],
                      ].map(([name, label]) => (
                        <label
                          key={name}
                          className="rounded-lg border border-[#d8ded9] bg-white p-2 text-xs text-[#33513f] cursor-pointer"
                        >
                          {label}
                          <input
                            type="file"
                            accept="image/*"
                            className="mt-1 block w-full text-xs"
                            onChange={(event) =>
                              setDocuments({
                                ...documents,
                                [name]: event.target.files?.[0],
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                    {errors.documents && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.documents}
                      </p>
                    )}
                  </div>
                )}

                {/* Resend */}
                <div className="flex justify-between items-center">
                  <p className="text-xs text-[#8a9a90]">
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : "Didn't receive the code?"}
                  </p>
                  <button
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isSubmitting}
                    className="text-xs text-[#15803d] hover:text-[#166534] transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend
                  </button>
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting || loading || otp.length !== 6}
                  className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-[#14291d] py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#eab308]/25 mt-1 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Complete →"}
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#a8b5ae] hover:text-[#15803d] transition-colors bg-transparent border-none cursor-pointer text-center"
                >
                  ← Use a different email
                </button>
              </div>
            )}
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

export default SignUp;
