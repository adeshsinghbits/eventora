import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "./features/auth/authThunks";

import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute"
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import UserDashboardPage from "./pages/Dashboard/UserDashboardPage";
import Layout from "./components/Layout/DashboardLayout";
import ProfilePage from "./pages/Profile/ProfilePage";
import Spinner from "./components/ui/Spinner";
import CreateEvnetPage from "./pages/Event/CrateEventPage";
import ExploreEventsPage from "./pages/Event/ExploreEventPage";

function App() {
  const dispatch = useDispatch();
  const { isAuthChecked, isLoggedIn } = useSelector((state) => state?.auth);

  // 🔥 Run once on app load
  useEffect(() => {
    if (!isAuthChecked) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthChecked]);

  // 🔥 Block UI until auth is verified
  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: "80px",
          right: "20px",
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#000",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid #e2e8f0",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        {/* 🚫 Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* 🔐 Protected Routes */}
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<UserDashboardPage />} />
        </Route>

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<ProfilePage />} />
          <Route path=":username" element={<ProfilePage />} />
        </Route>

        <Route
          path="/create-event"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<CreateEvnetPage />} />
        </Route>

         <Route
          path="/explore-events"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<ExploreEventsPage />} />
        </Route>

        {/* 🔁 Default Route */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/user-dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ❌ Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;