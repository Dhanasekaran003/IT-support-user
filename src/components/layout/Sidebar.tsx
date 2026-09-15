import { NavLink } from "react-router-dom";
import { Building2, ClipboardList, FileText, LayoutDashboard, Monitor, Radio, Shield, Users, Wrench } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAuth } from "../../store/auth";

const items = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/book", label: "Book a service", icon: Wrench },
  { to: "/tickets", label: "My tickets", icon: ClipboardList },
  { to: "/assets", label: "Assets", icon: Monitor },
  { to: "/contract", label: "AMC / contract", icon: Shield },
  { to: "/invoices", label: "Invoices", icon: FileText },
];

export function Sidebar() {
  const role = useAuth((s) => s.user?.role);
  const nav = role === "ClientAdmin" ? [...items, { to: "/team", label: "Team", icon: Users }] : items;
  return (
    <aside className="flex h-screen w-[220px] flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-white">
          <Radio className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">FieldLink</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Client portal</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium",
                isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium",
              isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
            )
          }
        >
          <Building2 className="h-4 w-4" />
          Profile
        </NavLink>
      </nav>
    </aside>
  );
}
