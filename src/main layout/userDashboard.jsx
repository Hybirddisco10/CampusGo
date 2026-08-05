// src/main layout/userDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import {
  getOrders,
  createOrder,
  cancelOrder,
  rateOrder,
} from "../services/order.service";
import { initializePayment } from "../services/payment.service";
import { getProfile } from "../services/user.service";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

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
  .cgo-notif:hover { background: rgba(21,128,61,0.05) !important; }
`;
if (!document.head.querySelector("[data-cgo-dash]")) {
  document.head.appendChild(styleEl);
}

const STATUS_STYLES = {
  DELIVERED: {
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
    color: "#16a34a",
    label: "Delivered",
  },
  PENDING: {
    bg: "rgba(234,179,8,0.12)",
    border: "rgba(234,179,8,0.3)",
    color: "#a16207",
    label: "Pending",
  },
  ASSIGNED: {
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    color: "#2563eb",
    label: "Assigned",
  },
  PICKED_UP: {
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.25)",
    color: "#7c3aed",
    label: "Picked Up",
  },
  IN_TRANSIT: {
    bg: "rgba(234,179,8,0.12)",
    border: "rgba(234,179,8,0.3)",
    color: "#a16207",
    label: "In Transit",
  },
  CANCELLED: {
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.2)",
    color: "#ef4444",
    label: "Cancelled",
  },
  PENDING_PAYMENT: {
    bg: "rgba(234,179,8,0.08)",
    border: "rgba(234,179,8,0.2)",
    color: "#a16207",
    label: "Awaiting Payment",
  },
  DISPUTED: {
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.2)",
    color: "#ef4444",
    label: "Disputed",
  },
};

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "📦", label: "Request Delivery", id: "request" },
  { icon: "📍", label: "Track Delivery", id: "track" },
  { icon: "🕒", label: "History", id: "history" },
  { icon: "👤", label: "Profile", id: "profile" },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { isConnected, joinOrder, leaveOrder, on, off } = useSocket();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [activeOrder, setActiveOrder] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Request form state
  const [requestForm, setRequestForm] = useState({
    pickupLocation: { label: "", address: "" },
    dropoffLocation: { hostel: "", address: "" },
    packageDescription: "",
    notes: "",
    receiverEmail: "",
  });

  // ── FETCH ORDERS ──
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getOrders({ limit: 50 });
      if (response.success) {
        const orderList = response.data || [];
        setOrders(orderList);
        // Calculate stats
        const total = orderList.length;
        const delivered = orderList.filter(
          (o) => o.status === "DELIVERED"
        ).length;
        const pending = orderList.filter((o) =>
          ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(o.status)
        ).length;
        const cancelled = orderList.filter(
          (o) => o.status === "CANCELLED"
        ).length;
        setStats({ total, pending, delivered, cancelled });

        // Find active order
        const active = orderList.find((o) =>
          ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(o.status)
        );
        setActiveOrder(active || null);
        if (active) {
          joinOrder(active.request_id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [joinOrder]);

  // ── WEBSOCKET LISTENERS ──
  useEffect(() => {
    if (!isConnected) return;

    const handleLocationUpdate = (data) => {
      if (data.orderId === activeOrder?.request_id) {
        setRiderLocation(data);
      }
    };

    const handleStatusChange = (data) => {
      toast.info(`Order #${data.orderId} status: ${data.status}`);
      fetchOrders(); // Refresh orders
    };

    on("rider-location-update", handleLocationUpdate);
    on("order-status-changed", handleStatusChange);

    return () => {
      off("rider-location-update", handleLocationUpdate);
      off("order-status-changed", handleStatusChange);
    };
  }, [isConnected, activeOrder, on, off, fetchOrders]);

  // ── INITIAL LOAD ──
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── CREATE ORDER ──
  const handleCreateOrder = async () => {
    const {
      pickupLocation,
      dropoffLocation,
      packageDescription,
      notes,
      receiverEmail,
    } = requestForm;

    if (!pickupLocation.address || !dropoffLocation.address || !receiverEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createOrder({
        pickupLocation: {
          label: pickupLocation.label || pickupLocation.address,
          address: pickupLocation.address,
        },
        dropoffLocation: {
          hostel: dropoffLocation.hostel || dropoffLocation.address,
          address: dropoffLocation.address,
        },
        packageDescription: packageDescription || "Package delivery",
        notes: notes || "",
        receiverEmail,
      });

      if (response.success) {
        const orderId = response.data.id;
        toast.success(`Order #${orderId} created! Redirecting to payment...`);
        setShowRequestModal(false);
        setRequestForm({
          pickupLocation: { label: "", address: "" },
          dropoffLocation: { hostel: "", address: "" },
          packageDescription: "",
          notes: "",
          receiverEmail: "",
        });

        // Initialize payment
        const payment = await initializePayment({
          orderId,
          email: user?.email,
        });

        if (payment.success) {
          window.location.href = payment.data.authorizationUrl;
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── CANCEL ORDER ──
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const response = await cancelOrder(orderId, "Cancelled by user");
      if (response.success) {
        toast.success("Order cancelled");
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  // ── RATE ORDER ──
  const handleRateOrder = async (orderId, rating, comment = "") => {
    try {
      const response = await rateOrder(orderId, {
        riderRating: rating,
        comment,
      });
      if (response.success) {
        toast.success("Thank you for your feedback!");
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to rate order");
    }
  };

  // ── INPUT STYLE ──
  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    background: "#ffffff",
    border: "1px solid #d8ded9",
    color: "#14291d",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  // ── RENDER ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "#ffffff",
        color: "#14291d",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* ── SIDEBAR ── */}
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
                fontFamily: "'Poppins', sans-serif",
                fontWeight: activeNav === item.id ? "600" : "400",
                transition: "all 0.2s",
                textAlign: "left",
                marginBottom: "2px",
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
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
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0) || "U"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f2e1c",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name || "User"}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#8a9a90",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.email || ""}
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
                padding: "4px",
              }}
              title="Sign Out"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 36px",
          maxWidth: "100%",
        }}
      >
        {/* ── DASHBOARD ── */}
        {activeNav === "dashboard" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <div style={{ marginBottom: "32px" }}>
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
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Hello,{" "}
                <span style={{ color: "#15803d" }}>
                  {user?.name || "User"}!
                </span>
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: "#5c7768",
                  margin: 0,
                  fontWeight: "300",
                }}
              >
                What do you need delivered today?
              </p>
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              {[
                { label: "Total Orders", value: stats.total, icon: "📦" },
                { label: "Pending", value: stats.pending, icon: "⏳" },
                { label: "Delivered", value: stats.delivered, icon: "✅" },
                { label: "Cancelled", value: stats.cancelled, icon: "❌" },
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

            {/* Quick actions */}
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#0f2e1c",
                  marginBottom: "16px",
                }}
              >
                Quick Actions
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "14px",
                }}
              >
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="cgo-action-card"
                  style={{
                    background: "rgba(234,179,8,0.1)",
                    border: "1px solid rgba(234,179,8,0.35)",
                    borderRadius: "16px",
                    padding: "20px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.25s",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                    📦
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#a16207",
                      margin: "0 0 4px",
                    }}
                  >
                    Request a Delivery
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#8a9a90",
                      margin: 0,
                      fontWeight: "300",
                    }}
                  >
                    Send something across campus
                  </p>
                </button>
                <button
                  onClick={() => setActiveNav("track")}
                  className="cgo-action-card"
                  style={{
                    background: "#FAFAF8",
                    border: "1px solid #e5e9e6",
                    borderRadius: "16px",
                    padding: "20px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.25s",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                    📍
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#0f2e1c",
                      margin: "0 0 4px",
                    }}
                  >
                    Track My Delivery
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#8a9a90",
                      margin: 0,
                      fontWeight: "300",
                    }}
                  >
                    See where your rider is
                  </p>
                </button>
                <button
                  onClick={() => setActiveNav("history")}
                  className="cgo-action-card"
                  style={{
                    background: "#FAFAF8",
                    border: "1px solid #e5e9e6",
                    borderRadius: "16px",
                    padding: "20px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.25s",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                    🕒
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#0f2e1c",
                      margin: "0 0 4px",
                    }}
                  >
                    View History
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#8a9a90",
                      margin: 0,
                      fontWeight: "300",
                    }}
                  >
                    See past deliveries
                  </p>
                </button>
              </div>
            </div>

            {/* Recent orders */}
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
                  Recent Deliveries
                </h2>
                <button
                  onClick={() => setActiveNav("history")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#15803d",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
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
                {orders.slice(0, 3).map((order) => {
                  const s =
                    STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
                  return (
                    <div
                      key={order.request_id}
                      className="cgo-delivery-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "16px 20px",
                        borderBottom: "1px solid #eef1ee",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "rgba(21,128,61,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      >
                        📦
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#0f2e1c",
                            margin: "0 0 2px",
                          }}
                        >
                          {order.package_description || "Package"}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#8a9a90",
                            margin: 0,
                          }}
                        >
                          {order.pickup_location} → {order.drop_off_location}
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
                        <span style={{ fontSize: "11px", color: "#a8b5ae" }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {orders.length === 0 && (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#8a9a90",
                    }}
                  >
                    <p style={{ fontSize: "14px" }}>
                      No deliveries yet. Request your first one!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── REQUEST DELIVERY ── */}
        {activeNav === "request" && (
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
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Request a Delivery
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#5c7768",
                marginBottom: "32px",
                fontWeight: "300",
              }}
            >
              Fill in the details and a rider will be assigned to you.
            </p>

            <div
              style={{
                background: "#FAFAF8",
                border: "1px solid #e5e9e6",
                borderRadius: "20px",
                padding: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#33513f",
                      marginBottom: "8px",
                      fontWeight: "500",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Pickup Location *
                  </label>
                  <input
                    value={requestForm.pickupLocation.address}
                    onChange={(e) =>
                      setRequestForm({
                        ...requestForm,
                        pickupLocation: {
                          ...requestForm.pickupLocation,
                          address: e.target.value,
                          label: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Unity Hall, Room 214"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#33513f",
                      marginBottom: "8px",
                      fontWeight: "500",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Dropoff Location *
                  </label>
                  <input
                    value={requestForm.dropoffLocation.address}
                    onChange={(e) =>
                      setRequestForm({
                        ...requestForm,
                        dropoffLocation: {
                          ...requestForm.dropoffLocation,
                          address: e.target.value,
                          hostel: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Main Library, Study Room B"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#33513f",
                      marginBottom: "8px",
                      fontWeight: "500",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Package Description
                  </label>
                  <input
                    value={requestForm.packageDescription}
                    onChange={(e) =>
                      setRequestForm({
                        ...requestForm,
                        packageDescription: e.target.value,
                      })
                    }
                    placeholder="e.g. A blue bag with two books inside"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#33513f",
                      marginBottom: "8px",
                      fontWeight: "500",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Receiver Email *
                  </label>
                  <input
                    value={requestForm.receiverEmail}
                    onChange={(e) =>
                      setRequestForm({
                        ...requestForm,
                        receiverEmail: e.target.value,
                      })
                    }
                    placeholder="e.g. receiver@example.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#33513f",
                      marginBottom: "8px",
                      fontWeight: "500",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Note for Rider
                  </label>
                  <input
                    value={requestForm.notes}
                    onChange={(e) =>
                      setRequestForm({ ...requestForm, notes: e.target.value })
                    }
                    placeholder="e.g. Please handle with care"
                    style={inputStyle}
                  />
                </div>

                <button
                  onClick={handleCreateOrder}
                  disabled={isSubmitting}
                  className="cgo-btn-primary"
                  style={{
                    background: "#eab308",
                    border: "none",
                    color: "#14291d",
                    padding: "14px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                    boxShadow: "0 6px 20px rgba(234,179,8,0.3)",
                    transition: "all 0.25s",
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? "Creating..." : "Send Delivery Request →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TRACK DELIVERY ── */}
        {activeNav === "track" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#0f2e1c",
                marginBottom: "6px",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Track Your Delivery
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#5c7768",
                marginBottom: "28px",
                fontWeight: "300",
              }}
            >
              {activeOrder
                ? `Following order #${activeOrder.request_id}`
                : "No active delivery to track."}
            </p>

            {activeOrder ? (
              <>
                <div
                  style={{
                    background: "rgba(21,128,61,0.05)",
                    border: "1px solid rgba(21,128,61,0.18)",
                    borderRadius: "20px",
                    padding: "24px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#8a9a90",
                          margin: "0 0 4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                        }}
                      >
                        Active Delivery
                      </p>
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#0f2e1c",
                          margin: 0,
                        }}
                      >
                        📦 {activeOrder.package_description || "Package"}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#a16207",
                        background: "rgba(234,179,8,0.12)",
                        border: "1px solid rgba(234,179,8,0.3)",
                        padding: "5px 12px",
                        borderRadius: "100px",
                      }}
                    >
                      {activeOrder.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginBottom: "20px",
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
                        {activeOrder.pickup_location || "Pickup"}
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
                        {activeOrder.drop_off_location || "Dropoff"}
                      </p>
                    </div>
                  </div>

                  {/* Rider Location */}
                  {riderLocation && (
                    <div
                      style={{
                        background: "#ffffff",
                        borderRadius: "12px",
                        padding: "14px",
                        marginBottom: "16px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#8a9a90",
                          margin: "0 0 4px",
                        }}
                      >
                        📍 Rider Location
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#0f2e1c",
                          margin: 0,
                        }}
                      >
                        Lat: {riderLocation.lat?.toFixed(6)}, Lng:{" "}
                        {riderLocation.lng?.toFixed(6)}
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#a8b5ae",
                            marginLeft: "12px",
                          }}
                        >
                          Updated:{" "}
                          {new Date(
                            riderLocation.timestamp
                          ).toLocaleTimeString()}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Cancel button */}
                  {["PENDING", "ASSIGNED"].includes(activeOrder.status) && (
                    <button
                      onClick={() => handleCancelOrder(activeOrder.request_id)}
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        color: "#ef4444",
                        padding: "10px 20px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontFamily: "'Poppins', sans-serif",
                        width: "100%",
                      }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                {/* WebSocket status */}
                <div
                  style={{
                    background: "#FAFAF8",
                    border: "1px solid #e5e9e6",
                    borderRadius: "12px",
                    padding: "12px 16px",
                  }}
                >
                  <p style={{ fontSize: "12px", color: "#8a9a90", margin: 0 }}>
                    {isConnected
                      ? "🟢 Live updates connected"
                      : "🔴 Reconnecting..."}
                  </p>
                </div>
              </>
            ) : (
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
                <p style={{ fontSize: "16px", color: "#8a9a90", margin: 0 }}>
                  No active deliveries right now.
                </p>
                <button
                  onClick={() => setActiveNav("request")}
                  style={{
                    marginTop: "16px",
                    background: "#eab308",
                    border: "none",
                    color: "#14291d",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "600",
                  }}
                >
                  Request a Delivery
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeNav === "history" && (
          <div style={{ animation: "cgoFadeUp 0.5s ease forwards" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#0f2e1c",
                marginBottom: "6px",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Delivery History
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#5c7768",
                marginBottom: "28px",
                fontWeight: "300",
              }}
            >
              All your past deliveries in one place.
            </p>

            <div
              style={{
                background: "#FAFAF8",
                border: "1px solid #e5e9e6",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              {orders.length === 0 ? (
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
                orders.map((order) => {
                  const s =
                    STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
                  return (
                    <div
                      key={order.request_id}
                      className="cgo-delivery-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "18px 24px",
                        borderBottom: "1px solid #eef1ee",
                        transition: "background 0.2s",
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
                          flexShrink: 0,
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
                          {order.package_description || "Package"}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#5c7768",
                            margin: "0 0 2px",
                          }}
                        >
                          {order.pickup_location} → {order.drop_off_location}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#8a9a90",
                            margin: 0,
                          }}
                        >
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
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
                            marginBottom: "6px",
                          }}
                        >
                          {s.label}
                        </span>
                        {order.delivery_fee && (
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#15803d",
                              margin: 0,
                            }}
                          >
                            GH₵ {order.delivery_fee}
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

        {/* ── PROFILE ── */}
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
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              My Profile
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#5c7768",
                marginBottom: "28px",
                fontWeight: "300",
              }}
            >
              Manage your account details.
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
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#0f2e1c",
                    margin: "0 0 4px",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {user?.name || "User"}
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
                <p style={{ fontSize: "13px", color: "#8a9a90", margin: 0 }}>
                  Role: {user?.role || "Customer"}
                </p>
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
                { label: "Role", value: user?.role || "Customer", icon: "🎯" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 24px",
                    borderBottom: i < 3 ? "1px solid #eef1ee" : "none",
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
                        letterSpacing: "0.5px",
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
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        )}
      </main>

      {/* ── REQUEST MODAL ── */}
      {showRequestModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,41,29,0.5)",
            backdropFilter: "blur(6px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e9e6",
              borderRadius: "24px",
              padding: "32px",
              width: "100%",
              maxWidth: "480px",
              animation: "cgoFadeUp 0.3s ease forwards",
              boxShadow: "0 24px 60px rgba(20,41,29,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#0f2e1c",
                  margin: 0,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Request a Delivery
              </h2>
              <button
                onClick={() => setShowRequestModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#8a9a90",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#33513f",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  Pickup Location *
                </label>
                <input
                  value={requestForm.pickupLocation.address}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      pickupLocation: {
                        ...requestForm.pickupLocation,
                        address: e.target.value,
                        label: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Unity Hall, Room 214"
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#33513f",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  Dropoff Location *
                </label>
                <input
                  value={requestForm.dropoffLocation.address}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      dropoffLocation: {
                        ...requestForm.dropoffLocation,
                        address: e.target.value,
                        hostel: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Main Library, Study B"
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#33513f",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  Receiver Email *
                </label>
                <input
                  value={requestForm.receiverEmail}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      receiverEmail: e.target.value,
                    })
                  }
                  placeholder="e.g. receiver@example.com"
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#33513f",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  Note for Rider
                </label>
                <input
                  value={requestForm.notes}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, notes: e.target.value })
                  }
                  placeholder="e.g. Handle with care"
                  style={inputStyle}
                />
              </div>
              <button
                onClick={handleCreateOrder}
                disabled={isSubmitting}
                style={{
                  background: "#eab308",
                  border: "none",
                  color: "#14291d",
                  padding: "13px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif",
                  marginTop: "6px",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {isSubmitting ? "Creating..." : "Send Request →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
