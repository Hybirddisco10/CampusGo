import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

/* ── Google Fonts ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
if (!document.head.querySelector("[data-cgo-font]")) {
  fontLink.setAttribute("data-cgo-font", "1");
  document.head.appendChild(fontLink);
}

/* ── Styles ── */
const styleEl = document.createElement("style");
styleEl.setAttribute("data-cgo-hamburger", "1");
styleEl.textContent = `
  @keyframes cgoSlideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  @keyframes cgoFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes cgoLinkIn {
    from { opacity: 0; transform: translateX(16px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .cgo-ham-link:hover { color: #f97316 !important; background: rgba(249,115,22,0.06) !important; }
  .cgo-ham-link.active { color: #f97316 !important; background: rgba(249,115,22,0.1) !important; }
  .cgo-ham-btn:hover { background: rgba(249,115,22,0.1) !important; border-color: rgba(249,115,22,0.35) !important; }
  .cgo-ham-close:hover { background: rgba(255,255,255,0.08) !important; }
  .cgo-ham-auth-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(249,115,22,0.4); }
  .cgo-ham-auth-outline:hover { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.5); }
`;
if (!document.head.querySelector("[data-cgo-hamburger]")) {
  document.head.appendChild(styleEl);
}

const NAV_LINKS = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/about", label: "About", icon: "ℹ️" },
//   { path: "/how-it-works", label: "How It Works", icon: "📋" },
  { path: "/contact", label: "Contact", icon: "✉️" },
];

export default function HamburgerNavbar() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ── FIXED HAMBURGER BUTTON ── */}
      <button
        onClick={() => setOpen(true)}
        className="cgo-ham-btn"
        aria-label="Open menu"
        style={{
          position: "fixed",
          top: "20px",
          right: "24px",
          zIndex: 300,
          width: "46px",
          height: "46px",
          borderRadius: "12px",
          background: "rgba(10,22,40,0.85)",
          border: "1px solid rgba(249,115,22,0.25)",
          backdropFilter: "blur(12px)",
          cursor: "pointer",
          display: open ? "none" : "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <span style={{ width: "20px", height: "2px", background: "#f97316", borderRadius: "2px" }} />
        <span style={{ width: "20px", height: "2px", background: "#f97316", borderRadius: "2px" }} />
        <span style={{ width: "20px", height: "2px", background: "#f97316", borderRadius: "2px" }} />
      </button>

      {/* ── OVERLAY ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 298,
            animation: "cgoFadeIn 0.25s ease forwards",
          }}
        />
      )}

      {/* ── SLIDE-IN PANEL ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(320px, 85vw)",
          background: "#0d1f35",
          borderLeft: "1px solid rgba(249,115,22,0.15)",
          zIndex: 299,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', sans-serif",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: open ? "-12px 0 40px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* Panel header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link to="/" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span style={{ fontSize: "20px" }}>🚀</span>
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>Campus<span style={{ color: "#f97316" }}>Go</span></span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="cgo-ham-close"
            aria-label="Close menu"
            style={{ width: "34px", height: "34px", borderRadius: "8px", background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "18px", cursor: "pointer", transition: "background 0.2s" }}
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "20px 14px", overflowY: "auto" }}>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 12px", marginBottom: "10px" }}>Navigate</p>
          {NAV_LINKS.map((item, i) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `cgo-ham-link ${isActive ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "13px 14px",
                borderRadius: "10px",
                color: "rgba(255,255,255,0.65)",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: "500",
                marginBottom: "4px",
                transition: "all 0.2s",
                opacity: open ? 1 : 0,
                animation: open ? `cgoLinkIn 0.35s ease forwards ${i * 0.06}s` : "none",
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth buttons */}
        <div style={{ padding: "16px 20px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            to="/signin"
            onClick={() => setOpen(false)}
            className="cgo-ham-auth-outline"
            style={{ textAlign: "center", color: "#f97316", border: "1px solid rgba(249,115,22,0.35)", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", textDecoration: "none", transition: "all 0.2s" }}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            onClick={() => setOpen(false)}
            className="cgo-ham-auth-primary"
            style={{ textAlign: "center", background: "#f97316", color: "#fff", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", textDecoration: "none", boxShadow: "0 4px 16px rgba(249,115,22,0.3)", transition: "all 0.2s" }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}