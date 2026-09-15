import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getData, send } from "../lib/api";
import { inr } from "../lib/cn";
import type { Asset, Category, PortalLookups, PortalSummary, Site, Ticket } from "../lib/types";
import { Badge, Button, Card, Empty, Field, Input, PageHeader, Select, Textarea } from "../components/ui/primitives";

export function BookPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [form, setForm] = useState({
    siteId: "",
    assetId: "",
    title: "",
    description: "",
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

  const priceHint = useMemo(() => {
    const cat = selectedSub || selected;
    if (!cat) return null;
    if (contract && cat.amcIncluded) return "Covered under your active AMC";
    if (cat.basePrice) return `${inr(cat.basePrice)} ${cat.priceModel || ""}`.trim();
    return cat.priceModel || "Quoted after diagnosis";
  }, [selected, selectedSub, contract]);

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
      <PageHeader
        title="Book a service"
        subtitle="Services and prices come from the live catalog. Your organization and sites are loaded from the account."
      />
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
            className={`rounded-lg border p-4 text-left ${categoryId === cat._id ? "border-primary bg-teal-50" : "border-border bg-card hover:border-primary/40"}`}
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
                className={`rounded-md border px-3 py-2 text-left text-sm ${subCategoryId === sub._id ? "border-primary bg-teal-50" : "border-border hover:bg-muted"}`}
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
              <div className="rounded-md bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800">
                {priceHint}
                {contract && <Badge tone="teal">SLA {contract.slaTerms?.responseMinutes}m / {contract.slaTerms?.resolutionMinutes}m</Badge>}
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
            <Button disabled={book.isPending || !form.siteId}>{book.isPending ? "Booking…" : "Submit booking"}</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
