import React, { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';

// Shields
import AuthShield from '../shield/AuthShield';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();
  // Use loading screen instead of null;
  return (
    <Suspense fallback={null}>
      <Component {...props} />
    </Suspense>
  );
};

const Router = () => (
  <Routes>
    <Route
      path="/"
      element={
        <AuthShield>
          <DashboardLayout />
        </AuthShield>
      }
    >
      <Route index path="" element={<Dashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="domains" element={<Domains />} />
      <Route path="departments" element={<Departments />} />
    </Route>
    <Route path="auth">
      <Route path="login" element={<Login />} />
      <Route path="register" element={<div>Register</div>} />
    </Route>
    <Route path="*" element={<ErrorPage />} />
  </Routes>
);

// Pages Import

const Departments = Loadable(lazy(() => import('../pages/Departments')));
const Domains = Loadable(lazy(() => import('../pages/Domains')));
const Users = Loadable(lazy(() => import('../pages/Users')));
const Dashboard = Loadable(lazy(() => import('../pages/Dashboard')));
const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const ErrorPage = Loadable(lazy(() => import('../pages/404')));

export default Router;
