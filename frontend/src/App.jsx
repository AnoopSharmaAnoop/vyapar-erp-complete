import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';  // ← Add this import
import CompanySelection from './pages/CompanySelection';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Ledgers from './pages/Ledgers';
import Vouchers from './pages/Vouchers';
import UserManagement from './pages/UserManagement';
import TrialBalance from './pages/TrialBalance';
import ProfitLoss from './pages/ProfitLoss';
import BalanceSheet from './pages/BalanceSheet';
import './App.css';
import OpeningBalance from './pages/OpeningBalance';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />  {/* ← Add this route */}
          <Route path="/" element={<CompanySelection />} />
          
          {/* Protected routes */}

<Route path="/opening-balance" element={<OpeningBalance />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <Items />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledgers"
            element={
              <ProtectedRoute>
                <Ledgers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vouchers"
            element={
              <ProtectedRoute>
                <Vouchers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/trial-balance"
            element={
              <ProtectedRoute>
                <TrialBalance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/profit-loss"
            element={
              <ProtectedRoute>
                <ProfitLoss />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/balance-sheet"
            element={
              <ProtectedRoute>
                <BalanceSheet />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;