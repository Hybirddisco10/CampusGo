import { useState } from 'react'
import Navbar from './main layout/navbar'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './main layout/index'
import SignUp from './registration/signup'
import SignIn from './registration/signin'
import ForgotPassword from './registration/forgotPassword'
import UserDashboard from './main layout/userDashboard'
import RiderDashboard from './main layout/riderDashboard'
import HamburgerNavbar from './main layout/navbar'
import AboutPage from './main layout/about'
import ContactPage from './main layout/contact'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/user-dashboard" element={<UserDashboard />} /> 
        <Route path="/rider-dashboard" element={<RiderDashboard />} /> 
        <Route path="/signup" element={<SignUp />} />  
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </>
  )
}

export default App;
