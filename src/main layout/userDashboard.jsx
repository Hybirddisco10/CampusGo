import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ── Google Fonts ── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
if (!document.head.querySelector("[data-cgo-font]")) {
  fontLink.setAttribute("data-cgo-font", "1");
  document.head.appendChild(fontLink);
}

/* ── Styles ── */
const styleEl = document.createElement("style");
styleEl.setAttribute("data-cgo-dash", "1");
styleEl.textContent = `
  @keyframes cgoPulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(234,179,8,0.4); }
    50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(234,179,8,0); }
  }
  @keyframes cgoFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes cgoSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes cgoBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  @keyframes cgoRiderMove {
    0%, 100% { transform: translate(0px, 0px); }
    25% { transform: translate(8px, -5px); }
    50% { transform: translate(-5px, 8px); }
    75% { transform: translate(10px, 4px); }
  }
  .cgo-nav-item:hover { background: rgba(21,128,61,0.08) !important; color: #15803d !important; }
  .cgo-nav-item.active { background: rgba(234,179,8,0.12) !important; color: #a16207 !important; border-left: 3px solid #eab308 !important; }
  .cgo-action-card:hover { transform: translateY(-3px) !important; border-color: rgba(21,128,61,0.35) !important; box-shadow: 0 12px 32px rgba(21,128,61,0.1) !important; }
  .cgo-delivery-row:hover { background: rgba(21,128,61,0.04) !important; }
  .cgo-btn-primary:hover { transform: translateY(-2px) !important; box-shadow: 0 10px 28px rgba(234,179,8,0.35) !important; }
  .cgo-rider-pin:hover { transform: scale(1.3) !important; z-index: 10 !important; }
  .cgo-notif:hover { background: rgba(21,128,61,0.05) !important; }
`;
if (!document.head.querySelector("[data-cgo-dash]")) {
  document.head.appendChild(styleEl);
}

/* ── Mock Data ── */
const USER = { name: "Frema", email: "frema@st.knust.edu.gh", studentId: "21-45678", avatar: "FR" };

const DELIVERIES = [
  { id: "CG-4821", item: "Lecture Notes + Charger", from: "Unity Hall, Rm 214", to: "Main Library, Study B", status: "delivered", rider: "Kofi Owusu", rating: 5, date: "Today, 10:22 AM", fee: "GH₵ 8" },
  { id: "CG-4790", item: "Food Flask", from: "Love Hostel", to: "KNUST SRC", status: "delivered", rider: "Ama Serwaa", rating: 4, date: "Yesterday, 1:45 PM", fee: "GH₵ 6" },
  { id: "CG-4763", item: "Laptop Bag", from: "Katanga Hall", to: "College of Engineering", status: "delivered", rider: "Kwesi Boateng", rating: 5, date: "Mon, 9:10 AM", fee: "GH₵ 10" },
  { id: "CG-4710", item: "Textbooks x3", from: "KNUST Bookshop", to: "Queens Hall, Rm 8", status: "cancelled", rider: "—", rating: null, date: "Sun, 3:30 PM", fee: "GH₵ 12" },
  { id: "CG-4682", item: "Medication", from: "KNUST Hospital", to: "Africa Hall, Rm 42", status: "delivered", rider: "Yaw Darko", rating: 5, date: "Sat, 11:00 AM", fee: "GH₵ 7" },
];

const RIDERS = [
  { id: 1, name: "Kofi O.", rating: 4.9, vehicle: "Motorbike", distance: "0.3km", top: "38%", left: "45%", active: true },
  { id: 2, name: "Ama S.", rating: 4.7, vehicle: "Bicycle", distance: "0.6km", top: "55%", left: "62%", active: true },
  { id: 3, name: "Yaw D.", rating: 4.8, vehicle: "Motorbike", distance: "0.9km", top: "30%", left: "28%", active: false },
  { id: 4, name: "Efua M.", rating: 4.6, vehicle: "On Foot", distance: "0.4km", top: "65%", left: "38%", active: true },
];

const NOTIFICATIONS = [
  { icon: "✅", message: "Your delivery #CG-4821 was completed successfully.", time: "10 mins ago", read: false },
  { icon: "⭐", message: "Don't forget to rate your last rider, Kofi Owusu.", time: "12 mins ago", read: false },
  { icon: "🏍️", message: "Rider Ama Serwaa accepted your request #CG-4790.", time: "Yesterday", read: true },
  { icon: "📦", message: "Your delivery #CG-4790 has been picked up.", time: "Yesterday", read: true },
];

const STATUS_STYLES = {
  delivered: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: "#16a34a", label: "Delivered" },
  active: { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.3)", color: "#a16207", label: "In Progress" },
  cancelled: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", color: "#ef4444", label: "Cancelled" },
};

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "📦", label: "Request Delivery", id: "request" },
  { icon: "📍", label: "Track Delivery", id: "track" },
  { icon: "🕒", label: "History", id: "history" },
  { icon: "🔔", label: "Notifications", id: "notifications" },
  { icon: "👤", label: "Profile", id: "profile" },
];

export default function UserDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [requestForm, setRequestForm] = useState({ item: "", description: "", pickup: "", dropoff: "", note: "" });
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [unreadCount] = useState(NOTIFICATIONS.filter(n => !n.read).length);

  const handleRequestChange = (e) => setRequestForm({ ...requestForm, [e.target.name]: e.target.value });

  const handleRequestSubmit = () => {
    if (!requestForm.item || !requestForm.pickup || !requestForm.dropoff) {
      alert("Please fill in the item, pickup, and dropoff fields.");
      return;
    }
    setRequestSubmitted(true);
    setTimeout(() => { setShowRequestModal(false); setRequestSubmitted(false); setRequestForm({ item: "", description: "", pickup: "", dropoff: "", note: "" }); }, 2500);
  };

  const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: "10px", background: "#ffffff", border: "1px solid #d8ded9", color: "#14291d", fontSize: "14px", fontFamily: "'Poppins', sans-serif", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#ffffff", color: "#14291d", minHeight: "100vh", display: "flex" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: "240px", flexShrink: 0, background: "#FAFAF8", borderRight: "1px solid #e5e9e6", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>

        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #e5e9e6" }}>
          {/* <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}> */}
            {/* <span style={{ fontSize: "20px" }}>🚀</span> */}
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f2e1c" }}>Campus<span style={{ color: "#15803d" }}>Go</span></span>
          {/* </Link> */}
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          <p style={{ fontSize: "10px", color: "#a8b5ae", letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" }}>Menu</p>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveNav(item.id)} className={`cgo-nav-item ${activeNav === item.id ? "active" : ""}`}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "11px 12px", borderRadius: "10px", background: "transparent", border: activeNav === item.id ? "none" : "none", borderLeft: activeNav === item.id ? "3px solid #eab308" : "3px solid transparent", color: activeNav === item.id ? "#a16207" : "#5c7768", cursor: "pointer", fontSize: "14px", fontFamily: "'Poppins', sans-serif", fontWeight: activeNav === item.id ? "600" : "400", transition: "all 0.2s", textAlign: "left", marginBottom: "2px", position: "relative" }}>
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
              {item.id === "notifications" && unreadCount > 0 && (
                <span style={{ marginLeft: "auto", background: "#eab308", color: "#14291d", fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "100px" }}>{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e9e6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #15803d, #14532d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>{USER.avatar}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#0f2e1c", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{USER.name}</p>
              <p style={{ fontSize: "11px", color: "#8a9a90", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{USER.studentId}</p>
            </div>
            <button style={{ background: "transparent", border: "none", color: "#a8b5ae", cursor: "pointer", fontSize: "14px", padding: "4px" }} title="Sign Out">🚪</button>
          </div>
        </div>

      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px", maxWidth: "100%" }}>

        {/* ── DASHBOARD HOME ── */}
        {activeNav === "dashboard" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>

            {/* Greeting */}
            <div style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "13px", color: "#8a9a90", margin: "0 0 4px" }}>Good morning 👋</p>
              <h1 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: "700", color: "#0f2e1c", margin: "0 0 6px", fontFamily: "'Poppins', sans-serif" }}>
                Hello, <span style={{ color: "#15803d" }}>{USER.name}!</span>
              </h1>
              <p style={{ fontSize: "14px", color: "#5c7768", margin: 0, fontWeight: "300" }}>What do you need delivered today?</p>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {[
                { label: "Total Deliveries", value: "12", icon: "📦" },
                { label: "Completed", value: "10", icon: "✅" },
                { label: "Cancelled", value: "2", icon: "❌" },
                { label: "Avg. Delivery Time", value: "18 min", icon: "⚡" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#FAFAF8", border: "1px solid #e5e9e6", borderRadius: "16px", padding: "20px" }}>
                  <div style={{ fontSize: "22px", marginBottom: "10px" }}>{s.icon}</div>
                  <p style={{ fontSize: "22px", fontWeight: "700", color: "#0f2e1c", margin: "0 0 4px" }}>{s.value}</p>
                  <p style={{ fontSize: "12px", color: "#8a9a90", margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0f2e1c", marginBottom: "16px" }}>Quick Actions</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
                {[
                  { icon: "📦", label: "Request a Delivery", desc: "Send something across campus", action: () => setShowRequestModal(true), primary: true },
                  { icon: "📍", label: "Track My Delivery", desc: "See where your rider is", action: () => setActiveNav("track"), primary: false },
                  { icon: "🕒", label: "View History", desc: "See past deliveries", action: () => setActiveNav("history"), primary: false },
                  { icon: "🔔", label: "Notifications", desc: `${unreadCount} unread alerts`, action: () => setActiveNav("notifications"), primary: false },
                ].map((card, i) => (
                  <button key={i} onClick={card.action} className="cgo-action-card"
                    style={{ background: card.primary ? "rgba(234,179,8,0.1)" : "#FAFAF8", border: `1px solid ${card.primary ? "rgba(234,179,8,0.35)" : "#e5e9e6"}`, borderRadius: "16px", padding: "20px", cursor: "pointer", textAlign: "left", transition: "all 0.25s", fontFamily: "'Poppins', sans-serif" }}>
                    <div style={{ fontSize: "24px", marginBottom: "10px" }}>{card.icon}</div>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: card.primary ? "#a16207" : "#0f2e1c", margin: "0 0 4px" }}>{card.label}</p>
                    <p style={{ fontSize: "12px", color: "#8a9a90", margin: 0, fontWeight: "300" }}>{card.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent deliveries preview */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0f2e1c", margin: 0 }}>Recent Deliveries</h2>
                <button onClick={() => setActiveNav("history")} style={{ background: "transparent", border: "none", color: "#15803d", fontSize: "13px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>View all →</button>
              </div>
              <div style={{ background: "#FAFAF8", border: "1px solid #e5e9e6", borderRadius: "16px", overflow: "hidden" }}>
                {DELIVERIES.slice(0, 3).map((d, i) => {
                  const s = STATUS_STYLES[d.status];
                  return (
                    <div key={i} className="cgo-delivery-row" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderBottom: i < 2 ? "1px solid #eef1ee" : "none", transition: "background 0.2s" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(21,128,61,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>📦</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: "500", color: "#0f2e1c", margin: "0 0 2px" }}>{d.item}</p>
                        <p style={{ fontSize: "12px", color: "#8a9a90", margin: 0 }}>{d.from} → {d.to}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "11px", fontWeight: "600", color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 10px", borderRadius: "100px", display: "block", marginBottom: "4px" }}>{s.label}</span>
                        <span style={{ fontSize: "11px", color: "#a8b5ae" }}>{d.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nearby riders map preview */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0f2e1c", margin: 0 }}>Riders Near You</h2>
                <span style={{ fontSize: "12px", color: "#8a9a90" }}>{RIDERS.filter(r => r.active).length} available now</span>
              </div>
              <div style={{ background: "#FAFAF8", border: "1px solid #e5e9e6", borderRadius: "16px", overflow: "hidden", position: "relative", height: "280px" }}>

                {/* Map background */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #eef1ee 0%, #f5f7f4 50%, #eef1ee 100%)" }}>
                  {/* Grid lines */}
                  {[...Array(8)].map((_, i) => (
                    <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${i * 14}%`, height: "1px", background: "rgba(20,41,29,0.05)" }} />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${i * 11}%`, width: "1px", background: "rgba(20,41,29,0.05)" }} />
                  ))}
                  {/* Roads */}
                  <div style={{ position: "absolute", top: "45%", left: 0, right: 0, height: "2px", background: "rgba(21,128,61,0.18)" }} />
                  <div style={{ position: "absolute", left: "40%", top: 0, bottom: 0, width: "2px", background: "rgba(21,128,61,0.18)" }} />
                  <div style={{ position: "absolute", top: "70%", left: "20%", right: "10%", height: "1px", background: "rgba(20,41,29,0.08)" }} />
                  <div style={{ position: "absolute", left: "65%", top: "20%", bottom: "30%", width: "1px", background: "rgba(20,41,29,0.08)" }} />
                </div>

                {/* User pin */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 5 }}>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#3b82f6", border: "3px solid #fff", boxShadow: "0 0 0 6px rgba(59,130,246,0.2)" }} />
                  <p style={{ position: "absolute", top: "18px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "#fff", whiteSpace: "nowrap", background: "rgba(20,41,29,0.8)", padding: "2px 6px", borderRadius: "4px" }}>You</p>
                </div>

                {/* Rider pins */}
                {RIDERS.map(r => (
                  <div key={r.id} className="cgo-rider-pin" onClick={() => setSelectedRider(selectedRider?.id === r.id ? null : r)}
                    style={{ position: "absolute", top: r.top, left: r.left, transform: "translate(-50%,-50%)", zIndex: 4, cursor: "pointer", transition: "transform 0.2s", animation: r.active ? `cgoRiderMove ${6 + r.id}s ease-in-out infinite` : "none" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: r.active ? "linear-gradient(135deg, #eab308, #ca8a04)" : "#d8ded9", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", boxShadow: r.active ? "0 4px 12px rgba(234,179,8,0.35)" : "none" }}>
                      🏍️
                    </div>
                    {/* Rider tooltip */}
                    {selectedRider?.id === r.id && (
                      <div style={{ position: "absolute", bottom: "38px", left: "50%", transform: "translateX(-50%)", background: "#ffffff", border: "1px solid #e5e9e6", borderRadius: "10px", padding: "10px 14px", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 8px 24px rgba(20,41,29,0.15)" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#0f2e1c", margin: "0 0 2px" }}>{r.name}</p>
                        <p style={{ fontSize: "11px", color: "#5c7768", margin: "0 0 2px" }}>⭐ {r.rating} · {r.vehicle}</p>
                        <p style={{ fontSize: "11px", color: "#15803d", margin: 0 }}>{r.distance} away</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Legend */}
                <div style={{ position: "absolute", bottom: "12px", left: "12px", display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.9)", padding: "5px 10px", borderRadius: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }} />
                    <span style={{ fontSize: "11px", color: "#33513f" }}>Available</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,0.9)", padding: "5px 10px", borderRadius: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d8ded9" }} />
                    <span style={{ fontSize: "11px", color: "#33513f" }}>Busy</span>
                  </div>
                </div>

                {/* Tap hint */}
                <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(255,255,255,0.9)", padding: "5px 10px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#5c7768" }}>Tap a rider to preview</span>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ── REQUEST DELIVERY ── */}
        {activeNav === "request" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards", maxWidth: "560px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f2e1c", marginBottom: "6px", fontFamily: "'Poppins', sans-serif" }}>Request a Delivery</h1>
            <p style={{ fontSize: "14px", color: "#5c7768", marginBottom: "32px", fontWeight: "300" }}>Fill in the details and a rider will be assigned to you.</p>

            <div style={{ background: "#FAFAF8", border: "1px solid #e5e9e6", borderRadius: "20px", padding: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#33513f", marginBottom: "8px", fontWeight: "500", letterSpacing: "0.3px" }}>Item Name *</label>
                  <input name="item" value={requestForm.item} onChange={handleRequestChange} placeholder="e.g. Lecture Notes, Laptop Charger" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#33513f", marginBottom: "8px", fontWeight: "500", letterSpacing: "0.3px" }}>Item Description</label>
                  <input name="description" value={requestForm.description} onChange={handleRequestChange} placeholder="e.g. A blue bag with two books inside" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#33513f", marginBottom: "8px", fontWeight: "500", letterSpacing: "0.3px" }}>Pickup Location *</label>
                  <input name="pickup" value={requestForm.pickup} onChange={handleRequestChange} placeholder="e.g. Unity Hall, Room 214" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#33513f", marginBottom: "8px", fontWeight: "500", letterSpacing: "0.3px" }}>Dropoff Location *</label>
                  <input name="dropoff" value={requestForm.dropoff} onChange={handleRequestChange} placeholder="e.g. Main Library, Study Room B" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#33513f", marginBottom: "8px", fontWeight: "500", letterSpacing: "0.3px" }}>Note for Rider</label>
                  <input name="note" value={requestForm.note} onChange={handleRequestChange} placeholder="e.g. Please handle with care" style={inputStyle} />
                </div>

                {/* Fee estimate */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "rgba(21,128,61,0.06)", border: "1px solid rgba(21,128,61,0.15)", borderRadius: "12px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#5c7768", margin: "0 0 2px" }}>Estimated Fee</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "#15803d", margin: 0 }}>GH₵ 6 — 12</p>
                  </div>
                  <p style={{ fontSize: "12px", color: "#8a9a90", margin: 0, textAlign: "right" }}>Based on<br />distance</p>
                </div>

                <button onClick={handleRequestSubmit} className="cgo-btn-primary"
                  style={{ background: "#eab308", border: "none", color: "#14291d", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif", boxShadow: "0 6px 20px rgba(234,179,8,0.3)", transition: "all 0.25s" }}>
                  {requestSubmitted ? "✅ Request Sent! Finding a rider..." : "Send Delivery Request →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TRACK DELIVERY ── */}
        {activeNav === "track" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f2e1c", marginBottom: "6px", fontFamily: "'Poppins', sans-serif" }}>Track Your Delivery</h1>
            <p style={{ fontSize: "14px", color: "#5c7768", marginBottom: "28px", fontWeight: "300" }}>Follow your rider in real time.</p>

            {/* Active delivery card */}
            <div style={{ background: "rgba(21,128,61,0.05)", border: "1px solid rgba(21,128,61,0.18)", borderRadius: "20px", padding: "24px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#8a9a90", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Active Delivery</p>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#0f2e1c", margin: 0 }}>📦 Lecture Notes + Charger</p>
                </div>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#a16207", background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)", padding: "5px 12px", borderRadius: "100px" }}>In Progress</span>
              </div>

              {/* Route */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#15803d", flexShrink: 0 }} />
                  <p style={{ fontSize: "13px", color: "#33513f", margin: 0 }}>Unity Hall, Room 214</p>
                </div>
                <div style={{ width: "1px", height: "12px", background: "rgba(21,128,61,0.25)", marginLeft: "3px" }} />
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#eab308", flexShrink: 0 }} />
                  <p style={{ fontSize: "13px", color: "#33513f", margin: 0 }}>Main Library, Study Room B</p>
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#5c7768", marginBottom: "8px" }}>
                  <span>Rider on the way</span>
                  <span style={{ color: "#a16207", fontWeight: "600", animation: "cgoBlink 1.5s ease-in-out infinite" }}>~8 mins away</span>
                </div>
                <div style={{ height: "6px", background: "#eef1ee", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, #15803d, #eab308)", borderRadius: "6px" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#a8b5ae", marginTop: "6px" }}>
                  <span>✅ Picked up</span>
                  <span style={{ color: "#a16207" }}>🏍️ On the way</span>
                  <span>📦 Delivered</span>
                </div>
              </div>

              {/* Rider info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: "#ffffff", borderRadius: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #15803d, #14532d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "#fff" }}>KO</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", color: "#0f2e1c", margin: "0 0 2px", fontWeight: "600" }}>Kofi Owusu</p>
                  <p style={{ fontSize: "12px", color: "#8a9a90", margin: 0 }}>⭐ 4.9 · Honda CB125</p>
                </div>
                <button style={{ background: "#eab308", border: "none", color: "#14291d", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: "'Poppins', sans-serif", fontWeight: "600" }}>📞 Call</button>
              </div>
            </div>

            {/* Mini map */}
            <div style={{ background: "#FAFAF8", border: "1px solid #e5e9e6", borderRadius: "16px", overflow: "hidden", height: "260px", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #eef1ee, #f5f7f4)" }}>
                {[...Array(8)].map((_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${i * 14}%`, height: "1px", background: "rgba(20,41,29,0.05)" }} />)}
                {[...Array(10)].map((_, i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${i * 11}%`, width: "1px", background: "rgba(20,41,29,0.05)" }} />)}
                <div style={{ position: "absolute", top: "45%", left: 0, right: 0, height: "2px", background: "rgba(21,128,61,0.18)" }} />
                <div style={{ position: "absolute", left: "40%", top: 0, bottom: 0, width: "2px", background: "rgba(21,128,61,0.18)" }} />
              </div>
              {/* User */}
              <div style={{ position: "absolute", top: "60%", left: "65%", transform: "translate(-50%,-50%)", zIndex: 5 }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#3b82f6", border: "3px solid #fff", boxShadow: "0 0 0 6px rgba(59,130,246,0.2)" }} />
              </div>
              {/* Rider moving */}
              <div style={{ position: "absolute", top: "40%", left: "45%", transform: "translate(-50%,-50%)", zIndex: 5, animation: "cgoRiderMove 4s ease-in-out infinite" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #eab308, #ca8a04)", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", boxShadow: "0 4px 12px rgba(234,179,8,0.35)" }}>🏍️</div>
              </div>
              <div style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(255,255,255,0.9)", padding: "6px 12px", borderRadius: "8px" }}>
                <span style={{ fontSize: "12px", color: "#a16207", fontWeight: "600", animation: "cgoBlink 1.5s ease-in-out infinite" }}>● Live tracking active</span>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeNav === "history" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f2e1c", marginBottom: "6px", fontFamily: "'Poppins', sans-serif" }}>Delivery History</h1>
            <p style={{ fontSize: "14px", color: "#5c7768", marginBottom: "28px", fontWeight: "300" }}>All your past deliveries in one place.</p>

            <div style={{ background: "#FAFAF8", border: "1px solid #e5e9e6", borderRadius: "20px", overflow: "hidden" }}>
              {DELIVERIES.map((d, i) => {
                const s = STATUS_STYLES[d.status];
                return (
                  <div key={i} className="cgo-delivery-row" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "18px 24px", borderBottom: i < DELIVERIES.length - 1 ? "1px solid #eef1ee" : "none", transition: "background 0.2s" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(21,128,61,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>📦</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <p style={{ fontSize: "14px", fontWeight: "600", color: "#0f2e1c", margin: 0 }}>{d.item}</p>
                        <span style={{ fontSize: "11px", color: "#a8b5ae" }}>#{d.id}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#5c7768", margin: "0 0 2px" }}>{d.from} → {d.to}</p>
                      <p style={{ fontSize: "12px", color: "#8a9a90", margin: 0 }}>{d.rider !== "—" ? `Rider: ${d.rider}` : "No rider assigned"} · {d.date}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "3px 10px", borderRadius: "100px", display: "block", marginBottom: "6px" }}>{s.label}</span>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#15803d", margin: "0 0 4px" }}>{d.fee}</p>
                      {d.rating && (
                        <p style={{ fontSize: "11px", color: "#8a9a90", margin: 0 }}>{"⭐".repeat(d.rating)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeNav === "notifications" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards", maxWidth: "600px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f2e1c", marginBottom: "6px", fontFamily: "'Poppins', sans-serif" }}>Notifications</h1>
            <p style={{ fontSize: "14px", color: "#5c7768", marginBottom: "28px", fontWeight: "300" }}>{unreadCount} unread notifications.</p>

            <div style={{ background: "#FAFAF8", border: "1px solid #e5e9e6", borderRadius: "20px", overflow: "hidden" }}>
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} className="cgo-notif" style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "18px 24px", borderBottom: i < NOTIFICATIONS.length - 1 ? "1px solid #eef1ee" : "none", background: !n.read ? "rgba(234,179,8,0.06)" : "transparent", transition: "background 0.2s" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: !n.read ? "rgba(234,179,8,0.15)" : "#eef1ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", color: n.read ? "#8a9a90" : "#0f2e1c", margin: "0 0 4px", lineHeight: "1.5" }}>{n.message}</p>
                    <p style={{ fontSize: "12px", color: "#a8b5ae", margin: 0 }}>{n.time}</p>
                  </div>
                  {!n.read && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308", flexShrink: 0, marginTop: "4px", animation: "cgoPulse 2s ease-in-out infinite" }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeNav === "profile" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards", maxWidth: "560px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f2e1c", marginBottom: "6px", fontFamily: "'Poppins', sans-serif" }}>My Profile</h1>
            <p style={{ fontSize: "14px", color: "#5c7768", marginBottom: "28px", fontWeight: "300" }}>Manage your account details.</p>

            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px", background: "#FAFAF8", border: "1px solid #e5e9e6", borderRadius: "20px", marginBottom: "20px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #15803d, #14532d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "#fff" }}>{USER.avatar}</div>
              <div>
                <p style={{ fontSize: "20px", fontWeight: "700", color: "#0f2e1c", margin: "0 0 4px", fontFamily: "'Poppins', sans-serif" }}>{USER.name}</p>
                <p style={{ fontSize: "13px", color: "#5c7768", margin: "0 0 2px" }}>{USER.email}</p>
                <p style={{ fontSize: "13px", color: "#8a9a90", margin: 0 }}>Student ID: {USER.studentId}</p>
              </div>
            </div>

            {/* Details */}
            <div style={{ background: "#FAFAF8", border: "1px solid #e5e9e6", borderRadius: "20px", overflow: "hidden", marginBottom: "16px" }}>
              {[
                { label: "Full Name", value: USER.name, icon: "👤" },
                { label: "Email Address", value: USER.email, icon: "📧" },
                { label: "Phone Number", value: "0244 567 890", icon: "📱" },
                { label: "Student ID", value: USER.studentId, icon: "🎓" },
                { label: "Total Deliveries", value: "12", icon: "📦" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 24px", borderBottom: i < 4 ? "1px solid #eef1ee" : "none" }}>
                  <span style={{ fontSize: "16px" }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "11px", color: "#a8b5ae", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</p>
                    <p style={{ fontSize: "14px", color: "#0f2e1c", margin: 0, fontWeight: "500" }}>{item.value}</p>
                  </div>
                  <button style={{ background: "transparent", border: "none", color: "#a8b5ae", cursor: "pointer", fontSize: "12px", fontFamily: "'Poppins', sans-serif" }}>Edit</button>
                </div>
              ))}
            </div>

            {/* Sign out */}
            <Link to="/signout">
              <button style={{ width: "100%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "13px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                🚪 Sign Out
              </button>
            </Link>
          </div>
        )}

      </main>

      {/* ── REQUEST MODAL ── */}
      {showRequestModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,41,29,0.5)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e5e9e6", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "480px", animation: "cgoFadeUp 0.3s ease forwards", boxShadow: "0 24px 60px rgba(20,41,29,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f2e1c", margin: 0, fontFamily: "'Poppins', sans-serif" }}>Request a Delivery</h2>
              <button onClick={() => setShowRequestModal(false)} style={{ background: "transparent", border: "none", color: "#8a9a90", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { name: "item", label: "Item Name *", placeholder: "e.g. Lecture Notes, Charger" },
                { name: "pickup", label: "Pickup Location *", placeholder: "e.g. Unity Hall, Room 214" },
                { name: "dropoff", label: "Dropoff Location *", placeholder: "e.g. Main Library, Study B" },
                { name: "note", label: "Note for Rider", placeholder: "e.g. Handle with care" },
              ].map(field => (
                <div key={field.name}>
                  <label style={{ display: "block", fontSize: "12px", color: "#33513f", marginBottom: "6px", fontWeight: "500" }}>{field.label}</label>
                  <input name={field.name} value={requestForm[field.name]} onChange={handleRequestChange} placeholder={field.placeholder} style={inputStyle} />
                </div>
              ))}
              <button onClick={handleRequestSubmit} className="cgo-btn-primary"
                style={{ background: "#eab308", border: "none", color: "#14291d", padding: "13px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif", marginTop: "6px", transition: "all 0.25s" }}>
                {requestSubmitted ? "✅ Sent! Finding a rider..." : "Send Request →"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}