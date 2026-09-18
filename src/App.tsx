import { useEffect, type ReactNode } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Protected } from "./components/Protected";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { BookPage } from "./pages/BookPage";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { AssetsPage } from "./pages/AssetsPage";
import { ContractPage } from "./pages/ContractPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { TeamPage } from "./pages/TeamPage";
import { ProfilePage } from "./pages/ProfilePage";
import { useAuth } from "./store/auth";
import { safeNext } from "./hooks/useRequireAuth";

function AccountLayout() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 lg:px-8">
      <Outlet />
    </div>
  );
}

function AuthRedirect({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  const location = useLocation();
  const next = safeNext(new URLSearchParams(location.search).get("next"));
  if (user) return <Navigate to={user.mustChangePassword ? "/change-password" : next || "/"} replace />;
  return <>{children}</>;
}

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <RegisterPage />
            </AuthRedirect>
          }
        />
        <Route element={<Protected />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route element={user?.mustChangePassword ? <Navigate to="/change-password" replace /> : <AccountLayout />}>
            <Route path="/account" element={<DashboardPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/contract" element={<ContractPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
