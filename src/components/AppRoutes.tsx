import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/channel",
        element: <PlaceholderPage title="Channel" description="This is the Channel page. Content coming soon!" />
      },
      {
        path: "/upload",
        element: <PlaceholderPage title="Upload" description="This is the Upload page. Content coming soon!" />
      }
    ],
  },
  {
    path: "/auth",
    element: <AuthPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};