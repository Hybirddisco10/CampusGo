import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/* ── Google Fonts (matches landing page) ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap";
if (!document.head.querySelector("[data-cgo-font]")) {
  fontLink.setAttribute("data-cgo-font", "1");
  document.head.appendChild(fontLink);
}

/* ── Animations (same keyframes as the landing page) ── */
const styleEl = document.createElement("style");
styleEl.setAttribute("data-cgo-about-styles", "1");
styleEl.textContent = `
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
    border-color: rgba(250,204,21,0.4) !important;
    background: rgba(255,255,255,0.06) !important;
    transform: translateY(-4px) !important;
  }
  .cgo-nav-link:hover { color: #15803d !important; }
  .cgo-btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 36px rgba(234,179,8,0.4) !important;
  }
  .cgo-btn-outline:hover {
    background: rgba(21,128,61,0.08) !important;
    border-color: rgba(21,128,61,0.5) !important;
    color: #15803d !important;
  }
  .cgo-footer-link:hover { color: #15803d !important; }
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
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#ffffff", color: "#14291d", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>

      {/* ── HERO / MISSION ───────────────────────────────────────── */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "160px 32px 100px", textAlign: "center", position: "relative", zIndex: 1 }}>

        <div style={{ opacity: heroVisible ? 1 : 0, animation: heroVisible ? "cgoFadeUp 0.9s ease forwards" : "none" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.35)", color: "#a16207", padding: "7px 16px", borderRadius: "100px", fontSize: "13px", marginBottom: "28px", letterSpacing: "0.3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#eab308", display: "inline-block", animation: "cgoPulse 2s ease-in-out infinite" }} />
            Why we exist
          </div>

          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "700", lineHeight: "1.15", margin: "0 0 24px", letterSpacing: "-1px", color: "#0f2e1c", fontFamily: "'Poppins', sans-serif" }}>
            Campus is small on a map.
            <br />
            It doesn't feel that way at 8am.
          </h1>

          <p style={{ fontSize: "17px", color: "#5c7768", lineHeight: "1.75", margin: "0 auto", maxWidth: "620px", fontWeight: "300" }}>
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
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "15px", color: "#a16207", whiteSpace: "nowrap", paddingTop: "8px" }}>
            The app, plainly
          </span>
          <div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: "700", color: "#0f2e1c", margin: "0 0 20px", letterSpacing: "-0.5px", fontFamily: "'Poppins', sans-serif" }}>
              A request, a route, a knock at the door.
            </h2>
            <p style={{ fontSize: "16px", color: "#33513f", lineHeight: "1.8", margin: "0 0 18px", fontWeight: "400" }}>
              CampusGo isn't a marketplace and there's nothing to buy inside it.
              It's the layer that moves things you already need moved: tell us
              where something is and where it needs to go, and a verified
              student rider already on that route picks it up.
            </p>
            <p style={{ fontSize: "16px", color: "#5c7768", lineHeight: "1.8", margin: 0, fontWeight: "400" }}>
              You watch the whole trip on a live map, confirm the handoff with a
              one-time code so nothing goes missing, and pay for exactly the
              distance covered. No stores, no listings, no browsing, just your
              errand, en route.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR (solid KNUST green section) ─────────────── */}
      <section style={{ background: "#14532d", padding: "100px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ display: "inline-block", background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.35)", color: "#facc15", padding: "6px 16px", borderRadius: "100px", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
              Built around your day
            </span>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: "700", color: "#fff", margin: 0, letterSpacing: "-0.5px", fontFamily: "'Poppins', sans-serif" }}>
              Who's already routing through CampusGo
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {audiences.map((a) => (
              <div key={a.label} className="cgo-role-card" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", padding: "28px", transition: "all 0.3s ease" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#facc15", marginBottom: "16px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#fff", margin: "0 0 10px", fontFamily: "'DM Serif Display', serif" }}>{a.label}</h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{a.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #e5e9e6", padding: "44px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f2e1c" }}>Campus<span style={{ color: "#15803d" }}>Go</span></span>
          </div>
          <p style={{ fontSize: "13px", color: "#8a9a90", margin: "0 0 20px" }}>Fast. Reliable. Campus-built. 🏍️</p>
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