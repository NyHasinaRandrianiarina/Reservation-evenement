import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, AuthStatus } from "@/hooks/useAuth";

export default function RequireAuth() {
  const location = useLocation();
  const { status, isLoading } = useAuth();

  if (status === AuthStatus.Unknown || isLoading) {
    return null;
  }

  if (status === AuthStatus.Guest) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
