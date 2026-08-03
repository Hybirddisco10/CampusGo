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
styleEl.setAttribute("data-cgo-contact-styles", "1");
styleEl.textContent = `
  @keyframes cgoPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes cgoFadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .cgo-input:focus {
    border-color: rgba(21,128,61,0.55) !important;
    box-shadow: 0 0 0 3px rgba(21,128,61,0.12) !important;
  }
  .cgo-btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 36px rgba(234,179,8,0.4) !important;
  }
  .cgo-footer-link:hover { color: #15803d !important; }
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
    border: "1px solid #d8ded9",
    background: "#fff",
    color: "#14291d",
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
    color: "#33513f",
    marginBottom: "8px",
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#ffffff", color: "#14291d", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "160px 32px 70px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ opacity: heroVisible ? 1 : 0, animation: heroVisible ? "cgoFadeUp 0.9s ease forwards" : "none" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.35)", color: "#a16207", padding: "7px 16px", borderRadius: "100px", fontSize: "13px", marginBottom: "28px", letterSpacing: "0.3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#eab308", display: "inline-block", animation: "cgoPulse 2s ease-in-out infinite" }} />
            Get in touch
          </div>

          <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: "700", lineHeight: "1.15", margin: "0 0 20px", letterSpacing: "-1px", color: "#0f2e1c", fontFamily: "'Poppins', sans-serif" }}>
            Questions, issues, ideas — we're listening.
          </h1>
          <p style={{ fontSize: "16px", color: "#5c7768", lineHeight: "1.75", margin: "0 auto", maxWidth: "540px", fontWeight: "300" }}>
            Whether a delivery didn't go as planned or you just want to say
            hello, the CampusGo team reads every message that comes through here.
          </p>
        </div>
      </section>

      {/* ── CONTACT INFO + FORM ──────────────────────────────────── */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 32px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 320px) 1fr", gap: "0", borderRadius: "24px", overflow: "hidden", boxShadow: "0 24px 60px rgba(15,46,28,0.12)" }}>

          {/* Left — info panel, solid KNUST green */}
          <div style={{ background: "#14532d", padding: "44px 36px", display: "flex", flexDirection: "column", gap: "28px" }}>
            <div>
              <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", color: "#facc15", margin: "0 0 10px" }}>Email us</h3>
               <a 
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=cmpsgo26@gmail.com&body"
                       target="_blank"
                        style={{ color: "#e7f5eb", textDecoration: "none", transition: "color 0.3s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#facc15")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#e7f5eb")}
                      >
                        cmpsgo26@gmail.com
                      </a>
            </div>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.15)" }} />
            <div>
              <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", color: "#facc15", margin: "0 0 10px" }}>Find us</h3>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: "1.6" }}>KNUST, Kumasi<br />Ghana</p>
            </div>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.15)" }} />
          </div>

          {/* Right — white form card */}
          <div style={{ background: "#ffffff", padding: "44px 40px" }}>
            {sent ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", minHeight: "320px" }}>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "26px", color: "#0f2e1c", margin: "0 0 10px" }}>Message sent</h2>
                <p style={{ fontSize: "15px", color: "#5c7768", margin: 0 }}>Thanks for reaching out — we'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "24px", color: "#0f2e1c", margin: "0 0 28px" }}>Send us a message</h2>

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
                  style={{ background: "#eab308", color: "#14291d", padding: "14px 30px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(234,179,8,0.25)", transition: "all 0.25s" }}
                >
                  Send message →
                </button>
              </form>
            )}
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