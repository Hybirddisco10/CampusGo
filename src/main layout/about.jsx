import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/* ── Google Fonts (matches landing page) ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap";
if (!document.head.querySelector("[data-cgo-font]")) {
  fontLink.setAttribute("data-cgo-font", "1");
  document.head.appendChild(fontLink);
}

/* ── Animations (same keyframes as the landing page) ── */
const styleEl = document.createElement("style");
styleEl.setAttribute("data-cgo-about-styles", "1");
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
  .cgo-role-card:hover {
    border-color: rgba(249,115,22,0.4) !important;
    background: rgba(249,115,22,0.06) !important;
    transform: translateY(-4px) !important;
  }
  .cgo-nav-link:hover { color: #f97316 !important; }
  .cgo-btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 36px rgba(249,115,22,0.45) !important;
  }
  .cgo-btn-outline:hover {
    background: rgba(249,115,22,0.08) !important;
    border-color: rgba(249,115,22,0.5) !important;
    color: #f97316 !important;
  }
  .cgo-footer-link:hover { color: rgba(255,255,255,0.55) !important; }
`;
if (!document.head.querySelector("[data-cgo-about-styles]")) {
  document.head.appendChild(styleEl);
}

const audiences = [
  {
    label: "Lecture-day students",
    copy: "Back-to-back classes, no time to walk to the food court. Order between lectures and it's waiting at your hall by the time you're free.",
  },
  {
    label: "Hall & hostel residents",
    copy: "Everything from meals to forgotten textbooks routed straight to your room or porter's lodge, no trip into town required.",
  },
  {
    label: "New students",
    copy: "Still learning where things are on campus. Send an errand instead of guessing which route gets you there and back before your next class.",
  },
  {
    label: "Student riders",
    copy: "Free hour between classes becomes an earning window. Pick up nearby drop-offs and get paid out the same day.",
  },
];

export default function AboutPage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0a1628", color: "#f0f4ff", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>

      {/* Background orbs — same as landing page */}
      <div style={{ position: "fixed", top: "-180px", right: "-180px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0, animation: "cgoOrbDrift1 20s ease-in-out infinite" }} />
      <div style={{ position: "fixed", bottom: "-120px", left: "-120px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(30,64,175,0.15) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0, animation: "cgoOrbDrift2 24s ease-in-out infinite" }} />

      {/* ── HERO / MISSION ───────────────────────────────────────── */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "160px 32px 100px", textAlign: "center", position: "relative", zIndex: 1 }}>

        <div style={{ opacity: heroVisible ? 1 : 0, animation: heroVisible ? "cgoFadeUp 0.9s ease forwards" : "none" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#fb923c", padding: "7px 16px", borderRadius: "100px", fontSize: "13px", marginBottom: "28px", letterSpacing: "0.3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316", display: "inline-block", animation: "cgoPulse 2s ease-in-out infinite" }} />
            Why we exist
          </div>

          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "700", lineHeight: "1.15", margin: "0 0 24px", letterSpacing: "-1px", color: "#fff", fontFamily: "'DM Serif Display', serif" }}>
            Campus is small on a map.
            <br />
            It doesn't feel that way at 8am.
          </h1>

          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", lineHeight: "1.75", margin: "0 auto", maxWidth: "620px", fontWeight: "300" }}>
            We're a small team of KNUST students who got tired of choosing between
            making it to class on time and getting basic errands done. CampusGo
            exists for one reason: to give every student on this campus their
            time back, by putting a trusted, verified rider between them and
            whatever needs to move from one side of campus to the other.
          </p>
        </div>
      </section>

      {/* ── WHAT THE APP DOES (white section) ───────────────────── */}
      <section style={{ background: "#FAFAF8", position: "relative", zIndex: 1, padding: "100px 32px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "auto 1fr", gap: "40px", alignItems: "start" }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "15px", color: "#ea580c", whiteSpace: "nowrap", paddingTop: "8px" }}>
            The app, plainly
          </span>
          <div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: "700", color: "#0a1628", margin: "0 0 20px", letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', serif" }}>
              A request, a route, a knock at the door.
            </h2>
            <p style={{ fontSize: "16px", color: "#33415c", lineHeight: "1.8", margin: "0 0 18px", fontWeight: "400" }}>
              CampusGo isn't a marketplace and there's nothing to buy inside it.
              It's the layer that moves things you already need moved: tell us
              where something is and where it needs to go, and a verified
              student rider already on that route picks it up.
            </p>
            <p style={{ fontSize: "16px", color: "#64708a", lineHeight: "1.8", margin: 0, fontWeight: "400" }}>
              You watch the whole trip on a live map, confirm the handoff with a
              one-time code so nothing goes missing, and pay for exactly the
              distance covered. No stores, no listings, no browsing, just your
              errand, en route.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR (tinted dark section) ───────────────────── */}
      <section style={{ background: "rgba(249,115,22,0.03)", borderTop: "1px solid rgba(249,115,22,0.08)", borderBottom: "1px solid rgba(249,115,22,0.08)", padding: "100px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ display: "inline-block", background: "rgba(30,64,175,0.12)", border: "1px solid rgba(96,133,231,0.3)", color: "#8fa8f7", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
              Built around your day
            </span>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: "700", color: "#fff", margin: 0, letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', serif" }}>
              Who's already routing through CampusGo
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {audiences.map((a) => (
              <div key={a.label} className="cgo-role-card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px", transition: "all 0.3s ease" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", marginBottom: "16px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#fff", margin: "0 0 10px", fontFamily: "'DM Serif Display', serif" }}>{a.label}</h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{a.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER — identical to the landing page footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "44px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
            {/* <span style={{ fontSize: "20px" }}>🚀</span> */}
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>Campus<span style={{ color: "#f97316" }}>Go</span></span>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.22)", margin: "0 0 20px" }}>Fast. Reliable. Campus-built. 🏍️</p>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
            <Link to="/about" className="cgo-footer-link" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}>About</Link>
            <Link to="/contact" className="cgo-footer-link" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}>Contact</Link>
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.12)", margin: 0 }}>© 2026 CampusGo. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}