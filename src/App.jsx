// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          {/* Admin login sahifasi – himoyasiz */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin panel – himoyalangan (keyin middleware qo‘shamiz) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} /> 
            <Route path="disputes" element={<AdminDisputes />} />
          </Route>

          {/* Default – login ga yo‘naltirish */}
          <Route path="*" element={<AdminLogin />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;