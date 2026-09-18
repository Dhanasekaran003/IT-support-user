import { useRef, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Laptop,
  Lock,
  Printer,
  Server,
  Shield,
  Star,
  Video,
  Wifi,
  Wrench,
} from "lucide-react";
import {
  HERO_CATEGORIES,
  HERO_IMAGES,
  MOST_BOOKED,
  NOTEWORTHY,
  PRODUCT_CATEGORIES,
  SPOTLIGHT,
  type MarketCategory,
  type MarketService,
} from "../lib/marketplace";
import { inr } from "../lib/cn";
import { useRequireAuth } from "../hooks/useRequireAuth";

const ICONS = {
  laptop: Laptop,
  wifi: Wifi,
  printer: Printer,
  server: Server,
  cctv: Video,
  wrench: Wrench,
  shield: Shield,
  lock: Lock,
};

function CategoryTile({ cat }: { cat: MarketCategory }) {
  const Icon = ICONS[cat.icon];
  return (
    <Link
      to={`/services?category=${cat.id}`}
      className="flex flex-col items-center rounded-2xl px-2 py-3 text-center hover:bg-muted/70"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4f4f5] text-foreground">
        <Icon className="h-7 w-7" strokeWidth={1.6} />
      </span>
      {cat.eta && (
        <span className="mt-1.5 rounded-full bg-black px-1.5 py-0.5 text-[9px] font-semibold text-white">{cat.eta}</span>
      )}
      <span className="mt-1.5 text-[12px] font-medium leading-snug text-foreground">{cat.name}</span>
    </Link>
  );
}

function ScrollRow({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <section className="mt-16">
      <h2 className="mb-5 text-[28px] font-bold tracking-tight text-foreground md:text-[32px]">{title}</h2>
      <div className="relative">
        <div ref={ref} className="no-scrollbar flex gap-4 overflow-x-auto pb-2 pr-10">
          {children}
        </div>
        <button
          type="button"
          aria-label="Next"
          onClick={() => ref.current?.scrollBy({ left: 360, behavior: "smooth" })}
          className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-md md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  onBook,
}: {
  service: MarketService;
  onBook: (id: string) => void;
}) {
  return (
    <button type="button" onClick={() => onBook(service.id)} className="w-[200px] shrink-0 text-left md:w-[210px]">
      <div className="relative overflow-hidden rounded-xl">
        <img src={service.image} alt={service.name} className="h-[148px] w-full bg-muted object-cover" />
        {service.badge && (
          <span className="absolute left-2 top-2 rounded-md bg-[#e11d73] px-2 py-0.5 text-[11px] font-semibold text-white">
            {service.badge}
          </span>
        )}
      </div>
      <div className="mt-2 text-[14px] font-medium">{service.name}</div>
      <div className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
        <Star className="h-3.5 w-3.5 fill-current text-foreground" />
        {service.rating.toFixed(2)}
      </div>
      <div className="mt-0.5 text-[14px]">
        <span className="font-medium">{inr(service.price)}</span>
        {service.mrp && <span className="ml-1.5 text-[13px] text-muted-foreground line-through">{inr(service.mrp)}</span>}
      </div>
    </button>
  );
}

export function HomePage() {
  const requireAuth = useRequireAuth();
  const nav = useNavigate();

  function book(serviceId: string) {
    requireAuth(`/book?service=${encodeURIComponent(serviceId)}`);
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-10 lg:px-8">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="max-w-md text-[36px] font-bold leading-[1.15] tracking-tight text-foreground md:text-[42px]">
            Home services at your doorstep
          </h1>
          <div className="mt-8 rounded-2xl border border-border p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-2">
              {HERO_CATEGORIES.map((cat) => (
                <CategoryTile key={cat.id} cat={cat} />
              ))}
            </div>
            <div className="mt-6 text-[15px] font-medium text-muted-foreground">Native Smart Products</div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRODUCT_CATEGORIES.map((cat) => (
                <CategoryTile key={cat.id} cat={cat} />
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {HERO_IMAGES.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="h-44 w-full rounded-2xl bg-muted object-cover md:h-[210px]"
            />
          ))}
        </div>
      </section>

      <ScrollRow title="In the spotlight">
        {SPOTLIGHT.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => (card.to.startsWith("/book") ? requireAuth(card.to) : nav(card.to))}
            className="relative h-[220px] w-[320px] shrink-0 overflow-hidden rounded-2xl text-left md:w-[340px]"
          >
            <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className={`absolute inset-0 ${card.dark ? "bg-black/55" : "bg-black/25"}`} />
            <div className="relative flex h-full flex-col justify-between p-5 text-white">
              <div>
                {card.badge && (
                  <span className="mb-3 inline-flex rounded-md bg-[#e11d73] px-2 py-0.5 text-[11px] font-semibold">
                    {card.badge}
                  </span>
                )}
                <div className="max-w-[200px] text-[22px] font-bold leading-tight">{card.title}</div>
                <div className="mt-1 max-w-[210px] text-[13px] text-white/85">{card.subtitle}</div>
              </div>
              <span className="inline-flex w-fit rounded-lg bg-black px-3.5 py-2 text-[13px] font-semibold">{card.cta}</span>
            </div>
          </button>
        ))}
      </ScrollRow>

      <ScrollRow title="New and noteworthy">
        {NOTEWORTHY.map((s) => (
          <ServiceCard key={s.id} service={s} onBook={book} />
        ))}
      </ScrollRow>

      <ScrollRow title="Most booked services">
        {MOST_BOOKED.map((s) => (
          <ServiceCard key={s.id} service={s} onBook={book} />
        ))}
      </ScrollRow>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Browse freely.{" "}
        <Link className="font-semibold text-foreground underline" to="/login">
          Sign in
        </Link>{" "}
        only when you are ready to call a technician.
      </p>
    </div>
  );
}
