import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ── Google Fonts ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;70&family=DM+Serif+Display:ital@0;1&display=swap";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap";
if (!document.head.querySelector("[data-cgo-font]")) {
  fontLink.setAttribute("data-cgo-font", "1");
  document.head.appendChild(fontLink);
}

/* ── Animations ── */
const styleEl = document.createElement("style");
styleEl.setAttribute("data-cgo-styles", "1");
styleEl.textContent = `
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
  @keyframes cgoGradShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .cgo-feature-card:hover {
    transform: translateY(-5px) !important;
    border-color: rgba(21,128,61,0.35) !important;
    box-shadow: 0 16px 48px rgba(21,128,61,0.1) !important;
  }
  .cgo-step-card:hover {
    border-color: rgba(21,128,61,0.3) !important;
    background: rgba(21,128,61,0.05) !important;
  }
  .cgo-role-card:hover {
    border-color: rgba(250,204,21,0.4) !important;
    background: rgba(255,255,255,0.06) !important;
    transform: translateY(-4px) !important;
  }
  .cgo-btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 36px rgba(234,179,8,0.4) !important;
  }
  .cgo-btn-outline:hover {
    background: rgba(21,128,61,0.08) !important;
    border-color: rgba(21,128,61,0.5) !important;
    color: #15803d !important;
  }
  .cgo-nav-link:hover { color: #15803d !important; }
  .cgo-footer-link:hover { color: #15803d !important; }
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
  const [ctaRef, ctaInView] = useInView();

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 120);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#ffffff", color: "#14291d", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: scrolled ? "14px 0" : "20px 0", transition: "all 0.3s ease", background: scrolled ? "rgba(255,255,255,0.92)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(21,128,61,0.15)" : "none" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span style={{ fontSize: "20px", fontWeight: "700", color: "#0f2e1c" }}>Campus<span style={{ color: "#15803d" }}>Go</span></span>
          </Link> */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <img src="public/cmpsgo.png" alt="CampusGo logo" style={{ width: "50px", height: "50px" }} />
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#0f2e1c" }}>Campus<span style={{ color: "#15803d" }}>Go</span></span>
          </Link>

          <div style={{ display: "flex", gap: "32px" }}>
            {[["#how-it-works", "How It Works"], ["#features", "Features"]].map(([href, label]) => (
              <a key={href} href={href} className="cgo-nav-link" style={{ color: "#5c7768", textDecoration: "none", fontSize: "14px", transition: "color 0.2s", fontWeight: "400" }}>{label}</a>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link to="/signin" className="cgo-btn-outline" style={{ color: "#15803d", border: "1px solid rgba(21,128,61,0.35)", padding: "9px 20px", borderRadius: "8px", fontSize: "14px", textDecoration: "none", transition: "all 0.2s", fontWeight: "500" }}>Sign In</Link>
            <Link to="/signup" className="cgo-btn-primary" style={{ background: "#eab308", color: "#14291d", padding: "10px 22px", borderRadius: "8px", fontSize: "14px", textDecoration: "none", fontWeight: "600", boxShadow: "0 4px 20px rgba(234,179,8,0.3)", transition: "all 0.2s" }}>Get Started</Link>
          </div>

        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1200px", margin: "0 auto", padding: "120px 32px 80px", gap: "60px", position: "relative", zIndex: 1 }}>

        {/* Left */}
        <div style={{ flex: 1, maxWidth: "540px", opacity: heroVisible ? 1 : 0, animation: heroVisible ? "cgoFadeUp 0.9s ease forwards" : "none" }}>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.35)", color: "#a16207", padding: "7px 16px", borderRadius: "100px", fontSize: "13px", marginBottom: "28px", letterSpacing: "0.3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#eab308", display: "inline-block", animation: "cgoPulse 2s ease-in-out infinite" }} />
            Now live on KNUST campus
          </div>

          <h1 style={{ fontSize: "clamp(40px, 5.5vw, 68px)", fontWeight: "700", lineHeight: "1.1", margin: "0 0 8px", letterSpacing: "-1px", color: "#0f2e1c", fontFamily: "'Poppins', sans-serif" }}>
            Need something delivered?
            {/* <span style={{ background: "linear-gradient(135deg, #15803d, #eab308, #15803d)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "cgoGradShift 3s ease infinite" }}>
              delivered?
            </span> */}
          </h1>

          <p style={{ fontSize: "17px", color: "#5c7768", lineHeight: "1.75", margin: "24px 0 36px", maxWidth: "460px", fontWeight: "300" }}>
            CampusGo connects you with verified campus riders who pick up and deliver your items anywhere on campus — fast, tracked, and secure.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "52px" }}>
            <Link to="/signup" className="cgo-btn-primary" style={{ background: "#eab308", color: "#14291d", padding: "15px 30px", borderRadius: "12px", fontSize: "16px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 28px rgba(234,179,8,0.35)", transition: "all 0.25s", textDecoration: "none" }}>
              Send Something <span>→</span>
            </Link>
            <Link to="/signup" className="cgo-btn-outline" style={{ background: "transparent", border: "1px solid rgba(20,41,29,0.15)", color: "#33513f", padding: "15px 26px", borderRadius: "12px", fontSize: "15px", transition: "all 0.2s", textDecoration: "none" }}>
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
                <span style={{ fontSize: "22px", fontWeight: "700", color: "#15803d", letterSpacing: "-0.5px" }}>{s.num}</span>
                <span style={{ fontSize: "12px", color: "#8a9a90", letterSpacing: "0.3px" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating delivery card */}
        <div style={{ flex: "0 0 360px", opacity: heroVisible ? 1 : 0, transition: "opacity 1s ease 0.3s", animation: heroVisible ? "cgoFloat 5s ease-in-out infinite" : "none" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e5e9e6", borderRadius: "24px", overflow: "hidden", boxShadow: "0 24px 60px rgba(15,46,28,0.14)" }}>

            {/* Card header */}
            <div style={{ background: "rgba(234,179,8,0.1)", padding: "18px 24px", borderBottom: "1px solid rgba(234,179,8,0.18)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#a16207" }}>🏍️ Delivery #CG-4821</span>
              <span style={{ fontSize: "11px", color: "#8a9a90" }}>Just now</span>
            </div>

            <div style={{ padding: "24px" }}>

              {/* Pickup → Dropoff */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#15803d", marginTop: "4px", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "10px", color: "#8a9a90", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Pickup</p>
                      <p style={{ fontSize: "13px", color: "#14291d", margin: 0, fontWeight: "500" }}>Unity Hall, Room 214</p>
                    </div>
                  </div>
                  <div style={{ width: "1px", height: "14px", background: "#e5e9e6", marginLeft: "3px" }} />
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#eab308", marginTop: "4px", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "10px", color: "#8a9a90", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Dropoff</p>
                      <p style={{ fontSize: "13px", color: "#14291d", margin: 0, fontWeight: "500" }}>Main Library, Study Room B</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: "1px", background: "#e5e9e6", marginBottom: "16px" }} />

              {/* Item */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#14291d", margin: "0 0 2px", fontWeight: "500" }}>📦 Lecture Notes + Charger</p>
                  <p style={{ fontSize: "11px", color: "#8a9a90", margin: 0 }}>Handle with care</p>
                </div>
                <span style={{ fontSize: "13px", color: "#15803d", fontWeight: "600" }}>GH₵ 8</span>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#5c7768", marginBottom: "8px" }}>
                  <span>Rider on the way</span>
                  <span style={{ color: "#15803d", fontWeight: "600" }}>~8 mins</span>
                </div>
                <div style={{ height: "4px", background: "#eef1ee", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, #15803d, #eab308)", borderRadius: "4px" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#a8b5ae", marginTop: "6px" }}>
                  <span>Picked up</span>
                  <span>On the way</span>
                  <span>Delivered</span>
                </div>
              </div>

              {/* Rider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(21,128,61,0.06)", borderRadius: "12px", border: "1px solid rgba(21,128,61,0.12)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #15803d, #14532d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>KO</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", color: "#14291d", margin: "0 0 1px", fontWeight: "500" }}>Kofi Owusu</p>
                  <p style={{ fontSize: "11px", color: "#8a9a90", margin: 0 }}>⭐ 4.9 · Honda CB125</p>
                </div>
                <span style={{ fontSize: "18px", cursor: "pointer" }}>📞</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" ref={stepsRef} style={{ background: "rgba(21,128,61,0.04)", borderTop: "1px solid rgba(21,128,61,0.1)", borderBottom: "1px solid rgba(21,128,61,0.1)", padding: "100px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px", opacity: stepsInView ? 1 : 0, transform: stepsInView ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s ease" }}>
            <span style={{ display: "inline-block", background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.35)", color: "#a16207", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>How It Works</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "700", color: "#0f2e1c", margin: "0 0 14px", letterSpacing: "-0.5px", fontFamily: "'Poppins', sans-serif" }}>From request to doorstep in 4 steps</h2>
            <p style={{ fontSize: "16px", color: "#5c7768", maxWidth: "420px", margin: "0 auto", lineHeight: "1.7", fontWeight: "300" }}>Simple, fast, and transparent — every single time.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {STEPS.map((s, i) => (
              <div key={i} className="cgo-step-card" style={{ background: "#ffffff", border: "1px solid #e5e9e6", borderRadius: "20px", padding: "28px", transition: "all 0.3s ease", opacity: stepsInView ? 1 : 0, animation: stepsInView ? `cgoStagger 0.5s ease forwards ${i * 0.12}s` : "none" }}>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "rgba(21,128,61,0.25)", marginBottom: "16px", fontFamily: "'Poppins', sans-serif" }}>{s.num}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f2e1c", margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontSize: "14px", color: "#5c7768", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featRef} style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "60px", opacity: featInView ? 1 : 0, transform: featInView ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s ease" }}>
          <span style={{ display: "inline-block", background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.35)", color: "#a16207", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>Features</span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "700", color: "#0f2e1c", margin: "0 0 14px", letterSpacing: "-0.5px", fontFamily: "'Poppins', sans-serif" }}>Everything you need on campus</h2>
          <p style={{ fontSize: "16px", color: "#5c7768", maxWidth: "420px", margin: "0 auto", lineHeight: "1.7", fontWeight: "300" }}>Built specifically for campus life — not a general delivery app forced to fit.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="cgo-feature-card" style={{ background: "#ffffff", border: "1px solid #e5e9e6", borderRadius: "20px", padding: "30px", transition: "all 0.3s ease", opacity: featInView ? 1 : 0, animation: featInView ? `cgoStagger 0.5s ease forwards ${i * 0.1}s` : "none" }}>
              <div style={{ fontSize: "28px", marginBottom: "14px" }}>{f.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#0f2e1c", margin: "0 0 10px" }}>{f.title}</h3>
              <p style={{ fontSize: "14px", color: "#5c7768", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} style={{ margin: "80px 32px", borderRadius: "24px", padding: "80px 32px", textAlign: "center", position: "relative", zIndex: 1, background: "#14532d", border: "1px solid rgba(250,204,21,0.2)", opacity: ctaInView ? 1 : 0, transform: ctaInView ? "translateY(0)" : "translateY(28px)", transition: "all 0.8s ease" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: "700", color: "#fff", margin: "0 0 14px", letterSpacing: "-0.5px", fontFamily: "'Poppins', sans-serif" }}>
           Get started?
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", margin: "0 0 36px", lineHeight: "1.6", fontWeight: "300" }}>
          Join hundreds of students and riders already using CampusGo.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/signup" className="cgo-btn-primary" style={{ background: "#eab308", color: "#14291d", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", textDecoration: "none", boxShadow: "0 8px 28px rgba(234,179,8,0.35)", transition: "all 0.25s" }}>
            Send Something →
          </Link>
          <Link to="/signup" className="cgo-btn-outline" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)", padding: "14px 26px", borderRadius: "12px", fontSize: "15px", textDecoration: "none", transition: "all 0.2s" }}>
            Earn as a Rider
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #e5e9e6", padding: "44px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f2e1c" }}>Campus<span style={{ color: "#15803d" }}>Go</span></span>
          </div>
          <p style={{ fontSize: "13px", color: "#8a9a90", margin: "0 0 20px" }}>Fast. Reliable. Campus-built.</p>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
            <Link to="/about" className="cgo-footer-link" style={{ color: "#5c7768", textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}>About</Link>
            <Link to="/contact" className="cgo-footer-link" style={{ color: "#5c7768", textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}>Contact</Link>
          </div>
          <p style={{ fontSize: "12px", color: "#a8b5ae", margin: 0 }}>© 2026 CampusGo. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}