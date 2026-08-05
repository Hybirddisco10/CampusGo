// src/admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getAdminStats,
  getAllOrdersAdmin,
  getAllUsersAdmin,
  getAllRidersAdmin,
  updateRiderStatus,
  activateRider,
  updateUserStatusAdmin,
  getDisputes,
} from "../services/admin.service";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const TABS = [
  { id: "overview", label: "📊 Overview" },
  { id: "orders", label: "📦 Orders" },
  { id: "users", label: "👤 Users" },
  { id: "riders", label: "🏍️ Riders" },
  { id: "disputes", label: "⚠️ Disputes" },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [riders, setRiders] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [filters, setFilters] = useState({
    orderStatus: "",
    userRole: "",
    riderStatus: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch Overview Stats ──
  const fetchStats = useCallback(async () => {
    try {
      const response = await getAdminStats("week");
      if (response.success) setStats(response.data);
    } catch (error) {
      toast.error("Failed to load stats");
    }
  }, []);

  // ── Fetch Orders ──
  const fetchOrders = useCallback(async () => {
    try {
      const params = {};
      if (filters.orderStatus) params.status = filters.orderStatus;
      const response = await getAllOrdersAdmin(params);
      if (response.success) setOrders(response.data || []);
    } catch (error) {
      toast.error("Failed to load orders");
    }
  }, [filters.orderStatus]);

  // ── Fetch Users ──
  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (filters.userRole) params.role = filters.userRole;
      const response = await getAllUsersAdmin(params);
      if (response.success) setUsers(response.data || []);
    } catch (error) {
      toast.error("Failed to load users");
    }
  }, [filters.userRole]);

  // ── Fetch Riders ──
  const fetchRiders = useCallback(async () => {
    try {
      const params = {};
      if (filters.riderStatus) params.status = filters.riderStatus;
      const response = await getAllRidersAdmin(params);
      if (response.success) setRiders(response.data || []);
    } catch (error) {
      toast.error("Failed to load riders");
    }
  }, [filters.riderStatus]);

  // ── Fetch Disputes ──
  const fetchDisputes = useCallback(async () => {
    try {
      const response = await getDisputes();
      if (response.success) setDisputes(response.data || []);
    } catch (error) {
      toast.error("Failed to load disputes");
    }
  }, []);

  // ── Load data based on active tab ──
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === "overview") await fetchStats();
      else if (activeTab === "orders") await fetchOrders();
      else if (activeTab === "users") await fetchUsers();
      else if (activeTab === "riders") await fetchRiders();
      else if (activeTab === "disputes") await fetchDisputes();
      setLoading(false);
    };
    loadData();
  }, [
    activeTab,
    fetchStats,
    fetchOrders,
    fetchUsers,
    fetchRiders,
    fetchDisputes,
  ]);

  // ── Handle Rider Status Change (Approve/Reject) ──
  const handleRiderStatusChange = async (riderId, status) => {
    if (
      !window.confirm(
        `Are you sure you want to ${status.toLowerCase()} this rider?`
      )
    )
      return;
    setIsSubmitting(true);
    try {
      const response = await updateRiderStatus(riderId, status);
      if (response.success) {
        toast.success(`Rider ${status.toLowerCase()} successfully`);
        fetchRiders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update rider");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Rider Activation/Suspension ──
  const handleRiderActivation = async (riderId, isActive) => {
    const action = isActive ? "activate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${action} this rider?`))
      return;
    setIsSubmitting(true);
    try {
      const response = await activateRider(riderId, isActive);
      if (response.success) {
        toast.success(`Rider ${action}d successfully`);
        fetchRiders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} rider`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle User Activation/Suspension ──
  const handleUserActivation = async (userId, isActive) => {
    const action = isActive ? "activate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${action} this user?`))
      return;
    setIsSubmitting(true);
    try {
      const response = await updateUserStatusAdmin(userId, isActive);
      if (response.success) {
        toast.success(`User ${action}d successfully`);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render Loading ──
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
        fontFamily: "'DM Sans', sans-serif",
        background: "#ffffff",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#14532d",
          color: "#fff",
          padding: "20px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
            Admin Dashboard
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              margin: "4px 0 0",
            }}
          >
            Welcome, {user?.name || "Admin"}
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            marginRight: "85px",
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Tabs */}
      <div
        style={{
          padding: "0 36px",
          borderBottom: "1px solid #e5e9e6",
          display: "flex",
          gap: "8px",
          background: "#FAFAF8",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "14px 20px",
              background: activeTab === tab.id ? "#ffffff" : "transparent",
              border: "none",
              borderBottom:
                activeTab === tab.id
                  ? "3px solid #eab308"
                  : "3px solid transparent",
              color: activeTab === tab.id ? "#0f2e1c" : "#5c7768",
              fontWeight: activeTab === tab.id ? "600" : "400",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={{ padding: "32px 36px" }}>
        {activeTab === "overview" && stats && (
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#0f2e1c",
                marginBottom: "20px",
              }}
            >
              Platform Overview
            </h2>
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
                  label: "Total Users",
                  value: stats.summary?.totalUsers || 0,
                  icon: "👤",
                },
                {
                  label: "Total Riders",
                  value: stats.summary?.totalRiders || 0,
                  icon: "🏍️",
                },
                {
                  label: "Pending Riders",
                  value: stats.summary?.pendingRiders || 0,
                  icon: "⏳",
                },
                {
                  label: "Total Orders",
                  value: stats.summary?.totalOrders || 0,
                  icon: "📦",
                },
                {
                  label: "Pending Orders",
                  value: stats.summary?.pendingOrders || 0,
                  icon: "⏳",
                },
                {
                  label: "Delivered",
                  value: stats.summary?.deliveredOrders || 0,
                  icon: "✅",
                },
                {
                  label: "Revenue",
                  value: `GH₵ ${stats.summary?.totalRevenue || 0}`,
                  icon: "💰",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#FAFAF8",
                    border: "1px solid #e5e9e6",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>
                    {s.icon}
                  </div>
                  <p
                    style={{
                      fontSize: "20px",
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
            {stats.topRiders && stats.topRiders.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#0f2e1c",
                    marginBottom: "12px",
                  }}
                >
                  🏆 Top Riders
                </h3>
                <div
                  style={{
                    background: "#FAFAF8",
                    border: "1px solid #e5e9e6",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  {stats.topRiders.map((rider, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 20px",
                        borderBottom:
                          i < stats.topRiders.length - 1
                            ? "1px solid #eef1ee"
                            : "none",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        {rider.courier_name}
                      </span>
                      <span style={{ color: "#15803d" }}>
                        {rider.total_deliveries} deliveries · GH₵{" "}
                        {rider.earnings}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#0f2e1c",
                  margin: 0,
                }}
              >
                All Orders
              </h2>
              <select
                value={filters.orderStatus}
                onChange={(e) =>
                  setFilters({ ...filters, orderStatus: e.target.value })
                }
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d8ded9",
                  background: "#fff",
                  fontSize: "14px",
                }}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="DISPUTED">Disputed</option>
              </select>
            </div>
            <div
              style={{
                background: "#FAFAF8",
                border: "1px solid #e5e9e6",
                borderRadius: "12px",
                overflow: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead style={{ background: "#eef1ee" }}>
                  <tr>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Order ID
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Sender
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Fee
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.request_id}
                      style={{ borderBottom: "1px solid #eef1ee" }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        {order.request_id}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {order.Sender?.name || "N/A"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>{order.status}</td>
                      <td style={{ padding: "12px 16px" }}>
                        GH₵ {order.delivery_fee}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#8a9a90",
                  }}
                >
                  No orders found.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#0f2e1c",
                  margin: 0,
                }}
              >
                All Users
              </h2>
              <select
                value={filters.userRole}
                onChange={(e) =>
                  setFilters({ ...filters, userRole: e.target.value })
                }
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d8ded9",
                  background: "#fff",
                  fontSize: "14px",
                }}
              >
                <option value="">All Roles</option>
                <option value="Sender">Sender</option>
                <option value="Receiver">Receiver</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div
              style={{
                background: "#FAFAF8",
                border: "1px solid #e5e9e6",
                borderRadius: "12px",
                overflow: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead style={{ background: "#eef1ee" }}>
                  <tr>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      User
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Email
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Role
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.user_id}
                      style={{ borderBottom: "1px solid #eef1ee" }}
                    >
                      <td style={{ padding: "12px 16px" }}>{user.name}</td>
                      <td style={{ padding: "12px 16px" }}>{user.email}</td>
                      <td style={{ padding: "12px 16px" }}>{user.role}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {user.is_active ? "Active" : "Suspended"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={() =>
                            handleUserActivation(user.user_id, !user.is_active)
                          }
                          disabled={isSubmitting}
                          style={{
                            background: user.is_active
                              ? "rgba(239,68,68,0.1)"
                              : "rgba(34,197,94,0.1)",
                            border: `1px solid ${
                              user.is_active
                                ? "rgba(239,68,68,0.2)"
                                : "rgba(34,197,94,0.2)"
                            }`,
                            color: user.is_active ? "#ef4444" : "#16a34a",
                            padding: "4px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          {user.is_active ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#8a9a90",
                  }}
                >
                  No users found.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "riders" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#0f2e1c",
                  margin: 0,
                }}
              >
                Riders
              </h2>
              <select
                value={filters.riderStatus}
                onChange={(e) =>
                  setFilters({ ...filters, riderStatus: e.target.value })
                }
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d8ded9",
                  background: "#fff",
                  fontSize: "14px",
                }}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div
              style={{
                background: "#FAFAF8",
                border: "1px solid #e5e9e6",
                borderRadius: "12px",
                overflow: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead style={{ background: "#eef1ee" }}>
                  <tr>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Name
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Email
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Vehicle
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Application
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {riders.map((rider) => (
                    <tr
                      key={rider.courier_id}
                      style={{ borderBottom: "1px solid #eef1ee" }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        {rider.courier_name}
                      </td>
                      <td style={{ padding: "12px 16px" }}>{rider.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {rider.vehicle_type}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {rider.application_status}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {rider.is_active ? "Active" : "Inactive"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {rider.application_status === "PENDING" && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              onClick={() =>
                                handleRiderStatusChange(
                                  rider.courier_id,
                                  "APPROVED"
                                )
                              }
                              disabled={isSubmitting}
                              style={{
                                background: "rgba(34,197,94,0.1)",
                                border: "1px solid rgba(34,197,94,0.2)",
                                color: "#16a34a",
                                padding: "4px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleRiderStatusChange(
                                  rider.courier_id,
                                  "REJECTED"
                                )
                              }
                              disabled={isSubmitting}
                              style={{
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.2)",
                                color: "#ef4444",
                                padding: "4px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {rider.application_status === "APPROVED" && (
                          <button
                            onClick={() =>
                              handleRiderActivation(
                                rider.courier_id,
                                !rider.is_active
                              )
                            }
                            disabled={isSubmitting}
                            style={{
                              background: rider.is_active
                                ? "rgba(239,68,68,0.1)"
                                : "rgba(34,197,94,0.1)",
                              border: `1px solid ${
                                rider.is_active
                                  ? "rgba(239,68,68,0.2)"
                                  : "rgba(34,197,94,0.2)"
                              }`,
                              color: rider.is_active ? "#ef4444" : "#16a34a",
                              padding: "4px 12px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            {rider.is_active ? "Suspend" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {riders.length === 0 && (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#8a9a90",
                  }}
                >
                  No riders found.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "disputes" && (
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#0f2e1c",
                marginBottom: "20px",
              }}
            >
              Disputes
            </h2>
            <div
              style={{
                background: "#FAFAF8",
                border: "1px solid #e5e9e6",
                borderRadius: "12px",
                overflow: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead style={{ background: "#eef1ee" }}>
                  <tr>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Order ID
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Reason
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Disputed At
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((dispute) => (
                    <tr
                      key={dispute.request_id}
                      style={{ borderBottom: "1px solid #eef1ee" }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        {dispute.request_id}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {dispute.dispute_reason || "No reason"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {dispute.disputed_at
                          ? new Date(dispute.disputed_at).toLocaleString()
                          : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>{dispute.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {disputes.length === 0 && (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#8a9a90",
                  }}
                >
                  No disputes.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
