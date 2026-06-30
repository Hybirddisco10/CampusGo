import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ── Google Fonts ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap";
if (!document.head.querySelector("[data-cgo-font]")) {
  fontLink.setAttribute("data-cgo-font", "1");
  document.head.appendChild(fontLink);
}

/* ── Animations ── */
const styleEl = document.createElement("style");
styleEl.setAttribute("data-cgo-styles", "1");
styleEl.textContent = `
  @keyframes cgoOrbDrift1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.08); }
    66% { transform: translate(-15px, 15px) scale(0.96); }
  }
  @keyframes cgoOrbDrift2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, 25px) scale(1.04); }
    66% { transform: translate(25px, -15px) scale(1.08); }
  }
  @keyframes cgoFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes cgoPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes cgoFadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes cgoStagger {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes cgoTicker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes cgoGradShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .cgo-feature-card:hover {
    transform: translateY(-5px) !important;
    border-color: rgba(249,115,22,0.35) !important;
    box-shadow: 0 16px 48px rgba(249,115,22,0.1) !important;
  }
  .cgo-step-card:hover {
    border-color: rgba(249,115,22,0.3) !important;
    background: rgba(249,115,22,0.05) !important;
  }
  .cgo-role-card:hover {
    border-color: rgba(249,115,22,0.4) !important;
    background: rgba(249,115,22,0.06) !important;
    transform: translateY(-4px) !important;
  }
  .cgo-btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 36px rgba(249,115,22,0.45) !important;
  }
  .cgo-btn-outline:hover {
    background: rgba(249,115,22,0.08) !important;
    border-color: rgba(249,115,22,0.5) !important;
    color: #f97316 !important;
  }
  .cgo-nav-link:hover { color: #f97316 !important; }
  .cgo-testimonial:hover {
    transform: translateY(-4px) !important;
    border-color: rgba(249,115,22,0.25) !important;
  }
  .cgo-footer-link:hover { color: rgba(255,255,255,0.55) !important; }
`;
if (!document.head.querySelector("[data-cgo-styles]")) {
  document.head.appendChild(styleEl);
}

/* ── Data — no vendor references anywhere ── */
const FEATURES = [
  { icon: "📦", title: "Send Anything", desc: "Documents, food, personal items — if it fits on a bike, we'll get it there." },
  { icon: "📍", title: "Live Rider Tracking", desc: "Watch your rider move in real time on the map. No more guessing when they'll arrive." },
  { icon: "🔐", title: "OTP Confirmation", desc: "Every delivery secured with a one-time PIN so your item reaches only you." },
  { icon: "⚡", title: "Under 30 Minutes", desc: "Campus is small. Your delivery shouldn't take long. We guarantee speed." },
  { icon: "🏍️", title: "Verified Riders", desc: "Every rider is campus-verified, rated, and trusted by the student community." },
  { icon: "⭐", title: "Rate Every Ride", desc: "After every delivery, rate your rider. Quality stays high because the community demands it." },
];

const STEPS = [
  { num: "01", title: "Submit a Delivery Request", desc: "Tell us what needs moving, where it's coming from, and where it needs to go." },
  { num: "02", title: "A Rider Accepts", desc: "A nearby verified campus rider picks up your request and heads to collect the item." },
  { num: "03", title: "Track in Real Time", desc: "Follow your rider live on the map from pickup to your doorstep." },
  { num: "04", title: "Receive & Rate", desc: "Confirm delivery with your OTP, then rate your rider's service." },
];

const TESTIMONIALS = [
  {
    name: "Abena Kyei",
    role: "User · Level 300, Engineering",
    quote: "I had my friend pick up my notes from the hostel and send them to me at the library. CampusGo made it happen in 12 minutes.",
    avatar: "AK",
  },
  {
    name: "Kwame Asante",
    role: "Rider · Since 2024",
    quote: "I ride between lectures and make decent money. The app is clean, requests are clear, and payment is straightforward.",
    avatar: "KA",
  },
  {
    name: "Efua Mensah",
    role: "User · Level 200, Business",
    quote: "Needed my charger delivered from my room during a 3-hour lecture. It arrived before the break. Honestly impressive.",
    avatar: "EM",
  },
];

const TICKER = [
  "🚀 Delivered in under 30 mins",
  "📍 Live rider tracking",
  "🔐 OTP secured delivery",
  "⭐ 4.9 average rider rating",
  "🏍️ 200+ verified riders",
  "📦 Any item, anywhere on campus",
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

export default function CampusGoLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [featRef, featInView] = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [rolesRef, rolesInView] = useInView();
  const [testRef, testInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 120);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0a1628", color: "#f0f4ff", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>

      {/* Background orbs */}
      <div style={{ position: "fixed", top: "-180px", right: "-180px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0, animation: "cgoOrbDrift1 20s ease-in-out infinite" }} />
      <div style={{ position: "fixed", bottom: "-120px", left: "-120px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(30,64,175,0.15) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0, animation: "cgoOrbDrift2 24s ease-in-out infinite" }} />

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: scrolled ? "14px 0" : "20px 0", transition: "all 0.3s ease", background: scrolled ? "rgba(10,22,40,0.92)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(249,115,22,0.15)" : "none" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span style={{ fontSize: "22px" }}>🚀</span>
            <span style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>Campus<span style={{ color: "#f97316" }}>Go</span></span>
          </Link>

          <div style={{ display: "flex", gap: "32px" }}>
            {[["#how-it-works", "How It Works"], ["#features", "Features"], ["#who", "Who It's For"], ["#reviews", "Reviews"]].map(([href, label]) => (
              <a key={href} href={href} className="cgo-nav-link" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: "14px", transition: "color 0.2s", fontWeight: "400" }}>{label}</a>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/signin" className="cgo-btn-outline" style={{ color: "#f97316", border: "1px solid rgba(249,115,22,0.35)", padding: "9px 20px", borderRadius: "8px", fontSize: "14px", textDecoration: "none", transition: "all 0.2s", fontWeight: "500" }}>Sign In</Link>
            <Link to="/signup" className="cgo-btn-primary" style={{ background: "#f97316", color: "#fff", padding: "10px 22px", borderRadius: "8px", fontSize: "14px", textDecoration: "none", fontWeight: "600", boxShadow: "0 4px 20px rgba(249,115,22,0.3)", transition: "all 0.2s" }}>Get Started</Link>
          </div>

        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1200px", margin: "0 auto", padding: "120px 32px 80px", gap: "60px", position: "relative", zIndex: 1 }}>

        {/* Left */}
        <div style={{ flex: 1, maxWidth: "540px", opacity: heroVisible ? 1 : 0, animation: heroVisible ? "cgoFadeUp 0.9s ease forwards" : "none" }}>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#fb923c", padding: "7px 16px", borderRadius: "100px", fontSize: "13px", marginBottom: "28px", letterSpacing: "0.3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316", display: "inline-block", animation: "cgoPulse 2s ease-in-out infinite" }} />
            Now live on KNUST campus
          </div>

          <h1 style={{ fontSize: "clamp(40px, 5.5vw, 68px)", fontWeight: "700", lineHeight: "1.1", margin: "0 0 8px", letterSpacing: "-1px", color: "#fff", fontFamily: "'DM Serif Display', serif" }}>
            Need something{" "}
            <span style={{ background: "linear-gradient(135deg, #f97316, #fb923c, #f97316)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "cgoGradShift 3s ease infinite" }}>
              delivered?
            </span>
          </h1>

          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", lineHeight: "1.75", margin: "24px 0 36px", maxWidth: "460px", fontWeight: "300" }}>
            CampusGo connects you with verified campus riders who pick up and deliver your items anywhere on campus — fast, tracked, and secure.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "52px" }}>
            <Link to="/signup" className="cgo-btn-primary" style={{ background: "#f97316", color: "#fff", padding: "15px 30px", borderRadius: "12px", fontSize: "16px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 28px rgba(249,115,22,0.35)", transition: "all 0.25s", textDecoration: "none" }}>
              Send Something <span>→</span>
            </Link>
            <Link to="/signup" className="cgo-btn-outline" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", padding: "15px 26px", borderRadius: "12px", fontSize: "15px", transition: "all 0.2s", textDecoration: "none" }}>
              Earn as a Rider
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "40px" }}>
            {[
              { num: "200+", label: "Campus Riders" },
              { num: "< 30min", label: "Avg. Delivery" },
              { num: "4.9 ⭐", label: "Rider Rating" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px", opacity: heroVisible ? 1 : 0, animation: heroVisible ? `cgoStagger 0.5s ease forwards ${0.4 + i * 0.15}s` : "none" }}>
                <span style={{ fontSize: "22px", fontWeight: "700", color: "#f97316", letterSpacing: "-0.5px" }}>{s.num}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.3px" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating delivery card */}
        <div style={{ flex: "0 0 360px", opacity: heroVisible ? 1 : 0, transition: "opacity 1s ease 0.3s", animation: heroVisible ? "cgoFloat 5s ease-in-out infinite" : "none" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(249,115,22,0.18)", borderRadius: "24px", overflow: "hidden", backdropFilter: "blur(20px)", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>

            {/* Card header */}
            <div style={{ background: "rgba(249,115,22,0.08)", padding: "18px 24px", borderBottom: "1px solid rgba(249,115,22,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#fb923c" }}>🏍️ Delivery #CG-4821</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Just now</span>
            </div>

            <div style={{ padding: "24px" }}>

              {/* Pickup → Dropoff */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", marginTop: "4px", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Pickup</p>
                      <p style={{ fontSize: "13px", color: "#fff", margin: 0, fontWeight: "500" }}>Unity Hall, Room 214</p>
                    </div>
                  </div>
                  <div style={{ width: "1px", height: "14px", background: "rgba(249,115,22,0.2)", marginLeft: "3px" }} />
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#fff", marginTop: "4px", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Dropoff</p>
                      <p style={{ fontSize: "13px", color: "#fff", margin: 0, fontWeight: "500" }}>Main Library, Study Room B</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "16px" }} />

              {/* Item */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#fff", margin: "0 0 2px", fontWeight: "500" }}>📦 Lecture Notes + Charger</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>Handle with care</p>
                </div>
                <span style={{ fontSize: "13px", color: "#f97316", fontWeight: "600" }}>GH₵ 8</span>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
                  <span>Rider on the way</span>
                  <span style={{ color: "#f97316", fontWeight: "600" }}>~8 mins</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, #f97316, #fb923c)", borderRadius: "4px" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(255,255,255,0.2)", marginTop: "6px" }}>
                  <span>Picked up</span>
                  <span>On the way</span>
                  <span>Delivered</span>
                </div>
              </div>

              {/* Rider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(249,115,22,0.07)", borderRadius: "12px", border: "1px solid rgba(249,115,22,0.12)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>KO</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", color: "#fff", margin: "0 0 1px", fontWeight: "500" }}>Kofi Owusu</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>⭐ 4.9 · Honda CB125</p>
                </div>
                <span style={{ fontSize: "18px", cursor: "pointer" }}>📞</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ overflow: "hidden", borderTop: "1px solid rgba(249,115,22,0.1)", borderBottom: "1px solid rgba(249,115,22,0.1)", background: "rgba(249,115,22,0.04)", padding: "12px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", animation: "cgoTicker 28s linear infinite", whiteSpace: "nowrap" }}>
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} style={{ padding: "0 36px", fontSize: "13px", color: "rgba(249,115,22,0.65)", letterSpacing: "0.3px" }}>
              {item} <span style={{ color: "rgba(249,115,22,0.2)", marginLeft: "18px" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* WHO IT'S FOR */}
      <section id="who" ref={rolesRef} style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "60px", opacity: rolesInView ? 1 : 0, transform: rolesInView ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s ease" }}>
          <span style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.22)", color: "#f97316", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>Who It's For</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "700", color: "#fff", margin: "0 0 14px", letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', serif" }}>Two roles. One platform.</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", maxWidth: "420px", margin: "0 auto", lineHeight: "1.7", fontWeight: "300" }}>Whether you need something delivered or want to earn delivering — CampusGo is for you.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>

          {/* User card */}
          <div className="cgo-role-card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "40px", transition: "all 0.3s ease", opacity: rolesInView ? 1 : 0, animation: rolesInView ? "cgoStagger 0.5s ease forwards 0s" : "none" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎒</div>
            <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 12px", fontFamily: "'DM Serif Display', serif" }}>I'm a User</h3>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: "1.7", margin: "0 0 28px", fontWeight: "300" }}>
              Need something moved across campus? Submit a delivery request, track your rider live, and receive your item fast — without leaving where you are.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Submit delivery requests in seconds", "Track your rider live on the map", "Confirm receipt with a secure OTP", "Rate your experience after delivery"].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.55)" }}>
                  <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#f97316", flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="cgo-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f97316", color: "#fff", padding: "13px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", textDecoration: "none", boxShadow: "0 6px 20px rgba(249,115,22,0.3)", transition: "all 0.25s" }}>
              Sign Up as User →
            </Link>
          </div>

          {/* Rider card */}
          <div className="cgo-role-card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "40px", transition: "all 0.3s ease", opacity: rolesInView ? 1 : 0, animation: rolesInView ? "cgoStagger 0.5s ease forwards 0.15s" : "none" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🏍️</div>
            <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 12px", fontFamily: "'DM Serif Display', serif" }}>I'm a Rider</h3>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: "1.7", margin: "0 0 28px", fontWeight: "300" }}>
              Got a bike and free time between lectures? Accept delivery requests, earn money on your own schedule, and build your reputation on campus.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Accept requests that fit your schedule", "Get clear pickup and dropoff details", "Earn per delivery — no fixed hours", "Build your rating and grow your income"].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.55)" }}>
                  <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#f97316", flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="cgo-btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "transparent", border: "1px solid rgba(249,115,22,0.4)", color: "#f97316", padding: "13px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", textDecoration: "none", transition: "all 0.25s" }}>
              Sign Up as Rider →
            </Link>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" ref={stepsRef} style={{ background: "rgba(249,115,22,0.03)", borderTop: "1px solid rgba(249,115,22,0.08)", borderBottom: "1px solid rgba(249,115,22,0.08)", padding: "100px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px", opacity: stepsInView ? 1 : 0, transform: stepsInView ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s ease" }}>
            <span style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.22)", color: "#f97316", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>How It Works</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "700", color: "#fff", margin: "0 0 14px", letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', serif" }}>From request to doorstep in 4 steps</h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", maxWidth: "420px", margin: "0 auto", lineHeight: "1.7", fontWeight: "300" }}>Simple, fast, and transparent — every single time.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {STEPS.map((s, i) => (
              <div key={i} className="cgo-step-card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px", transition: "all 0.3s ease", opacity: stepsInView ? 1 : 0, animation: stepsInView ? `cgoStagger 0.5s ease forwards ${i * 0.12}s` : "none" }}>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "rgba(249,115,22,0.22)", marginBottom: "16px", fontFamily: "'DM Serif Display', serif" }}>{s.num}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featRef} style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "60px", opacity: featInView ? 1 : 0, transform: featInView ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s ease" }}>
          <span style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.22)", color: "#f97316", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>Features</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "700", color: "#fff", margin: "0 0 14px", letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', serif" }}>Everything you need on campus</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", maxWidth: "420px", margin: "0 auto", lineHeight: "1.7", fontWeight: "300" }}>Built specifically for campus life — not a general delivery app forced to fit.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="cgo-feature-card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "30px", transition: "all 0.3s ease", opacity: featInView ? 1 : 0, animation: featInView ? `cgoStagger 0.5s ease forwards ${i * 0.1}s` : "none" }}>
              <div style={{ fontSize: "28px", marginBottom: "14px" }}>{f.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: "0 0 10px" }}>{f.title}</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="reviews" ref={testRef} style={{ background: "rgba(249,115,22,0.03)", borderTop: "1px solid rgba(249,115,22,0.08)", borderBottom: "1px solid rgba(249,115,22,0.08)", padding: "100px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px", opacity: testInView ? 1 : 0, transform: testInView ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s ease" }}>
            <span style={{ display: "inline-block", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.22)", color: "#f97316", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>Reviews</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "700", color: "#fff", margin: 0, letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', serif" }}>What campus says</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="cgo-testimonial" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px", transition: "all 0.3s ease", opacity: testInView ? 1 : 0, animation: testInView ? `cgoStagger 0.5s ease forwards ${i * 0.15}s` : "none" }}>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.8", margin: "0 0 22px", fontStyle: "italic", fontFamily: "'DM Serif Display', serif" }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{t.name}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} style={{ margin: "80px 32px", borderRadius: "24px", padding: "80px 32px", textAlign: "center", position: "relative", zIndex: 1, background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.18)", opacity: ctaInView ? 1 : 0, transform: ctaInView ? "translateY(0)" : "translateY(28px)", transition: "all 0.8s ease" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "700", color: "#fff", margin: "0 0 14px", letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', serif" }}>
          Ready to get started?
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", margin: "0 0 36px", lineHeight: "1.6", fontWeight: "300" }}>
          Join hundreds of students and riders already using CampusGo.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/signup" className="cgo-btn-primary" style={{ background: "#f97316", color: "#fff", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", textDecoration: "none", boxShadow: "0 8px 28px rgba(249,115,22,0.35)", transition: "all 0.25s" }}>
            Send Something →
          </Link>
          <Link to="/signup" className="cgo-btn-outline" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.65)", padding: "14px 26px", borderRadius: "12px", fontSize: "15px", textDecoration: "none", transition: "all 0.2s" }}>
            Earn as a Rider
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "44px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "20px" }}>🚀</span>
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>Campus<span style={{ color: "#f97316" }}>Go</span></span>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.22)", margin: "0 0 20px" }}>Fast. Reliable. Campus-built. 🏍️</p>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
            {["About", "Privacy", "Terms", "Contact", "Become a Rider"].map(l => (
              <a key={l} href="#" className="cgo-footer-link" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.12)", margin: 0 }}>© 2026 CampusGo. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}