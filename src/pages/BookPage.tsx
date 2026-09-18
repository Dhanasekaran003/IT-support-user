import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { getData, send } from "../lib/api";
import { inr } from "../lib/cn";
import { findService } from "../lib/marketplace";
import type { Asset, Category, PortalLookups, PortalSummary, Site, Ticket } from "../lib/types";
import { Badge, Button, Card, Empty, Field, Input, Select, Textarea } from "../components/ui/primitives";

function matchCategory(categories: Category[], serviceName?: string, categoryId?: string) {
  if (!categories.length) return { categoryId: "", subCategoryId: "" };
  const hay = `${serviceName || ""} ${categoryId || ""}`.toLowerCase();
  const keywords = [
    { keys: ["laptop", "desktop"], cat: "laptop" },
    { keys: ["wifi", "network", "mesh"], cat: "network" },
    { keys: ["printer"], cat: "printer" },
    { keys: ["cctv", "access", "camera"], cat: "cctv" },
    { keys: ["server", "backup"], cat: "server" },
    { keys: ["amc"], cat: "amc" },
  ];
  const hit = keywords.find((k) => k.keys.some((word) => hay.includes(word)));
  const matched = categories.find((c) => {
    const n = c.name.toLowerCase();
    if (hit) return hit.keys.some((word) => n.includes(word)) || n.includes(hit.cat);
    return hay && n.includes(hay.split(" ")[0]);
  });
  return { categoryId: matched?._id || "", subCategoryId: "" };
}

export function BookPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const market = findService(params.get("service"));
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [form, setForm] = useState({
    siteId: "",
    assetId: "",
    title: market?.name || "",
    description: market?.blurb || "",
    priority: "medium",
  });

  const catalog = useQuery({
    queryKey: ["portal-catalog"],
    queryFn: () => getData<Category[]>("/portal/catalog"),
  });
  const sites = useQuery({
    queryKey: ["portal-sites"],
    queryFn: () => getData<Site[]>("/portal/sites"),
  });
  const lookups = useQuery({
    queryKey: ["portal-lookups"],
    queryFn: () => getData<PortalLookups>("/portal/lookups"),
  });
  const summary = useQuery({
    queryKey: ["portal-summary"],
    queryFn: () => getData<PortalSummary>("/portal/summary"),
  });
  const assets = useQuery({
    queryKey: ["portal-assets", form.siteId],
    queryFn: () => getData<Asset[]>("/portal/assets", { siteId: form.siteId, limit: 100 }),
    enabled: Boolean(form.siteId),
  });

  const categories = catalog.data?.data || [];
  const selected = categories.find((c) => c._id === categoryId);
  const children = selected?.children || [];
  const selectedSub = children.find((c) => c._id === subCategoryId);
  const siteList = sites.data?.data || [];
  const priorities = lookups.data?.data.priorities || [];
  const contract = summary.data?.data.contract;

  useEffect(() => {
    if (!categories.length || categoryId) return;
    const match = matchCategory(categories, market?.name, market?.categoryId);
    if (match.categoryId) {
      setCategoryId(match.categoryId);
      setForm((f) => ({ ...f, title: f.title || market?.name || "" }));
    }
  }, [categories, categoryId, market]);

  const priceHint = useMemo(() => {
    const cat = selectedSub || selected;
    if (market && !cat) return `${inr(market.price)} · starting price`;
    if (!cat) return null;
    if (contract && cat.amcIncluded) return "Covered under your active AMC";
    if (cat.basePrice) return `${inr(cat.basePrice)} ${cat.priceModel || ""}`.trim();
    return cat.priceModel || "Quoted after diagnosis";
  }, [selected, selectedSub, contract, market]);

  const book = useMutation({
    mutationFn: () =>
      send<Ticket>("post", "/portal/tickets", {
        siteId: form.siteId,
        assetId: form.assetId || undefined,
        categoryId,
        subCategoryId: subCategoryId || undefined,
        title: form.title,
        description: form.description,
        priority: form.priority,
      }),
    onSuccess: (ticket) => {
      toast.success(`${ticket.ticketNo} booked`);
      qc.invalidateQueries({ queryKey: ["portal-tickets"] });
      qc.invalidateQueries({ queryKey: ["portal-summary"] });
      nav(`/tickets/${ticket._id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight">Book a service</h1>
        <p className="mt-1 text-sm text-muted-foreground">A technician will visit the site you select. Prices follow your live catalog and AMC coverage.</p>
      </div>

      {market && (
        <div className="mb-8 flex gap-4 overflow-hidden rounded-2xl border border-border">
          <img src={market.image} alt={market.name} className="hidden h-36 w-48 object-cover sm:block" />
          <div className="flex flex-1 flex-col justify-center p-4">
            <div className="text-lg font-semibold">{market.name}</div>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-current text-foreground" />
              {market.rating.toFixed(2)}
            </div>
            <div className="mt-1 text-sm">
              <span className="font-semibold">{inr(market.price)}</span>
              {market.mrp && <span className="ml-2 text-muted-foreground line-through">{inr(market.mrp)}</span>}
            </div>
            {market.blurb && <p className="mt-1 text-sm text-muted-foreground">{market.blurb}</p>}
          </div>
        </div>
      )}

      {catalog.isLoading && <Empty text="Loading catalog…" />}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => {
              setCategoryId(cat._id);
              setSubCategoryId("");
              setForm((f) => ({ ...f, title: f.title || `${cat.name} support` }));
            }}
            className={`rounded-xl border p-4 text-left ${categoryId === cat._id ? "border-black bg-muted" : "border-border bg-card hover:border-black/40"}`}
          >
            <div className="font-semibold">{cat.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {cat.children?.length || 0} sub-services · {cat.amcIncluded ? "AMC eligible" : "Billable"}
            </div>
          </button>
        ))}
      </div>

      {!!children.length && (
        <Card className="mb-6 p-4">
          <div className="mb-3 text-sm font-semibold">Choose a sub-service</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {children.map((sub) => (
              <button
                key={sub._id}
                type="button"
                onClick={() => {
                  setSubCategoryId(sub._id);
                  setForm((f) => ({ ...f, title: `${selected?.name}: ${sub.name}` }));
                }}
                className={`rounded-md border px-3 py-2 text-left text-sm ${subCategoryId === sub._id ? "border-black bg-muted" : "border-border hover:bg-muted"}`}
              >
                <div className="font-medium">{sub.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {sub.basePrice ? inr(sub.basePrice) : sub.priceModel} {sub.amcIncluded ? "· AMC" : ""}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        {!categoryId && <Empty text="Select a service above to continue." />}
        {categoryId && (
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              book.mutate();
            }}
          >
            {priceHint && (
              <div className="rounded-md bg-muted px-3 py-2 text-xs font-medium">
                {priceHint}
                {contract && (
                  <Badge tone="teal">
                    SLA {contract.slaTerms?.responseMinutes}m / {contract.slaTerms?.resolutionMinutes}m
                  </Badge>
                )}
              </div>
            )}
            <Field label="Site">
              <Select required value={form.siteId} onChange={(e) => setForm({ ...form, siteId: e.target.value, assetId: "" })}>
                <option value="">Select site</option>
                {siteList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                    {s.city ? ` · ${s.city}` : ""}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Asset (optional)">
              <Select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} disabled={!form.siteId}>
                <option value="">No specific asset</option>
                {(assets.data?.data || []).map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.assetTag} · {a.name || a.type}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Issue title">
              <Input required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Button disabled={book.isPending || !form.siteId}>{book.isPending ? "Booking…" : "Call technician"}</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
