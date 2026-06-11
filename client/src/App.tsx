import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import Home from '@/pages/Home/Home';
import Search from '@/pages/Search/Search';
import VehicleDetails from '@/pages/VehicleDetails/VehicleDetails';
import Profile from '@/pages/Profile/Profile';
import Business from '@/pages/Business/Business';
import RenterDashboard from '@/pages/RenterDashboard/RenterDashboard';
import OwnerDashboard from '@/pages/OwnerDashboard/OwnerDashboard';
import Payments from '@/pages/Payments/Payments';
import Settings from '@/pages/Settings/Settings';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import VehicleListing from '@/pages/VehicleListing/VehicleListing';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import AIAssistant from '@/pages/AIAssistant/AIAssistant';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AdminRoute from '@/routes/AdminRoute';

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/business/:id" element={<Business />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<RenterDashboard />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/list-vehicle" element={<VehicleListing />} />
            <Route path="/vehicles/:id/edit" element={<VehicleListing />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/vehicles" element={<AdminDashboard />} />
            <Route path="/admin/businesses" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
