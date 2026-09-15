import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Protected } from "./components/Protected";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BookPage } from "./pages/BookPage";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { AssetsPage } from "./pages/AssetsPage";
import { ContractPage } from "./pages/ContractPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { TeamPage } from "./pages/TeamPage";
import { ProfilePage } from "./pages/ProfilePage";
import { useAuth } from "./store/auth";

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
      <Route
        path="/login"
        element={user ? <Navigate to={user.mustChangePassword ? "/change-password" : "/"} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={user.mustChangePassword ? "/change-password" : "/"} replace /> : <RegisterPage />}
      />
      <Route element={<Protected />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route element={user?.mustChangePassword ? <Navigate to="/change-password" replace /> : <AppShell />}>
          <Route path="/" element={<DashboardPage />} />
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
    </Routes>
  );
}
