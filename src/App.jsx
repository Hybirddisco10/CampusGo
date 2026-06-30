import { useState } from 'react'
import Navbar from './main layout/navbar'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './main layout/landingPage'
import SignUp from './registration/signup'
import SignIn from './registration/signin'
import ForgotPassword from './registration/forgotPassword'
import UserDashboard from './main layout/userDashboard'
import RiderDashboard from './main layout/riderDashboard'
import HamburgerNavbar from './main layout/navbar'

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
      </Routes>
    </>
  )
}

export default App;
