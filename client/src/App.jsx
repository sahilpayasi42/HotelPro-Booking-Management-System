import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// ─── Public Pages ─────────────────────────────────────────
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomList from './pages/guest/RoomList';
import RoomDetails from './pages/guest/RoomDetails';

// ─── Guest Pages ──────────────────────────────────────────
import GuestDashboard from './pages/guest/GuestDashboard';
import BookingForm from './pages/guest/BookingForm';
import BookingHistory from './pages/guest/BookingHistory';
import PaymentPage from './pages/guest/PaymentPage';
import ReviewForm from './pages/guest/ReviewForm';
import Profile from './pages/guest/Profile';
import Notifications from './pages/guest/Notifications';

// ─── Staff Pages ──────────────────────────────────────────
import StaffDashboard from './pages/staff/StaffDashboard';
import CheckInOut from './pages/staff/CheckInOut';
import RoomStatus from './pages/staff/RoomStatus';
import ServiceRequests from './pages/staff/ServiceRequests';

// ─── Admin Pages ──────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import RoomManagement from './pages/admin/RoomManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import UserManagement from './pages/admin/UserManagement';
import StaffManagement from './pages/admin/StaffManagement';
import BookingManagement from './pages/admin/BookingManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import Reports from './pages/admin/Reports';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* ── Public routes ─────────────────────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rooms" element={<RoomList />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />

        {/* ── Guest routes ─────────────────────────────── */}
        <Route
          path="/guest/*"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['guest']}>
                <Routes>
                  <Route path="dashboard" element={<GuestDashboard />} />
                  <Route path="book/:roomId" element={<BookingForm />} />
                  <Route path="bookings" element={<BookingHistory />} />
                  <Route path="payment/:bookingId" element={<PaymentPage />} />
                  <Route path="review/:bookingId" element={<ReviewForm />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="notifications" element={<Notifications />} />
                </Routes>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ── Staff routes ─────────────────────────────── */}
        <Route
          path="/staff/*"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['staff', 'admin']}>
                <Routes>
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="checkinout" element={<CheckInOut />} />
                  <Route path="rooms" element={<RoomStatus />} />
                  <Route path="services" element={<ServiceRequests />} />
                </Routes>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ── Admin routes ─────────────────────────────── */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['admin']}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="rooms" element={<RoomManagement />} />
                  <Route path="categories" element={<CategoryManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="staff" element={<StaffManagement />} />
                  <Route path="bookings" element={<BookingManagement />} />
                  <Route path="payments" element={<PaymentManagement />} />
                  <Route path="reports" element={<Reports />} />
                </Routes>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ── 404 ──────────────────────────────────────── */}
        <Route
          path="*"
          element={
            <div className="container py-5 text-center">
              <h2>404 — Page Not Found</h2>
              <p className="text-muted">The page you're looking for doesn't exist.</p>
            </div>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
