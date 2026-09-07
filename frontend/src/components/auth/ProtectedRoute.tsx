import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/useAuthStore";

export default function ProtectedRoute() {
  const accessToken = useAuthStore( (state) => state.accessToken );

  const user = useAuthStore((state) => state.user);

  const loading = useAuthStore( (state) => state.loading);

  // Đang kiểm tra authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">
          Checking authentication...
        </p>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!accessToken || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Đã đăng nhập
  return <Outlet />;
}