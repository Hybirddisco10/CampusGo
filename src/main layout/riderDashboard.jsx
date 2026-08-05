// src/main layout/riderDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import {
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
  confirmDelivery,
  toggleAvailability,
  getEarnings,
  getRiderHistory,
  updateLocation,
} from "../services/rider.service";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

/* ── Styles ── */
const styleEl = document.createElement("style");
styleEl.setAttribute("data-cgo-rider", "1");
styleEl.textContent = `
  @keyframes cgoPulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(234,179,8,0.4); }
    50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(234,179,8,0); }
  }
  @keyframes cgoFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes cgoBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .cgo-nav-item:hover { background: rgba(21,128,61,0.08) !important; color: #15803d !important; }
  .cgo-nav-item.active { background: rgba(234,179,8,0.12) !important; color: #a16207 !important; border-left: 3px solid #eab308 !important; }
  .cgo-request-card:hover { border-color: rgba(21,128,61,0.3) !important; box-shadow: 0 8px 28px rgba(21,128,61,0.08) !important; }
  .cgo-history-row:hover { background: rgba(21,128,61,0.04) !important; }
  .cgo-btn-primary:hover { transform: translateY(-2px) !important; box-shadow: 0 10px 28px rgba(234,179,8,0.35) !important; }
`;
if (!document.head.querySelector("[data-cgo-rider]")) {
  document.head.appendChild(styleEl);
}

const STATUS_STYLES = {
  delivered: {
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
    color: "#16a34a",
    label: "Delivered",
  },
  cancelled: {
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.2)",
    color: "#ef4444",
    label: "Cancelled",
  },
};

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "📦", label: "Requests", id: "requests" },
  { icon: "📍", label: "Active Delivery", id: "active" },
  { icon: "💰", label: "Earnings", id: "earnings" },
  { icon: "🕒", label: "History", id: "history" },
  { icon: "👤", label: "Profile", id: "profile" },
];

export default function RiderDashboard() {
  const { user, updateUser, logout } = useAuth();
  const {
    isConnected,
    joinOrder,
    leaveOrder,
    sendLocationUpdate,
    joinRiderChannel,
    on,
    off,
  } = useSocket();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [earnings, setEarnings] = useState({ total: 0, today: 0, week: 0 });
  const [history, setHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [locationInterval, setLocationInterval] = useState(null);

  // ── FETCH AVAILABLE ORDERS ──
  const fetchAvailableOrders = useCallback(async () => {
    try {
      const response = await getAvailableOrders();
      if (response.success) {
        setAvailableOrders(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch available orders:", error);
    }
  }, []);

  // ── FETCH EARNINGS ──
  const fetchEarnings = useCallback(async (period = "week") => {
    try {
      const response = await getEarnings(period);
      if (response.success) {
        setEarnings(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    }
  }, []);

  // ── FETCH HISTORY ──
  const fetchHistory = useCallback(async () => {
    try {
      const response = await getRiderHistory({ limit: 50 });
      if (response.success) {
        setHistory(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, []);

  // ── TOGGLE AVAILABILITY ──
  const handleToggleAvailability = async (available) => {
    try {
      const response = await toggleAvailability(available);
      if (response.success) {
        setIsOnline(available);
        joinRiderChannel(available);
        toast.success(available ? "You are now online" : "You are now offline");
        if (available) {
          fetchAvailableOrders();
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to toggle availability"
      );
    }
  };

  // ── ACCEPT ORDER ── (FIXED: uses fresh API data)
  const handleAcceptOrder = async (orderId) => {
    setIsSubmitting(true);
    try {
      const response = await acceptOrder(orderId);
      if (response.success) {
        toast.success("Order accepted!");
        // ✅ Merge fresh status with existing order details
        const existingOrder = availableOrders.find((o) => o.id === orderId);
        if (existingOrder) {
          // Keep all fields from availableOrders, update status and courier info
          setActiveOrder({
            ...existingOrder,
            status: response.data.status, // 'ASSIGNED'
            courierId: response.data.courierId,
            courierName: response.data.courierName,
            receiverPhone: response.data.receiverPhone,
            otp: response.data.otp,
          });
        } else {
          // Fallback
          setActiveOrder(response.data);
        }
        setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
        joinOrder(orderId);
        fetchAvailableOrders();
        setActiveNav("active");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── UPDATE ORDER STATUS ──
  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await updateOrderStatus(orderId, status);
      if (response.success) {
        toast.success(`Order status updated to ${status}`);
        if (activeOrder) {
          setActiveOrder({ ...activeOrder, status });
        }
        if (status === "PICKED_UP") {
          startLocationUpdates(orderId);
        }
        if (status === "IN_TRANSIT") {
          // Continue location updates
        }
        fetchAvailableOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // ── CONFIRM DELIVERY WITH OTP ──
  const handleConfirmDelivery = async (orderId) => {
    if (!otpInput || otpInput.length !== 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }
    try {
      const response = await confirmDelivery(orderId, otpInput);
      if (response.success) {
        toast.success("Delivery confirmed! 🎉");
        setOtpVerified(true);
        setOtpInput("");
        stopLocationUpdates();
        setActiveOrder(null);
        fetchEarnings();
        fetchHistory();
        fetchAvailableOrders();
        leaveOrder(orderId);
      }
    } catch (error) {
      setOtpError(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    }
  };

  // ── LOCATION UPDATES ──
  const startLocationUpdates = (orderId) => {
    if (locationInterval) {
      clearInterval(locationInterval);
    }
    let lat = 6.6731;
    let lng = -1.5702;
    const interval = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.002;
      lng += (Math.random() - 0.5) * 0.002;
      sendLocationUpdate(orderId, lat, lng);
      updateLocation(lat, lng).catch(() => {});
    }, 3000);
    setLocationInterval(interval);
  };

  const stopLocationUpdates = () => {
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
  };

  // ── WEBSOCKET LISTENERS ──
  useEffect(() => {
    if (!isConnected) return;

    const handleNewOrderAlert = (data) => {
      toast.info(`📢 New order #${data.orderId} available!`);
      fetchAvailableOrders();
    };

    on("new-order-alert", handleNewOrderAlert);
    on("order-status-changed", (data) => {
      if (data.orderId === activeOrder?.id) {
        setActiveOrder((prev) => ({ ...prev, status: data.status }));
      }
    });

    return () => {
      off("new-order-alert", handleNewOrderAlert);
      off("order-status-changed");
    };
  }, [isConnected, activeOrder, on, off, fetchAvailableOrders]);

  // ── INITIAL LOAD ──
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAvailableOrders(),
        fetchEarnings("week"),
        fetchHistory(),
      ]);
      setLoading(false);
    };
    loadData();

    setIsOnline(user?.isAvailable ?? true);
    if (user?.isAvailable) {
      joinRiderChannel(true);
    }

    return () => {
      stopLocationUpdates();
    };
  }, [
    user,
    fetchAvailableOrders,
    fetchEarnings,
    fetchHistory,
    joinRiderChannel,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  // ── RENDER ──
  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#ffffff",
        color: "#14291d",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          background: "#FAFAF8",
          borderRight: "1px solid #e5e9e6",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid #e5e9e6",
          }}
        >
          <span
            style={{ fontSize: "18px", fontWeight: "700", color: "#0f2e1c" }}
          >
            Campus<span style={{ color: "#15803d" }}>Go</span>
          </span>
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: isOnline ? "#16a34a" : "#a8b5ae",
              }}
            >
              {isOnline ? "🟢 Online" : "⚫ Offline"}
            </span>
            <button
              onClick={() => handleToggleAvailability(!isOnline)}
              style={{
                background: isOnline ? "rgba(34,197,94,0.12)" : "#eef1ee",
                border: `1px solid ${
                  isOnline ? "rgba(34,197,94,0.3)" : "#e5e9e6"
                }`,
                color: isOnline ? "#16a34a" : "#8a9a90",
                padding: "4px 10px",
                borderRadius: "100px",
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </button>
          </div>
        </div>

        <nav style={{ padding: "16px 12px", flex: 1 }}>
          <p
            style={{
              fontSize: "10px",
              color: "#a8b5ae",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              padding: "0 8px",
              marginBottom: "8px",
            }}
          >
            Menu
          </p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`cgo-nav-item ${
                activeNav === item.id ? "active" : ""
              }`}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 12px",
                borderRadius: "10px",
                background: "transparent",
                border: "none",
                borderLeft:
                  activeNav === item.id
                    ? "3px solid #eab308"
                    : "3px solid transparent",
                color: activeNav === item.id ? "#a16207" : "#5c7768",
                cursor: "pointer",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: activeNav === item.id ? "600" : "400",
                transition: "all 0.2s",
                textAlign: "left",
                marginBottom: "2px",
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
              {item.id === "requests" && availableOrders.length > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#eab308",
                    color: "#14291d",
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "1px 6px",
                    borderRadius: "100px",
                  }}
                >
                  {availableOrders.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e9e6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #15803d, #14532d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "700",
                color: "#fff",
              }}
            >
              {user?.name?.charAt(0) || "R"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f2e1c",
                  margin: 0,
                }}
              >
                {user?.name || "Rider"}
              </p>
              <p style={{ fontSize: "11px", color: "#8a9a90", margin: 0 }}>
                ⭐ {user?.rating || 5.0}
              </p>
            </div>
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "none",
                color: "#a8b5ae",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
        {/* DASHBOARD */}
        {activeNav === "dashboard" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "32px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#8a9a90",
                    margin: "0 0 4px",
                  }}
                >
                  Good morning 👋
                </p>
                <h1
                  style={{
                    fontSize: "clamp(24px, 3vw, 36px)",
                    fontWeight: "700",
                    color: "#0f2e1c",
                    margin: "0 0 6px",
                  }}
                >
                  Hello,{" "}
                  <span style={{ color: "#15803d" }}>
                    {user?.name || "Rider"}!
                  </span>
                </h1>
                <p style={{ fontSize: "14px", color: "#5c7768", margin: 0 }}>
                  {isOnline
                    ? "You're online and visible to users."
                    : "You're offline. Go online to receive requests."}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              {[
                {
                  label: "Available Orders",
                  value: availableOrders.length,
                  icon: "📦",
                },
                {
                  label: "Week Earnings",
                  value: `GH₵ ${earnings.totalEarnings || 0}`,
                  icon: "💰",
                },
                {
                  label: "Today",
                  value: `GH₵ ${earnings.today || 0}`,
                  icon: "⚡",
                },
                {
                  label: "Rating",
                  value: `⭐ ${user?.rating || 5.0}`,
                  icon: "🏆",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#FAFAF8",
                    border: "1px solid #e5e9e6",
                    borderRadius: "16px",
                    padding: "20px",
                  }}
                >
                  <div style={{ fontSize: "22px", marginBottom: "10px" }}>
                    {s.icon}
                  </div>
                  <p
                    style={{
                      fontSize: "22px",
                      fontWeight: "700",
                      color: "#0f2e1c",
                      margin: "0 0 4px",
                    }}
                  >
                    {s.value}
                  </p>
                  <p style={{ fontSize: "12px", color: "#8a9a90", margin: 0 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#0f2e1c",
                    margin: 0,
                  }}
                >
                  Pending Requests
                </h2>
                <button
                  onClick={() => setActiveNav("requests")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#15803d",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  View all →
                </button>
              </div>
              <div
                style={{
                  background: "#FAFAF8",
                  border: "1px solid #e5e9e6",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                {availableOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="cgo-request-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px 20px",
                      borderBottom: "1px solid #eef1ee",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#0f2e1c",
                          margin: "0 0 4px",
                        }}
                      >
                        {order.packageDescription || "Package"}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#5c7768",
                          margin: 0,
                        }}
                      >
                        {order.pickupLocation} → {order.dropOffLocation}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#8a9a90",
                          margin: 0,
                        }}
                      >
                        GH₵ {order.deliveryFee}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={isSubmitting}
                      style={{
                        background: "#eab308",
                        border: "none",
                        color: "#14291d",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        opacity: isSubmitting ? 0.6 : 1,
                      }}
                    >
                      Accept
                    </button>
                  </div>
                ))}
                {availableOrders.length === 0 && (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#8a9a90",
                    }}
                  >
                    No requests right now.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REQUESTS */}
        {activeNav === "requests" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#0f2e1c",
                marginBottom: "6px",
              }}
            >
              Available Requests
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#5c7768",
                marginBottom: "28px",
              }}
            >
              {isOnline
                ? `${availableOrders.length} request${
                    availableOrders.length !== 1 ? "s" : ""
                  } available.`
                : "Go online to see requests."}
            </p>

            {!isOnline ? (
              <div
                style={{
                  background: "#FAFAF8",
                  border: "1px solid #e5e9e6",
                  borderRadius: "20px",
                  padding: "60px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>⚫</p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#0f2e1c",
                    marginBottom: "8px",
                  }}
                >
                  You're offline
                </p>
                <button
                  onClick={() => handleToggleAvailability(true)}
                  style={{
                    background: "#eab308",
                    border: "none",
                    color: "#14291d",
                    padding: "12px 28px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Go Online
                </button>
              </div>
            ) : availableOrders.length === 0 ? (
              <div
                style={{
                  background: "#FAFAF8",
                  border: "1px solid #e5e9e6",
                  borderRadius: "20px",
                  padding: "60px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>🏍️</p>
                <p style={{ fontSize: "16px", color: "#8a9a90", margin: 0 }}>
                  No requests right now. Hang tight!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {availableOrders.map((order) => (
                  <div
                    key={order.id}
                    className="cgo-request-card"
                    style={{
                      background: "#FAFAF8",
                      border: "1px solid #e5e9e6",
                      borderRadius: "20px",
                      padding: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "12px", color: "#a8b5ae" }}>
                          #{order.id}
                        </p>
                      </div>
                      <p
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#15803d",
                          margin: 0,
                        }}
                      >
                        GH₵ {order.deliveryFee}
                      </p>
                    </div>

                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#0f2e1c",
                        margin: "0 0 12px",
                      }}
                    >
                      {order.packageDescription || "Package"}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#15803d",
                            flexShrink: 0,
                          }}
                        />
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#33513f",
                            margin: 0,
                          }}
                        >
                          {order.pickupLocation}
                        </p>
                      </div>
                      <div
                        style={{
                          width: "1px",
                          height: "10px",
                          background: "#d8ded9",
                          marginLeft: "3px",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "2px",
                            background: "#eab308",
                            flexShrink: 0,
                          }}
                        />
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#33513f",
                            margin: 0,
                          }}
                        >
                          {order.dropOffLocation}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "13px", color: "#5c7768" }}>
                        Estimated payout: GH₵{" "}
                        {order.estimatedPayout?.toFixed(2) ||
                          order.deliveryFee * 0.9}
                      </span>
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={isSubmitting}
                        style={{
                          background: "#eab308",
                          border: "none",
                          color: "#14291d",
                          padding: "9px 20px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "600",
                          opacity: isSubmitting ? 0.6 : 1,
                        }}
                      >
                        Accept →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE DELIVERY */}
        {activeNav === "active" && (
          <div
            style={{
              animation: "cgoFadeUp 0.5s ease forwards",
              maxWidth: "600px",
            }}
          >
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#0f2e1c",
                marginBottom: "6px",
              }}
            >
              Active Delivery
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#5c7768",
                marginBottom: "28px",
              }}
            >
              {activeOrder ? `Order #${activeOrder.id}` : "No active delivery"}
            </p>

            {!activeOrder ? (
              <div
                style={{
                  background: "#FAFAF8",
                  border: "1px solid #e5e9e6",
                  borderRadius: "20px",
                  padding: "60px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>📦</p>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#8a9a90",
                    margin: 0,
                  }}
                >
                  You don't have an active delivery. Accept a request to get
                  started!
                </p>
                <button
                  onClick={() => setActiveNav("requests")}
                  style={{
                    marginTop: "16px",
                    background: "#eab308",
                    border: "none",
                    color: "#14291d",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: "600",
                  }}
                >
                  View Requests
                </button>
              </div>
            ) : (
              <>
                {/* Delivery info */}
                <div
                  style={{
                    background: "rgba(21,128,61,0.05)",
                    border: "1px solid rgba(21,128,61,0.18)",
                    borderRadius: "20px",
                    padding: "24px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "18px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#8a9a90",
                          margin: "0 0 4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                        }}
                      >
                        In Progress
                      </p>
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#0f2e1c",
                          margin: 0,
                        }}
                      >
                        📦 {activeOrder.packageDescription || "Package"}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#15803d",
                        margin: 0,
                      }}
                    >
                      GH₵ {activeOrder.deliveryFee}
                    </p>
                  </div>

                  {/* Route */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#15803d",
                          flexShrink: 0,
                        }}
                      />
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#33513f",
                          margin: 0,
                        }}
                      >
                        {activeOrder.pickupLocation}
                      </p>
                    </div>
                    <div
                      style={{
                        width: "1px",
                        height: "12px",
                        background: "rgba(21,128,61,0.25)",
                        marginLeft: "3px",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "2px",
                          background: "#eab308",
                          flexShrink: 0,
                        }}
                      />
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#33513f",
                          margin: 0,
                        }}
                      >
                        {activeOrder.dropOffLocation}
                      </p>
                    </div>
                  </div>

                  {/* User info */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px",
                      background: "#ffffff",
                      borderRadius: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "#eef1ee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#0f2e1c",
                      }}
                    >
                      {activeOrder.receiverName?.charAt(0) || "R"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#0f2e1c",
                          margin: "0 0 1px",
                          fontWeight: "600",
                        }}
                      >
                        {activeOrder.receiverName || "Receiver"}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#8a9a90",
                          margin: 0,
                        }}
                      >
                        Receiver
                      </p>
                    </div>
                    <button
                      style={{
                        background: "#eab308",
                        border: "none",
                        color: "#14291d",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: "600",
                      }}
                      onClick={() =>
                        window.open(`tel:${activeOrder.receiverPhone}`)
                      }
                    >
                      📞 Call
                    </button>
                  </div>
                </div>

                {/* Status update buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  {activeOrder.status === "ASSIGNED" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(activeOrder.id, "PICKED_UP")
                      }
                      style={{
                        background: "#15803d",
                        border: "none",
                        color: "#fff",
                        padding: "10px 20px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: "600",
                      }}
                    >
                      📍 Mark as Picked Up
                    </button>
                  )}
                  {activeOrder.status === "PICKED_UP" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(activeOrder.id, "IN_TRANSIT")
                      }
                      style={{
                        background: "#eab308",
                        border: "none",
                        color: "#14291d",
                        padding: "10px 20px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: "600",
                      }}
                    >
                      🏍️ Mark as In Transit
                    </button>
                  )}
                </div>

                {/* OTP Verification */}
                <div
                  style={{
                    background: "#FAFAF8",
                    border: "1px solid #e5e9e6",
                    borderRadius: "16px",
                    padding: "20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0f2e1c",
                      margin: "0 0 6px",
                    }}
                  >
                    🔐 Confirm Delivery with OTP
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#8a9a90",
                      margin: "0 0 14px",
                    }}
                  >
                    Ask the user for their OTP code to complete this delivery.
                  </p>

                  {otpVerified ? (
                    <div
                      style={{
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        borderRadius: "12px",
                        padding: "16px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontSize: "24px", marginBottom: "6px" }}>
                        🎉
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#16a34a",
                          margin: "0 0 4px",
                        }}
                      >
                        Delivery Confirmed!
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#8a9a90",
                          margin: 0,
                        }}
                      >
                        {activeOrder.deliveryFee} has been added to your
                        earnings.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value);
                          setOtpError("");
                        }}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        style={{
                          flex: 1,
                          padding: "11px 14px",
                          borderRadius: "10px",
                          background: "#ffffff",
                          border: `1px solid ${
                            otpError ? "#ef4444" : "#d8ded9"
                          }`,
                          color: "#14291d",
                          fontSize: "16px",
                          fontFamily: "'DM Sans', sans-serif",
                          outline: "none",
                          letterSpacing: "4px",
                          textAlign: "center",
                        }}
                      />
                      <button
                        onClick={() => handleConfirmDelivery(activeOrder.id)}
                        style={{
                          background: "#eab308",
                          border: "none",
                          color: "#14291d",
                          padding: "11px 20px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: "600",
                        }}
                      >
                        Verify
                      </button>
                    </div>
                  )}
                  {otpError && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#ef4444",
                        margin: "8px 0 0",
                      }}
                    >
                      {otpError}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* EARNINGS */}
        {activeNav === "earnings" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#0f2e1c",
                marginBottom: "6px",
              }}
            >
              Earnings
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#5c7768",
                marginBottom: "28px",
              }}
            >
              Track your income from deliveries.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              {[
                {
                  label: "Total Earned",
                  value: `GH₵ ${earnings.lifetimeEarnings || 0}`,
                  icon: "💰",
                },
                {
                  label: "This Week",
                  value: `GH₵ ${earnings.totalEarnings || 0}`,
                  icon: "📅",
                },
                {
                  label: "Today",
                  value: `GH₵ ${earnings.today || 0}`,
                  icon: "⚡",
                },
                {
                  label: "Deliveries",
                  value: earnings.totalDeliveries || 0,
                  icon: "📦",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#FAFAF8",
                    border: "1px solid #e5e9e6",
                    borderRadius: "16px",
                    padding: "20px",
                  }}
                >
                  <div style={{ fontSize: "22px", marginBottom: "10px" }}>
                    {s.icon}
                  </div>
                  <p
                    style={{
                      fontSize: "22px",
                      fontWeight: "700",
                      color: "#15803d",
                      margin: "0 0 2px",
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0f2e1c",
                      margin: "0 0 2px",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activeNav === "history" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#0f2e1c",
                marginBottom: "6px",
              }}
            >
              Delivery History
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#5c7768",
                marginBottom: "28px",
              }}
            >
              All your completed deliveries.
            </p>

            <div
              style={{
                background: "#FAFAF8",
                border: "1px solid #e5e9e6",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              {history.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#8a9a90",
                  }}
                >
                  No deliveries yet.
                </div>
              ) : (
                history.map((d, i) => {
                  const s =
                    d.status === "DELIVERED"
                      ? STATUS_STYLES.delivered
                      : STATUS_STYLES.cancelled;
                  return (
                    <div
                      key={i}
                      className="cgo-history-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "18px 24px",
                        borderBottom:
                          i < history.length - 1 ? "1px solid #eef1ee" : "none",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "rgba(21,128,61,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        📦
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#0f2e1c",
                            margin: "0 0 4px",
                          }}
                        >
                          {d.packageDescription || "Package"}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#5c7768",
                            margin: 0,
                          }}
                        >
                          {d.pickupLocation} → {d.dropOffLocation}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#8a9a90",
                            margin: 0,
                          }}
                        >
                          {d.deliveredAt
                            ? new Date(d.deliveredAt).toLocaleDateString()
                            : ""}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: s.color,
                            background: s.bg,
                            border: `1px solid ${s.border}`,
                            padding: "3px 10px",
                            borderRadius: "100px",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          {s.label}
                        </span>
                        {d.payout && (
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#15803d",
                              margin: 0,
                            }}
                          >
                            GH₵ {d.payout}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activeNav === "profile" && (
          <div
            style={{
              animation: "cgoFadeUp 0.5s ease forwards",
              maxWidth: "560px",
            }}
          >
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#0f2e1c",
                marginBottom: "6px",
              }}
            >
              My Profile
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#5c7768",
                marginBottom: "28px",
              }}
            >
              Manage your rider account.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "24px",
                background: "#FAFAF8",
                border: "1px solid #e5e9e6",
                borderRadius: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #15803d, #14532d)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                {user?.name?.charAt(0) || "R"}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#0f2e1c",
                    margin: "0 0 4px",
                  }}
                >
                  {user?.name || "Rider"}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#5c7768",
                    margin: "0 0 2px",
                  }}
                >
                  {user?.email || ""}
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#15803d",
                      fontWeight: "600",
                    }}
                  >
                    ⭐ {user?.rating || 5.0}
                  </span>
                  <span style={{ fontSize: "13px", color: "#8a9a90" }}>
                    · {user?.vehicleType || "Vehicle"}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#FAFAF8",
                border: "1px solid #e5e9e6",
                borderRadius: "20px",
                overflow: "hidden",
                marginBottom: "16px",
              }}
            >
              {[
                { label: "Name", value: user?.name || "—", icon: "👤" },
                { label: "Email", value: user?.email || "—", icon: "📧" },
                { label: "Phone", value: user?.phone || "—", icon: "📱" },
                {
                  label: "Vehicle",
                  value: user?.vehicleType || "—",
                  icon: "🏍️",
                },
                {
                  label: "Status",
                  value: isOnline ? "Online" : "Offline",
                  icon: "📡",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 24px",
                    borderBottom: i < 4 ? "1px solid #eef1ee" : "none",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#a8b5ae",
                        margin: "0 0 2px",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#0f2e1c",
                        margin: 0,
                        fontWeight: "500",
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={logout}
              style={{
                width: "100%",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                padding: "13px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
