import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PlayerDashboard from './pages/PlayerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminSportsPage from './pages/AdminSportsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AvailableSessionsPage from './pages/AvailableSessionsPage';
import CreateSessionPage from './pages/CreateSessionPage';
import MyCreatedSessionsPage from './pages/MyCreatedSessionsPage';
import MyJoinedSessionsPage from './pages/MyJoinedSessionsPage';
import SessionDetailsPage from './pages/SessionDetailsPage';
import SettingsPage from './pages/SettingsPage';

// Route guard: redirect unauthenticated users to login
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Route guard: redirect non-admins away from admin pages
function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

// Redirect authenticated users away from public-only pages
function PublicOnly({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnly>
              <SignupPage />
            </PublicOnly>
          }
        />

        {/* Player routes (any authenticated user) */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <PlayerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/sessions"
          element={
            <RequireAuth>
              <AvailableSessionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/sessions/:id"
          element={
            <RequireAuth>
              <SessionDetailsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/sessions/created"
          element={
            <RequireAuth>
              <MyCreatedSessionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/sessions/joined"
          element={
            <RequireAuth>
              <MyJoinedSessionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/create-session"
          element={
            <RequireAuth>
              <CreateSessionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/sports"
          element={
            <RequireAdmin>
              <AdminSportsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RequireAdmin>
              <AdminReportsPage />
            </RequireAdmin>
          }
        />

        {/* Catch-all: redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
