import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppProvider } from '../context/AppContext';
import { AppLayout } from '../components/layout/AppLayout';

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (!user) return null;

  return (
    <AppProvider initialAuthUser={user} onLogout={handleLogout}>
      <AppLayout />
    </AppProvider>
  );
};

