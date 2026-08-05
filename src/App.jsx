// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./main layout/navbar";
import LandingPage from "./main layout/index";
import SignUp from "./registration/signup";
import SignIn from "./registration/signin";
import ForgotPassword from "./registration/forgotPassword";
import UserDashboard from "./main layout/userDashboard";
import RiderDashboard from "./main layout/riderDashboard";
import SignOut from "./main layout/signout";
import AboutPage from "./main layout/about";
import ContactPage from "./main layout/contact";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentCallback from "./components/PaymentCallback";
import AdminDashboard from "./admin/AdminDashboard"; // ✅ NEW

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signout" element={<SignOut />} />
        <Route path="/payment/verify" element={<PaymentCallback />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/rider-dashboard" element={<RiderDashboard />} />
        </Route>

        {/* Admin route - role-based */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
