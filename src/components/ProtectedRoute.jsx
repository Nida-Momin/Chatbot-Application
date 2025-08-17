import { useAuthenticationStatus } from '@nhost/react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the sign-in page
    return <Navigate to="/auth" />;
  }

  // If the user is authenticated, render the nested content (our App)
  return <Outlet />;
};