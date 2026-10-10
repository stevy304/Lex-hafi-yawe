import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { GuestOnly, RequireAuth, RequireOnboarded, RequireAdmin } from './auth/guards';
import { LandingPage } from './components/LandingPage';
import { SignupWizard } from './features/signup/SignupWizard';
import { OnboardingWizard } from './features/onboarding/OnboardingWizard';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ApplyAdvocatePage } from './features/advocate/ApplyAdvocatePage';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { AboutPage } from './features/static/AboutPage';
import { HelpPage } from './features/static/HelpPage';
import { TermsPage } from './features/static/TermsPage';
import { PrivacyPage } from './features/static/PrivacyPage';
import { VerifyEmailPage } from './features/static/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/static/ResetPasswordPage';
import { DebugPage } from './features/debug/DebugPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Guest Only Routes */}
          <Route
            path="/"
            element={
              <GuestOnly>
                <LandingPage />
              </GuestOnly>
            }
          />
          <Route
            path="/signup/*"
            element={
              <GuestOnly>
                <SignupWizard />
              </GuestOnly>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestOnly>
                <SignupWizard />
              </GuestOnly>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestOnly>
                <ForgotPasswordPage />
              </GuestOnly>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestOnly>
                <ResetPasswordPage />
              </GuestOnly>
            }
          />

          {/* Any / Public / Verification */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/__debug" element={<DebugPage />} />

          {/* Onboarding Wizard (signed in, incomplete onboarding) */}
          <Route
            path="/onboarding/*"
            element={
              <RequireAuth>
                <OnboardingWizard />
              </RequireAuth>
            }
          />
          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <OnboardingWizard />
              </RequireAuth>
            }
          />

          {/* Fully Onboarded Protected Product Routes */}
          <Route
            path="/home"
            element={
              <RequireOnboarded>
                <HomePage />
              </RequireOnboarded>
            }
          />
          <Route
            path="/settings/*"
            element={
              <RequireOnboarded>
                <SettingsPage />
              </RequireOnboarded>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireOnboarded>
                <SettingsPage />
              </RequireOnboarded>
            }
          />
          <Route
            path="/apply"
            element={
              <RequireOnboarded>
                <ApplyAdvocatePage />
              </RequireOnboarded>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/*"
            element={
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
