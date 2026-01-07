// src/App.jsx – YANGILANGAN VARIANT (BrowserRouter o‘chirildi)
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // BrowserRouter import o‘chirildi
import { ChakraProvider } from '@chakra-ui/react';

// Pages
import AdminLogin from './pages/AdminLogin';

// Layout
import AdminLayout from './components/layout/AdminLayout';

// Admin sahifalar
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from "./pages/admin/Users";
import AdminJobs from './pages/admin/Jobs';
import AdminDisputes from "./pages/admin/Disputes";
import DisputeDetail from "./pages/admin/DisputeDetail";
import AdminPayments from "./pages/admin/Payments";
import PaymentDetail from './pages/admin/PaymentDetail';
import AdminSettings from './pages/admin/Settings';
import AdminChats from './pages/admin/Chats';
import ChatDetail from './pages/admin/ChatDetail';
import JobDetail from './pages/admin/JobDetail';
import UserDetail from './pages/admin/UserDetail';

function App() {
  return (
    <ChakraProvider>
      <Routes>
        {/* Admin login sahifasi – himoyasiz */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin panel – himoyalangan */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="jobs" element={<AdminJobs />} /> 
          <Route path="jobs/:jobId" element={<JobDetail />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="disputes/:disputeId" element={<DisputeDetail />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="payments/:paymentId" element={<PaymentDetail />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="chats" element={<AdminChats />} />
          <Route path="chats/:chatId" element={<ChatDetail />} />
        </Route>

        {/* Default – login ga yo‘naltirish */}
        <Route path="*" element={<AdminLogin />} />
      </Routes>
    </ChakraProvider>
  );
}

export default App;