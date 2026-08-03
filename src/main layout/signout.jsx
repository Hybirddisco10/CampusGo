import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignOut() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let count = 5;
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        navigate("/");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white text-[#14291d] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <nav className="py-4 px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🚀</span>
          <span className="text-xl font-bold text-[#0f2e1c]">Campus<span className="text-[#15803d]">Go</span></span>
        </Link>
        <Link to="/signin" className="text-sm text-[#5c7768] hover:text-[#15803d] transition-colors no-underline">
          Sign in to another account
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">

          <div className="inline-flex items-center gap-2 bg-[#eab308]/10 border border-[#eab308]/35 text-[#a16207] px-4 py-1.5 rounded-full text-xs mb-6 tracking-wide">
            👋 Signed out
          </div>

          <h1 className="text-4xl font-bold text-[#0f2e1c] mb-3">
            See you soon!
          </h1>
          <p className="text-sm text-[#5c7768] font-light leading-relaxed mb-8">
            You've been signed out of CampusGo. Your deliveries and account
            details are safe, and you can pick up right where you left off
            next time.
          </p>

          <div className="bg-[#FAFAF8] border border-[#e5e9e6] rounded-2xl p-8">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-sm font-semibold text-[#0f2e1c] mb-1">
              You're safely signed out
            </p>
            <p className="text-xs text-[#8a9a90] mb-6">
              Redirecting you to the homepage in{" "}
              <span className="text-[#15803d] font-bold">{countdown}</span>{" "}
              second{countdown !== 1 ? "s" : ""}...
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/signin"
                className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-[#14291d] py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#eab308]/25 no-underline text-center"
              >
                Sign In Again →
              </Link>
              <Link
                to="/"
                className="w-full bg-transparent border border-[#e5e9e6] text-[#33513f] py-3 rounded-xl text-sm font-medium hover:bg-[#F7FAF8] hover:border-[#15803d]/30 transition-all duration-200 no-underline text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-[#a8b5ae] mt-6">
            Not you?{" "}
            <Link to="/contact" className="text-[#15803d] font-semibold hover:text-[#166534] transition-colors no-underline">
              Contact support
            </Link>
          </p>

        </div>
      </main>

      <footer className="text-center py-4 border-t border-[#e5e9e6]">
        <p className="text-xs text-[#a8b5ae] m-0">© 2026 CampusGo. All rights reserved. 🚀</p>
      </footer>

    </div>
  );
}

export default SignOut;