import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { StorefrontFooter } from "./StorefrontFooter";

export function AppShell() {
  const { pathname } = useLocation();
  const isAuth = pathname === "/login" || pathname === "/register";
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className={isAuth ? "" : "min-h-[calc(100vh-72px)]"}>
        <Outlet />
      </main>
      {!isAuth && <StorefrontFooter />}
    </div>
  );
}
