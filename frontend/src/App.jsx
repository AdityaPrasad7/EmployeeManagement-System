import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from './theme';
import Login from './pages/Login';
import HRDashboard from './pages/HRDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './hooks/useAuth';
import { ROUTES } from './config/constants';
import ProjectDetails from './pages/ProjectDetails';
import CreateProjectPage from './pages/CreateProjectPage';

const App = () => {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path={ROUTES.LOGIN}
            element={
              user ? (
                <Navigate to={user.role === 'hr' ? ROUTES.HR_DASHBOARD : ROUTES.EMPLOYEE_DASHBOARD} replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={user.role === 'hr' ? ROUTES.HR_DASHBOARD : ROUTES.EMPLOYEE_DASHBOARD} replace />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.HR_DASHBOARD}
            element={
              <PrivateRoute>
                <HRDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE_DASHBOARD}
            element={
              <PrivateRoute>
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/projects/create" element={<CreateProjectPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </ThemeProvider>
  );
};

export default App;
