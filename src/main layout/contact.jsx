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
styleEl.setAttribute("data-cgo-contact-styles", "1");
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
  .cgo-input:focus {
    border-color: rgba(249,115,22,0.55) !important;
    box-shadow: 0 0 0 3px rgba(249,115,22,0.12) !important;
  }
  .cgo-btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 36px rgba(249,115,22,0.45) !important;
  }
  .cgo-footer-link:hover { color: rgba(255,255,255,0.55) !important; }
`;
if (!document.head.querySelector("[data-cgo-contact-styles]")) {
  document.head.appendChild(styleEl);
}

export default function ContactPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [form, setForm] = useState({ email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e0d8",
    background: "#fff",
    color: "#0a1628",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#33415c",
    marginBottom: "8px",
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0a1628", color: "#f0f4ff", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>

      {/* Background orbs — same as landing page */}
      <div style={{ position: "fixed", top: "-180px", right: "-180px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0, animation: "cgoOrbDrift1 20s ease-in-out infinite" }} />
      <div style={{ position: "fixed", bottom: "-120px", left: "-120px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(30,64,175,0.15) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0, animation: "cgoOrbDrift2 24s ease-in-out infinite" }} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "160px 32px 70px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ opacity: heroVisible ? 1 : 0, animation: heroVisible ? "cgoFadeUp 0.9s ease forwards" : "none" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#fb923c", padding: "7px 16px", borderRadius: "100px", fontSize: "13px", marginBottom: "28px", letterSpacing: "0.3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316", display: "inline-block", animation: "cgoPulse 2s ease-in-out infinite" }} />
            Get in touch
          </div>

          <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: "700", lineHeight: "1.15", margin: "0 0 20px", letterSpacing: "-1px", color: "#fff", fontFamily: "'DM Serif Display', serif" }}>
            Questions, issues, ideas — we're listening.
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: "1.75", margin: "0 auto", maxWidth: "540px", fontWeight: "300" }}>
            Whether a delivery didn't go as planned or you just want to say
            hello, the CampusGo team reads every message that comes through here.
          </p>
        </div>
      </section>

      {/* ── CONTACT INFO + FORM ──────────────────────────────────── */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 32px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 320px) 1fr", gap: "0", borderRadius: "24px", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>

          {/* Left — info panel, stays on dark */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRight: "none", padding: "44px 36px", display: "flex", flexDirection: "column", gap: "28px" }}>
            <div>
              <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", color: "#f97316", margin: "0 0 10px" }}>Email us</h3>
              {/* <p style={{ fontSize: "15px", color: "#fff", margin: 0, fontWeight: "500" }}>cmpsgo26@gmail.com</p> */}
               <a 
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=cmpsgo26@gmail.com&body"
                       target="_blank"
                        className="text-gray-300 hover:text-orange-300 transition-colors duration-300"
                      >
                        cmpsgo26@gmail.com
                      </a>
            </div>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <div>
              <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", color: "#f97316", margin: "0 0 10px" }}>Find us</h3>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: "1.6" }}>KNUST, Kumasi<br />Ghana</p>
            </div>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />
            {/* <div>
              <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", color: "#f97316", margin: "0 0 10px" }}>Response time</h3>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: "1.6" }}>Usually within a day</p>
            </div> */}
          </div>

          {/* Right — white form card */}
          <div style={{ background: "#FAFAF8", padding: "44px 40px" }}>
            {sent ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", minHeight: "320px" }}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "26px", color: "#0a1628", margin: "0 0 10px" }}>Message sent</h2>
                <p style={{ fontSize: "15px", color: "#64708a", margin: 0 }}>Thanks for reaching out — we'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "24px", color: "#0a1628", margin: "0 0 28px" }}>Send us a message</h2>

                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Email address</label>
                  <input
                    className="cgo-input"
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={form.email}
                    onChange={handleChange("email")}
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Phone number</label>
                  <input
                    className="cgo-input"
                    type="tel"
                    required
                    placeholder="+233 20 123 4567"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: "28px" }}>
                  <label style={labelStyle}>Message</label>
                  <textarea
                    className="cgo-input"
                    required
                    rows={5}
                    placeholder="Tell us what's going on..."
                    value={form.message}
                    onChange={handleChange("message")}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>

                <button
                  type="submit"
                  className="cgo-btn-primary"
                  style={{ background: "#f97316", color: "#fff", padding: "14px 30px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(249,115,22,0.3)", transition: "all 0.25s" }}
                >
                  Send message →
                </button>
              </form>
            )}
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