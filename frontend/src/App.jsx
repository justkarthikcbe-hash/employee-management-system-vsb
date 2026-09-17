import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import EmployeeDashboard from './pages/EmployeeDashboard';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Payroll from './pages/Payroll';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminLeave from './pages/admin/AdminLeave';
import AdminPayroll from './pages/admin/AdminPayroll';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute roles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute roles={['employee']}><Profile /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute roles={['employee']}><Attendance /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute roles={['employee']}><Leave /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute roles={['employee']}><Payroll /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/employees" element={<ProtectedRoute roles={['admin']}><AdminEmployees /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute roles={['admin']}><AdminAttendance /></ProtectedRoute>} />
          <Route path="/admin/leave" element={<ProtectedRoute roles={['admin']}><AdminLeave /></ProtectedRoute>} />
          <Route path="/admin/payroll" element={<ProtectedRoute roles={['admin']}><AdminPayroll /></ProtectedRoute>} />

          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
