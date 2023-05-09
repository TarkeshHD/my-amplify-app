import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index path="" element={<div>Dashboard</div>} />
      </Route>
      <Route path="auth">
        <Route path="login" element={<div>Login</div>} />
        <Route path="register" element={<div>Register</div>} />
      </Route>
    </Routes>
  );
};

export default Router;
