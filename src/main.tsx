import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css';
import { AuthContextProvider } from '@/components/AuthContext';
import { AppRoutes } from '@/components/AppRoutes';
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthContextProvider>
        <AppRoutes />
      </AuthContextProvider>
    </ErrorBoundary>
  </StrictMode>,
);