import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { Toaster } from 'sonner';
import '@/lib/i18n';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const TicketListPage = lazy(() => import('@/pages/TicketListPage'));
const TicketDetailPage = lazy(() => import('@/pages/TicketDetailPage'));
const TicketCreatePage = lazy(() => import('@/pages/TicketCreatePage'));
const TicketEditPage = lazy(() => import('@/pages/TicketEditPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tickets" element={<TicketListPage />} />
                <Route path="/tickets/new" element={<TicketCreatePage />} />
                <Route path="/tickets/:id" element={<TicketDetailPage />} />
                <Route path="/tickets/:id/edit" element={<TicketEditPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
