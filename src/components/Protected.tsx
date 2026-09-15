import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/auth";

export function Protected() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading session…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
