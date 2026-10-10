/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingSignInPage } from './components/auth/LandingSignInPage';

const AppContent: React.FC = () => {
  const { currentUser, isGuestBrowsing, isLoading } = useApp();

  // Show subtle initial loader during initial token verification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#45525A] to-[#242C31] border border-white/15 flex items-center justify-center shadow-lg shadow-black/20 mb-4 animate-pulse">
          <span className="text-xl font-bold text-[#D2691E]">⚖</span>
        </div>
        <div className="text-sm font-semibold tracking-wide text-white/80">Lex Hafi Yawe</div>
        <div className="text-xs text-white/40 mt-1">Rwanda Digital Justice Platform</div>
      </div>
    );
  }

  // If not logged in and not explicitly browsing as guest, render the landing/sign-in page
  if (!currentUser && !isGuestBrowsing) {
    return <LandingSignInPage />;
  }

  return <AppLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
