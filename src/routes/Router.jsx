import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthShield from '../shield/AuthShield';
import ErrorPage from '../pages/404';
import Login from '../pages/auth/Login';

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
      <Route index path="" element={<div>Dashboard</div>} />
    </Route>
    <Route path="auth">
      <Route path="login" element={<Login />} />
      <Route path="register" element={<div>Register</div>} />
    </Route>
    <Route path="*" element={<ErrorPage />} />
  </Routes>
);

export default Router;
