import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star } from "lucide-react";
import { HERO_CATEGORIES, PRODUCT_CATEGORIES, filterServices } from "../lib/marketplace";
import { inr } from "../lib/cn";
import { useRequireAuth } from "../hooks/useRequireAuth";

export function ServicesPage() {
  const [params] = useSearchParams();
  const requireAuth = useRequireAuth();
  const q = params.get("q") || "";
  const categoryId = params.get("category") || "";
  const cats = [...HERO_CATEGORIES, ...PRODUCT_CATEGORIES];
  const activeCat = cats.find((c) => c.id === categoryId);
  const items = useMemo(() => filterServices(q, categoryId || undefined), [q, categoryId]);

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-10 lg:px-8">
      <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">
        {activeCat?.name || (q ? `Results for “${q}”` : "All services")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {activeCat ? "Pick a service to book a visit. Sign in is required only to call a technician." : "Browse the catalog. Booking is available after login."}
      </p>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        <Link
          to="/services"
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${!categoryId ? "border-black bg-black text-white" : "border-border hover:bg-muted"}`}
        >
          All
        </Link>
        {cats.map((c) => (
          <Link
            key={c.id}
            to={`/services?category=${c.id}`}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${categoryId === c.id ? "border-black bg-black text-white" : "border-border hover:bg-muted"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {!items.length && (
        <p className="mt-10 text-center text-sm text-muted-foreground">No services match that search. Try laptop, WiFi, printer, or CCTV.</p>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => requireAuth(`/book?service=${encodeURIComponent(s.id)}`)}
            className="text-left"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img src={s.image} alt={s.name} className="h-44 w-full object-cover" />
              {s.badge && (
                <span className="absolute left-2 top-2 rounded-md bg-[#e11d73] px-2 py-0.5 text-[11px] font-semibold text-white">
                  {s.badge}
                </span>
              )}
            </div>
            <div className="mt-2 text-[15px] font-medium">{s.name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-current text-foreground" />
              {s.rating.toFixed(2)}
            </div>
            <div className="mt-0.5 text-[14px]">
              <span className="font-medium">{inr(s.price)}</span>
              {s.mrp && <span className="ml-1.5 text-[13px] text-muted-foreground line-through">{inr(s.mrp)}</span>}
            </div>
            {s.blurb && <p className="mt-1 text-[12px] text-muted-foreground">{s.blurb}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
