import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./utils/AuthContext";
import { ProfileProvider } from "./utils/ProfileContext";
import Layout from "./layouts/Layouts";
import HomePage from "./pages/Hompage";
import Login from "./pages/Login";
import ClientOnboarding from "./pages/ClientOnboarding";
import ConsultantOnboarding from "./pages/ConsultantOnboarding";
import Services from "./pages/Services";
import UseCases from "./pages/UseCases";
// import About from "./pages/About";
import ProtectedRoute from "./utils/ProtectedRoute";
import PublicRoute from "./utils/PublicRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Analytics from "./pages/Dashboard/Analytics";
import Finance from "./pages/Dashboard/Finance";
import Clients from "./pages/Dashboard/Clients";
import Profile from "./pages/Dashboard/Profile";
import ScheduledCalls from "./pages/Dashboard/ScheduledCalls";
import Documents from "./pages/Dashboard/Documents";
import ScheduleCall from './pages/Dashboard/ScheduleCall';
import TeamsChannels from './pages/Dashboard/TeamsChannels';
import WorkWithUs from "./pages/WorkWithUs";
import SignUp from "./pages/SignUp";

// New pages
import Projects from "./pages/Dashboard/Projects";
import ClientsList from "./pages/Dashboard/ClientsList";
import ConsultantsList from "./pages/Dashboard/ConsultantsList";
import Tasks from "./pages/Dashboard/Tasks";
import Board from "./pages/Dashboard/Board";
import Schedule from "./pages/Dashboard/Schedule";
import RoleManagement from "./pages/Dashboard/RoleManagement";
import Configurations from "./pages/Dashboard/Configurations";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: "#FFFFFF",
                color: "#333333",
                borderRadius: "8px",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
              },
              success: {
                iconTheme: {
                  primary: "#0078D4",
                  secondary: "#FFFFFF",
                },
              },
              error: {
                iconTheme: {
                  primary: "#d92d20",
                  secondary: "#FFFFFF",
                },
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route
                element={
                  <Layout>
                    <Outlet />
                  </Layout>
                }
              >
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/services" element={<Services />} />
                <Route path="/use-cases" element={<UseCases />} />
                {/* <Route path="/about" element={<About />} /> */}
                <Route path="/work-with-us" element={<WorkWithUs />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/onboard/client" element={<ClientOnboarding />} />
                <Route
                  path="/onboard/consultant"
                  element={<ConsultantOnboarding />}
                />
              </Route>
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/scheduled-calls" element={<ScheduledCalls />} />
                <Route path="/schedule-call" element={<ScheduleCall />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/teams-channels" element={<TeamsChannels />} />
                
                {/* New routes */}
                <Route path="/projects" element={<Projects />} />
                <Route path="/clients-list" element={<ClientsList />} />
                <Route path="/consultants-list" element={<ConsultantsList />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/board" element={<Board />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/role-management" element={<RoleManagement />} />
                <Route path="/configurations" element={<Configurations />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
};

export default App;
