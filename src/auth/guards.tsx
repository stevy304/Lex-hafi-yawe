import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const POST_LOGIN_ROUTE = '/home';

export const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    if (!user.onboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to={POST_LOGIN_ROUTE} replace />;
  }

  return <>{children}</>;
};

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const current = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?next=${current}`} replace />;
  }

  return <>{children}</>;
};

export const RequireOnboarded: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const current = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?next=${current}`} replace />;
  }

  if (!user.onboardingCompleted) {
    const current = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/onboarding?next=${current}`} replace />;
  }

  return <>{children}</>;
};

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to={POST_LOGIN_ROUTE} replace />;
  }

  return <>{children}</>;
};
