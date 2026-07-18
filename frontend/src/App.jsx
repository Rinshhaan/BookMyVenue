import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Customer pages
import HomePage from './pages/customer/HomePage'
import BrowsePage from './pages/customer/BrowsePage'
import VenueDetailPage from './pages/customer/VenueDetailPage'
import BookingPage from './pages/customer/BookingPage'
import MyBookingsPage from './pages/customer/MyBookingsPage'

// Owner pages
import OwnerDashboard from './pages/owner/OwnerDashboard'
import ListVenuePage from './pages/owner/ListVenuePage'
import MyVenuesPage from './pages/owner/MyVenuesPage'
import EarningsPage from './pages/owner/EarningsPage'
import EditVenuePage from './pages/owner/EditVenuePage'


// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageVenues from './pages/admin/ManageVenues'
import ManageUsers from './pages/admin/ManageUsers'
import ManagePayments from './pages/admin/ManagePayments'

// Common
import Navbar from './components/common/Navbar'


function App(){
  return(
    <BrowserRouter> 
      <Navbar />
      <Routes>
          {/* Public routes - anyone can visit */}
          <Route path="/" element={<HomePage/>}/>
          <Route path="/browse" element={<BrowsePage/>}/>
          <Route path="/venue/:id" element={<VenueDetailPage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/signup" element={<SignupPage/>}/>


         {/* Customer routes - must be logged in */}
         <Route path="/booking/:venueId" element={<BookingPage />} />
         <Route path="/my-bookings" element={<MyBookingsPage />} />

         {/* Owner routes */}
         <Route path="/owner/dashboard" element={<OwnerDashboard />} />
         <Route path="/owner/list-venue" element={<ListVenuePage />} />
         <Route path="/owner/my-venues" element={<MyVenuesPage />} />
         <Route path="/owner/earnings" element={<EarningsPage />} />
         <Route path="/owner/edit-venue/:id" element={<EditVenuePage />} />

         {/* Admin routes */}
         <Route path="/admin/dashboard" element={<AdminDashboard />} />
         <Route path="/admin/venues" element={<ManageVenues />} />
         <Route path="/admin/users" element={<ManageUsers />} />
         <Route path="/admin/payments" element={<ManagePayments />} />

         

      </Routes>  
    </BrowserRouter>
  )
}

export default App;