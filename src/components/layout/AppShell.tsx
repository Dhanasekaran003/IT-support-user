import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <div className="sticky top-0 hidden h-screen lg:block">
          <Sidebar />
        </div>
        <div className="min-w-0 flex-1">
          <Header />
          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
