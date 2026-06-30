import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ── Google Fonts ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap";
if (!document.head.querySelector("[data-cgo-font]")) {
  fontLink.setAttribute("data-cgo-font", "1");
  document.head.appendChild(fontLink);
}

/* ── Styles ── */
const styleEl = document.createElement("style");
styleEl.setAttribute("data-cgo-rider", "1");
styleEl.textContent = `
  @keyframes cgoPulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(249,115,22,0.4); }
    50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(249,115,22,0); }
  }
  @keyframes cgoFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes cgoBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes cgoOnline {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
    50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
  }
  .cgo-nav-item:hover { background: rgba(249,115,22,0.08) !important; color: #f97316 !important; }
  .cgo-nav-item.active { background: rgba(249,115,22,0.12) !important; color: #f97316 !important; border-left: 3px solid #f97316 !important; }
  .cgo-request-card:hover { border-color: rgba(249,115,22,0.35) !important; box-shadow: 0 8px 28px rgba(249,115,22,0.1) !important; }
  .cgo-history-row:hover { background: rgba(249,115,22,0.04) !important; }
  .cgo-btn-primary:hover { transform: translateY(-2px) !important; box-shadow: 0 10px 28px rgba(249,115,22,0.4) !important; }
  .cgo-btn-danger:hover { background: rgba(239,68,68,0.15) !important; }
  .cgo-notif:hover { background: rgba(249,115,22,0.06) !important; }
  .cgo-footer-link:hover { color: rgba(255,255,255,0.55) !important; }
`;
if (!document.head.querySelector("[data-cgo-rider]")) {
  document.head.appendChild(styleEl);
}

/* ── Mock Data ── */
const RIDER = {
  name: "Kofi",
  fullName: "Kofi Owusu",
  email: "kofi.owusu@st.knust.edu.gh",
  phone: "0244 567 890",
  vehicle: "Motorbike",
  license: "GH-1234-56",
  rating: 4.9,
  avatar: "KO",
  totalDeliveries: 48,
  earnings: "GH₵ 384",
  completionRate: "96%",
};

const PENDING_REQUESTS = [
  { id: "CG-4830", item: "Laptop Bag", from: "Katanga Hall, Rm 12", to: "College of Engineering", distance: "0.8km", fee: "GH₵ 10", user: "Ama K.", time: "Just now", urgent: true },
  { id: "CG-4829", item: "Printed Assignment", from: "KNUST Printing Services", to: "Queens Hall, Rm 8", distance: "0.5km", fee: "GH₵ 6", user: "Yaw D.", time: "2 mins ago", urgent: false },
  { id: "CG-4828", item: "Food Flask + Water Bottle", from: "Love Hostel", to: "Main Library", distance: "1.1km", fee: "GH₵ 12", user: "Efua M.", time: "4 mins ago", urgent: false },
];

const ACTIVE_DELIVERY = {
  id: "CG-4821",
  item: "Lecture Notes + Charger",
  from: "Unity Hall, Room 214",
  to: "Main Library, Study Room B",
  user: "Frema A.",
  userPhone: "0244 000 001",
  fee: "GH₵ 8",
  otp: "7842",
  status: "on_the_way",
};

const HISTORY = [
  { id: "CG-4820", item: "Mineral Water x2", from: "Campus Mart", to: "Africa Hall, Rm 42", status: "delivered", fee: "GH₵ 6", rating: 5, date: "Today, 9:10 AM" },
  { id: "CG-4810", item: "Textbooks x3", from: "KNUST Bookshop", to: "Queens Hall, Rm 8", status: "delivered", fee: "GH₵ 12", rating: 5, date: "Yesterday, 2:30 PM" },
  { id: "CG-4798", item: "Medication", from: "KNUST Hospital", to: "Africa Hall, Rm 42", status: "delivered", fee: "GH₵ 7", rating: 4, date: "Mon, 11:00 AM" },
  { id: "CG-4780", item: "Phone Charger", from: "Love Hostel", to: "SRC Building", status: "cancelled", fee: "GH₵ 5", rating: null, date: "Sun, 4:00 PM" },
  { id: "CG-4762", item: "Printed Documents", from: "KNUST Printing", to: "College of Science", status: "delivered", fee: "GH₵ 8", rating: 5, date: "Sat, 10:20 AM" },
];

const NOTIFICATIONS = [
  { icon: "📦", message: "New delivery request #CG-4830 near you — GH₵ 10.", time: "Just now", read: false },
  { icon: "⭐", message: "Ama K. rated your last delivery 5 stars. Great work!", time: "1 hr ago", read: false },
  { icon: "💰", message: "Your earnings for this week: GH₵ 96. Keep it up!", time: "Today, 8:00 AM", read: true },
  { icon: "✅", message: "Delivery #CG-4820 marked as completed.", time: "Today, 9:15 AM", read: true },
];

const STATUS_STYLES = {
  delivered: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#22c55e", label: "Delivered" },
  cancelled: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", color: "#ef4444", label: "Cancelled" },
};

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "📦", label: "Requests", id: "requests", badge: PENDING_REQUESTS.length },
  { icon: "📍", label: "Active Delivery", id: "active" },
  { icon: "🕒", label: "History", id: "history" },
  { icon: "💰", label: "Earnings", id: "earnings" },
  { icon: "🔔", label: "Notifications", id: "notifications" },
  { icon: "👤", label: "Profile", id: "profile" },
];

export default function RiderDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isOnline, setIsOnline] = useState(true);
  const [acceptedRequest, setAcceptedRequest] = useState(null);
  const [pendingList, setPendingList] = useState(PENDING_REQUESTS);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  const handleAccept = (req) => {
    setAcceptedRequest(req);
    setPendingList(pendingList.filter(r => r.id !== req.id));
    setActiveNav("active");
  };

  const handleDecline = (id) => {
    setPendingList(pendingList.filter(r => r.id !== id));
  };

  const handleVerifyOtp = () => {
    if (otpInput === ACTIVE_DELIVERY.otp) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError("Incorrect OTP. Please ask the user for the correct code.");
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0a1628", color: "#f0f4ff", minHeight: "100vh", display: "flex" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: "240px", flexShrink: 0, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>

        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span style={{ fontSize: "20px" }}>🚀</span>
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>Campus<span style={{ color: "#f97316" }}>Go</span></span>
          </Link>
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: isOnline ? "#22c55e" : "rgba(255,255,255,0.3)" }}>
              {isOnline ? "🟢 Online" : "⚫ Offline"}
            </span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              style={{ background: isOnline ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${isOnline ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`, color: isOnline ? "#22c55e" : "rgba(255,255,255,0.35)", padding: "4px 10px", borderRadius: "100px", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" }}>Menu</p>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveNav(item.id)} className={`cgo-nav-item ${activeNav === item.id ? "active" : ""}`}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "11px 12px", borderRadius: "10px", background: "transparent", border: "none", borderLeft: activeNav === item.id ? "3px solid #f97316" : "3px solid transparent", color: activeNav === item.id ? "#f97316" : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: activeNav === item.id ? "600" : "400", transition: "all 0.2s", textAlign: "left", marginBottom: "2px" }}>
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
              {item.badge > 0 && (
                <span style={{ marginLeft: "auto", background: "#f97316", color: "#fff", fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "100px" }}>{item.badge}</span>
              )}
              {item.id === "notifications" && unreadCount > 0 && !item.badge && (
                <span style={{ marginLeft: "auto", background: "#f97316", color: "#fff", fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "100px" }}>{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Rider info */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#fff" }}>{RIDER.avatar}</div>
              {isOnline && <div style={{ position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", border: "2px solid #0a1628", animation: "cgoOnline 2s ease-in-out infinite" }} />}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{RIDER.fullName}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>⭐ {RIDER.rating} · {RIDER.vehicle}</p>
            </div>
            <button style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "14px", padding: "4px" }} title="Sign Out">🚪</button>
          </div>
        </div>

      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>

        {/* ── DASHBOARD HOME ── */}
        {activeNav === "dashboard" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>

            {/* Greeting + online status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
              <div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "0 0 4px" }}>Good morning 👋</p>
                <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: "700", color: "#fff", margin: "0 0 6px", fontFamily: "'DM Serif Display', serif" }}>
                  Hello, <span style={{ color: "#f97316" }}>{RIDER.name}!</span>
                </h1>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0, fontWeight: "300" }}>
                  {isOnline ? "You're online and visible to users." : "You're offline. Go online to receive requests."}
                </p>
              </div>
              {/* Online toggle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                <button onClick={() => setIsOnline(!isOnline)} className="cgo-btn-primary"
                  style={{ background: isOnline ? "rgba(34,197,94,0.12)" : "#f97316", border: `1px solid ${isOnline ? "rgba(34,197,94,0.3)" : "transparent"}`, color: isOnline ? "#22c55e" : "#fff", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: "600", transition: "all 0.25s" }}>
                  {isOnline ? "🟢 Online" : "⚫ Go Online"}
                </button>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: 0 }}>{isOnline ? "Tap to go offline" : "Tap to start receiving requests"}</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {[
                { label: "Total Deliveries", value: RIDER.totalDeliveries, icon: "📦" },
                { label: "Total Earnings", value: RIDER.earnings, icon: "💰" },
                { label: "Completion Rate", value: RIDER.completionRate, icon: "✅" },
                { label: "Your Rating", value: `⭐ ${RIDER.rating}`, icon: "🏆" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
                  <div style={{ fontSize: "22px", marginBottom: "10px" }}>{s.icon}</div>
                  <p style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px" }}>{s.value}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Pending requests preview */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: 0 }}>
                  Pending Requests
                  {pendingList.length > 0 && <span style={{ marginLeft: "8px", background: "#f97316", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "100px" }}>{pendingList.length}</span>}
                </h2>
                <button onClick={() => setActiveNav("requests")} style={{ background: "transparent", border: "none", color: "#f97316", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>View all →</button>
              </div>

              {pendingList.length === 0 ? (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
                  <p style={{ fontSize: "28px", marginBottom: "8px" }}>🏍️</p>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", margin: 0 }}>No pending requests right now. Stay online!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {pendingList.slice(0, 2).map((req, i) => (
                    <div key={i} className="cgo-request-card" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${req.urgent ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: "16px", padding: "20px", transition: "all 0.25s", display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          {req.urgent && <span style={{ fontSize: "10px", fontWeight: "700", color: "#f97316", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", padding: "2px 8px", borderRadius: "100px" }}>URGENT</span>}
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>#{req.id}</span>
                        </div>
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "#fff", margin: "0 0 4px" }}>{req.item}</p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "0 0 2px" }}>{req.from} → {req.to}</p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>{req.distance} · {req.user} · {req.time}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                        <p style={{ fontSize: "16px", fontWeight: "700", color: "#f97316", margin: 0 }}>{req.fee}</p>
                        <button onClick={() => handleAccept(req)} style={{ background: "#f97316", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", fontWeight: "600" }}>Accept</button>
                        <button onClick={() => handleDecline(req.id)} className="cgo-btn-danger" style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "6px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent earnings */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: 0 }}>Recent Deliveries</h2>
                <button onClick={() => setActiveNav("history")} style={{ background: "transparent", border: "none", color: "#f97316", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>View all →</button>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden" }}>
                {HISTORY.slice(0, 3).map((d, i) => {
                  const s = STATUS_STYLES[d.status];
                  return (
                    <div key={i} className="cgo-history-row" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.2s" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>📦</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: "500", color: "#fff", margin: "0 0 2px" }}>{d.item}</p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{d.date}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "#f97316", margin: "0 0 4px" }}>{d.fee}</p>
                        <span style={{ fontSize: "11px", fontWeight: "600", color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "2px 8px", borderRadius: "100px" }}>{s.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ── REQUESTS ── */}
        {activeNav === "requests" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", marginBottom: "6px", fontFamily: "'DM Serif Display', serif" }}>Delivery Requests</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "28px", fontWeight: "300" }}>
              {isOnline ? `${pendingList.length} request${pendingList.length !== 1 ? "s" : ""} available near you.` : "You are offline. Go online to see requests."}
            </p>

            {!isOnline ? (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>⚫</p>
                <p style={{ fontSize: "16px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>You're currently offline</p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", marginBottom: "24px" }}>Switch online to start receiving delivery requests.</p>
                <button onClick={() => setIsOnline(true)} style={{ background: "#f97316", border: "none", color: "#fff", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Go Online</button>
              </div>
            ) : pendingList.length === 0 ? (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>🏍️</p>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", margin: 0 }}>No requests right now. Hang tight!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {pendingList.map((req, i) => (
                  <div key={i} className="cgo-request-card" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${req.urgent ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: "20px", padding: "24px", transition: "all 0.25s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {req.urgent && <span style={{ fontSize: "10px", fontWeight: "700", color: "#f97316", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", padding: "3px 10px", borderRadius: "100px", animation: "cgoBlink 2s ease-in-out infinite" }}>🔴 URGENT</span>}
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>#{req.id}</span>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>· {req.time}</span>
                      </div>
                      <p style={{ fontSize: "20px", fontWeight: "700", color: "#f97316", margin: 0 }}>{req.fee}</p>
                    </div>

                    <p style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: "0 0 12px" }}>{req.item}</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", margin: 0 }}>{req.from}</p>
                      </div>
                      <div style={{ width: "1px", height: "10px", background: "rgba(249,115,22,0.2)", marginLeft: "3px" }} />
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#fff", flexShrink: 0 }} />
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", margin: 0 }}>{req.to}</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>📏 {req.distance}</span>
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>👤 {req.user}</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleDecline(req.id)} className="cgo-btn-danger" style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "9px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }}>Decline</button>
                        <button onClick={() => handleAccept(req)} style={{ background: "#f97316", border: "none", color: "#fff", padding: "9px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", fontWeight: "600" }}>Accept →</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVE DELIVERY ── */}
        {activeNav === "active" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards", maxWidth: "600px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", marginBottom: "6px", fontFamily: "'DM Serif Display', serif" }}>Active Delivery</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "28px", fontWeight: "300" }}>Your current delivery in progress.</p>

            {!acceptedRequest && !ACTIVE_DELIVERY ? (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>📦</p>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", margin: 0 }}>No active delivery. Accept a request to get started!</p>
              </div>
            ) : (
              <>
                {/* Delivery info */}
                <div style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>In Progress</p>
                      <p style={{ fontSize: "16px", fontWeight: "600", color: "#fff", margin: 0 }}>📦 {acceptedRequest ? acceptedRequest.item : ACTIVE_DELIVERY.item}</p>
                    </div>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "#f97316", margin: 0 }}>{acceptedRequest ? acceptedRequest.fee : ACTIVE_DELIVERY.fee}</p>
                  </div>

                  {/* Route */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", flexShrink: 0 }} />
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: 0 }}>{acceptedRequest ? acceptedRequest.from : ACTIVE_DELIVERY.from}</p>
                    </div>
                    <div style={{ width: "1px", height: "12px", background: "rgba(249,115,22,0.3)", marginLeft: "3px" }} />
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#fff", flexShrink: 0 }} />
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: 0 }}>{acceptedRequest ? acceptedRequest.to : ACTIVE_DELIVERY.to}</p>
                    </div>
                  </div>

                  {/* User contact */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: "rgba(255,255,255,0.04)", borderRadius: "12px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "#fff" }}>FR</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", color: "#fff", margin: "0 0 1px", fontWeight: "600" }}>{acceptedRequest ? acceptedRequest.user : ACTIVE_DELIVERY.user}</p>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>User</p>
                    </div>
                    <button style={{ background: "#f97316", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", fontWeight: "600" }}>📞 Call</button>
                  </div>
                </div>

                {/* Progress steps */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>Delivery Progress</p>
                  {[
                    { label: "Request Accepted", done: true },
                    { label: "Heading to Pickup", done: true },
                    { label: "Item Picked Up", done: false },
                    { label: "Heading to Dropoff", done: false },
                    { label: "Delivered", done: false },
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: i < 4 ? "12px" : 0 }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: step.done ? "#f97316" : "rgba(255,255,255,0.08)", border: `2px solid ${step.done ? "#f97316" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {step.done && <span style={{ color: "#fff", fontSize: "10px", fontWeight: "700" }}>✓</span>}
                      </div>
                      <p style={{ fontSize: "13px", color: step.done ? "#fff" : "rgba(255,255,255,0.35)", margin: 0, fontWeight: step.done ? "500" : "300" }}>{step.label}</p>
                    </div>
                  ))}
                </div>

                {/* OTP Verification */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#fff", margin: "0 0 6px" }}>🔐 Confirm Delivery with OTP</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "0 0 14px" }}>Ask the user for their OTP code to complete this delivery.</p>

                  {otpVerified ? (
                    <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                      <p style={{ fontSize: "24px", marginBottom: "6px" }}>🎉</p>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#22c55e", margin: "0 0 4px" }}>Delivery Confirmed!</p>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{ACTIVE_DELIVERY.fee} has been added to your earnings.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        value={otpInput}
                        onChange={(e) => { setOtpInput(e.target.value); setOtpError(""); }}
                        placeholder="Enter 4-digit OTP"
                        maxLength={4}
                        style={{ flex: 1, padding: "11px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: `1px solid ${otpError ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: "#fff", fontSize: "16px", fontFamily: "'DM Sans', sans-serif", outline: "none", letterSpacing: "4px", textAlign: "center" }}
                      />
                      <button onClick={handleVerifyOtp} style={{ background: "#f97316", border: "none", color: "#fff", padding: "11px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: "600" }}>Verify</button>
                    </div>
                  )}
                  {otpError && <p style={{ fontSize: "12px", color: "#ef4444", margin: "8px 0 0" }}>{otpError}</p>}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeNav === "history" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", marginBottom: "6px", fontFamily: "'DM Serif Display', serif" }}>Delivery History</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "28px", fontWeight: "300" }}>All your completed and cancelled deliveries.</p>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
              {HISTORY.map((d, i) => {
                const s = STATUS_STYLES[d.status];
                return (
                  <div key={i} className="cgo-history-row" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "18px 24px", borderBottom: i < HISTORY.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.2s" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>📦</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "#fff", margin: 0 }}>{d.item}</p>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>#{d.id}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "0 0 2px" }}>{d.from} → {d.to}</p>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>{d.date}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 10px", borderRadius: "100px", display: "block", marginBottom: "6px" }}>{s.label}</span>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: "#f97316", margin: "0 0 4px" }}>{d.fee}</p>
                      {d.rating && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{"⭐".repeat(d.rating)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EARNINGS ── */}
        {activeNav === "earnings" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", marginBottom: "6px", fontFamily: "'DM Serif Display', serif" }}>Earnings</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "28px", fontWeight: "300" }}>Track your income from deliveries.</p>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {[
                { label: "Total Earned", value: "GH₵ 384", icon: "💰", sub: "All time" },
                { label: "This Week", value: "GH₵ 96", icon: "📅", sub: "6 deliveries" },
                { label: "Today", value: "GH₵ 14", icon: "⚡", sub: "2 deliveries" },
                { label: "Avg. Per Delivery", value: "GH₵ 8", icon: "📊", sub: "Based on 48 trips" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
                  <div style={{ fontSize: "22px", marginBottom: "10px" }}>{s.icon}</div>
                  <p style={{ fontSize: "22px", fontWeight: "700", color: "#f97316", margin: "0 0 2px" }}>{s.value}</p>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#fff", margin: "0 0 2px" }}>{s.label}</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Earnings breakdown */}
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>Recent Earnings</h2>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
              {HISTORY.filter(d => d.status === "delivered").map((d, i, arr) => (
                <div key={i} className="cgo-history-row" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.2s" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>📦</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", color: "#fff", margin: "0 0 2px", fontWeight: "500" }}>{d.item}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{d.date}</p>
                  </div>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#22c55e", margin: 0 }}>+{d.fee}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeNav === "notifications" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards", maxWidth: "600px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", marginBottom: "6px", fontFamily: "'DM Serif Display', serif" }}>Notifications</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "28px", fontWeight: "300" }}>{unreadCount} unread notifications.</p>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" }}>
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} className="cgo-notif" style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "18px 24px", borderBottom: i < NOTIFICATIONS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: !n.read ? "rgba(249,115,22,0.04)" : "transparent", transition: "background 0.2s" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: !n.read ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", color: n.read ? "rgba(255,255,255,0.5)" : "#fff", margin: "0 0 4px", lineHeight: "1.5" }}>{n.message}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>{n.time}</p>
                  </div>
                  {!n.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", flexShrink: 0, marginTop: "4px", animation: "cgoPulse 2s ease-in-out infinite" }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeNav === "profile" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards", maxWidth: "560px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", marginBottom: "6px", fontFamily: "'DM Serif Display', serif" }}>My Profile</h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "28px", fontWeight: "300" }}>Manage your rider account.</p>

            {/* Avatar + rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", marginBottom: "20px" }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "#fff" }}>{RIDER.avatar}</div>
                {isOnline && <div style={{ position: "absolute", bottom: "2px", right: "2px", width: "14px", height: "14px", borderRadius: "50%", background: "#22c55e", border: "2px solid #0a1628" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "20px", fontWeight: "700", color: "#fff", margin: "0 0 4px", fontFamily: "'DM Serif Display', serif" }}>{RIDER.fullName}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "0 0 6px" }}>{RIDER.email}</p>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#f97316", fontWeight: "600" }}>⭐ {RIDER.rating}</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>· {RIDER.totalDeliveries} deliveries</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>· {RIDER.completionRate} completion</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden", marginBottom: "16px" }}>
              {[
                { label: "Full Name", value: RIDER.fullName, icon: "👤" },
                { label: "Email Address", value: RIDER.email, icon: "📧" },
                { label: "Phone Number", value: RIDER.phone, icon: "📱" },
                { label: "Vehicle Type", value: RIDER.vehicle, icon: "🏍️" },
                { label: "License Number", value: RIDER.license, icon: "📋" },
                { label: "Total Earnings", value: RIDER.earnings, icon: "💰" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 24px", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span style={{ fontSize: "16px" }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</p>
                    <p style={{ fontSize: "14px", color: "#fff", margin: 0, fontWeight: "500" }}>{item.value}</p>
                  </div>
                  <button style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>Edit</button>
                </div>
              ))}
            </div>

            <button style={{ width: "100%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "13px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              🚪 Sign Out
            </button>
          </div>
        )}

      </main>
    </div>
  );
}