import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Bell, ChevronDown, MapPin, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getData, send } from "../../lib/api";
import { CITY_KEY, CITIES, SEARCH_HINTS } from "../../lib/marketplace";
import { useAuth } from "../../store/auth";
import { cn } from "../../lib/cn";
import { useRequireAuth } from "../../hooks/useRequireAuth";

const NAV = [
  { to: "/", label: "Homes", end: true },
  { to: "/services?category=amc", label: "AMC" },
  { to: "/services?category=onsite", label: "Enterprise" },
];

export function Header() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const nav = useNavigate();
  const loc = useLocation();
  const requireAuth = useRequireAuth();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [city, setCity] = useState(() => localStorage.getItem(CITY_KEY) || "Chennai");
  const [cityOpen, setCityOpen] = useState(false);
  const [hint, setHint] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    setQuery(params.get("q") || "");
  }, [params]);

  useEffect(() => {
    const t = setInterval(() => setHint((h) => (h + 1) % SEARCH_HINTS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const { data } = useQuery({
    queryKey: ["user-notes"],
    queryFn: () => getData<{ items: { _id: string; title: string; read: boolean }[]; unread: number }>("/notifications"),
    refetchInterval: 15000,
    enabled: Boolean(user),
  });

  const markAll = useMutation({
    mutationFn: () => send("post", "/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-notes"] }),
  });

  const accountLinks = useMemo(() => {
    const items = [
      { to: "/account", label: "Overview" },
      { to: "/tickets", label: "My bookings" },
      { to: "/assets", label: "Assets" },
      { to: "/contract", label: "AMC / contract" },
      { to: "/invoices", label: "Invoices" },
      { to: "/profile", label: "Profile" },
    ];
    if (user?.role === "ClientAdmin") items.splice(5, 0, { to: "/team", label: "Team" });
    return items;
  }, [user?.role]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    nav(q ? `/services?q=${encodeURIComponent(q)}` : "/services");
  }

  function chooseCity(next: string) {
    setCity(next);
    localStorage.setItem(CITY_KEY, next);
    setCityOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center gap-4 px-4 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-[13px] font-bold tracking-tight text-white">
            fl
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[15px] font-semibold">FieldLink</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-[14px] text-muted-foreground md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "hover:text-foreground",
                item.end && loc.pathname === "/" ? "font-medium text-foreground" : "hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setCityOpen((v) => !v)}
          className="relative hidden min-w-[180px] items-center gap-2 rounded-full border border-border px-3 py-2 text-left text-[13px] lg:flex"
        >
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{city}</span>
          <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
          {cityOpen && (
            <div className="absolute left-0 top-[110%] z-50 w-56 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg">
              {CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => chooseCity(c)}
                  className={cn("block w-full px-3 py-2 text-left text-sm hover:bg-muted", c === city && "font-semibold")}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </button>

        <form onSubmit={submitSearch} className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search for '${SEARCH_HINTS[hint]}'`}
            className="h-10 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-black/30"
          />
        </form>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="relative rounded-full p-2 hover:bg-muted"
            onClick={() => requireAuth("/tickets")}
            aria-label="Bookings"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>

          {user ? (
            <>
              <div className="relative">
                <button type="button" className="relative rounded-full p-2 hover:bg-muted" onClick={() => setNotesOpen((v) => !v)}>
                  <Bell className="h-5 w-5" />
                  {!!data?.data.unread && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />}
                </button>
                {notesOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-white p-2 shadow-lg">
                    <div className="flex justify-between px-2 py-1">
                      <span className="text-xs font-bold">Alerts</span>
                      <button className="text-[11px] text-muted-foreground" onClick={() => markAll.mutate()}>
                        Mark read
                      </button>
                    </div>
                    {(data?.data.items || []).map((n) => (
                      <div key={n._id} className={n.read ? "px-2 py-1.5 text-xs text-muted-foreground" : "px-2 py-1.5 text-xs font-semibold"}>
                        {n.title}
                      </div>
                    ))}
                    {!data?.data.items?.length && <div className="p-3 text-center text-xs text-muted-foreground">No alerts</div>}
                  </div>
                )}
              </div>
              <div className="relative">
                <button type="button" className="rounded-full p-2 hover:bg-muted" onClick={() => setProfileOpen((v) => !v)}>
                  <UserRound className="h-5 w-5" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg">
                    <div className="border-b border-border px-3 py-2">
                      <div className="text-sm font-semibold">{user.name}</div>
                      <div className="text-[11px] text-muted-foreground">{user.email}</div>
                    </div>
                    {accountLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        className="block px-3 py-2 text-sm hover:bg-muted"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm text-danger hover:bg-muted"
                      onClick={() => {
                        setProfileOpen(false);
                        void logout();
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="hidden rounded-full p-2 hover:bg-muted sm:inline-flex" aria-label="Sign in">
              <UserRound className="h-5 w-5" />
            </Link>
          )}

          <button type="button" className="rounded-full p-2 hover:bg-muted md:hidden" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2 text-sm">
            {NAV.map((item) => (
              <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
