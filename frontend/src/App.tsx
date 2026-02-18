import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import UserInputPage from './pages/UserInputPage';
import ReportPage from './pages/ReportPage';
import DataInsightsPage from './pages/DataInsightsPage';
import ModelDetailsPage from './pages/ModelDetailsPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // New import
import ResetPasswordPage from './pages/ResetPasswordPage';   // New import
import RatingsPage from './pages/RatingsPage'; // New import
import { RecommendationProvider } from './contexts/RecommendationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './print.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <RecommendationProvider>
        <Router>
          <div className="d-flex">
            <Sidebar />
            <main className="flex-grow-1 p-4" style={{ overflowY: 'auto', height: '100vh' }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* New route */}
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* New route */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/form"
                  element={
                    <PrivateRoute>
                      <UserInputPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/report"
                  element={
                    <PrivateRoute>
                      <ReportPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/insights"
                  element={
                    <PrivateRoute>
                      <DataInsightsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/model"
                  element={
                    <PrivateRoute>
                      <ModelDetailsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/ratings"
                  element={
                    <PrivateRoute>
                      <RatingsPage />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </RecommendationProvider>
    </AuthProvider>
  );
}

export default App;