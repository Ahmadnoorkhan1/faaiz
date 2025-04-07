import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientOnboarding from './pages/onboard/ClientOnboarding';
import ConsultantOnboarding from './pages/onboard/ConsultantOnboarding';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#FFFFFF',
              color: '#333333',
              borderRadius: '8px',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
            },
            success: {
              iconTheme: {
                primary: '#0078D4',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#d92d20',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboard/client" element={<ClientOnboarding />} />
          <Route path="/onboard/consultant" element={<ConsultantOnboarding />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          
          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
