import React, { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useConfig } from '../hooks/useConfig';

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

const Router = () => {
  const config = useConfig();
  const { data } = config;

  const isKnowledgeRepEnabled = data?.features?.knowledgeRep?.state === 'on';
  const isScheduleEnabled = data?.features?.schedule?.state === 'on';
  const isArchiveEnabled = data?.features?.archive?.state === 'on';
  return (
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
        <Route path="modules" element={<Modules />} />
        <Route path="evaluations" element={<Evaluations />} />
        <Route path="trainings" element={<Training />} />
        <Route path="evaluations/:userIdParam" element={<UserEvaluation />} />
        <Route path="past-session" element={<PastSession />} />
        <Route path="create-session" element={<CreateSession />} />
        <Route path="session-details/:sessionId" element={<SessionDetails />} />

        {isKnowledgeRepEnabled && <Route path="knowledge" element={<KnowledgeRep />} />}
        {isScheduleEnabled && <Route path="schedule" element={<Schedule />} />}
        {isArchiveEnabled && <Route path="archive" element={<Archive />} />}
      </Route>
      <Route path="auth">
        <Route path="sso-redirect" element={<SsoRedirect />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<div>Register</div>} />
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

// Pages Import

const Modules = Loadable(lazy(() => import('../pages/Modules')));
const Evaluations = Loadable(lazy(() => import('../pages/Evaluations')));
const UserEvaluation = Loadable(lazy(() => import('../pages/UserEvaluation')));
const Departments = Loadable(lazy(() => import('../pages/Departments')));
const Domains = Loadable(lazy(() => import('../pages/Domains')));
const Users = Loadable(lazy(() => import('../pages/Users')));
const Dashboard = Loadable(lazy(() => import('../pages/Dashboard')));
const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const ErrorPage = Loadable(lazy(() => import('../pages/404')));
const KnowledgeRep = Loadable(lazy(() => import('../pages/KnowledgeRep')));
const Schedule = Loadable(lazy(() => import('../pages/Schedule')));
const Archive = Loadable(lazy(() => import('../pages/Archive')));
const PastSession = Loadable(lazy(() => import('../pages/PastSession')));
const CreateSession = Loadable(lazy(() => import('../pages/CreateSession')));
const SessionDetails = Loadable(lazy(() => import('../pages/SessionDetails')));
const SsoRedirect = Loadable(lazy(() => import('../pages/auth/SsoRedirect')));
const Training = Loadable(lazy(() => import('../pages/Trainings')));

export default Router;
