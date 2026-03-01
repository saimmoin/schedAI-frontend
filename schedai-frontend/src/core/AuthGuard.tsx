import { Navigate } from 'react-router-dom';
import { useAuthStore } from './authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export function PublicGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
