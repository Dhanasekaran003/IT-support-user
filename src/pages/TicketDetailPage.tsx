import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { getData, send } from "../lib/api";
import { nameOf, statusTone } from "../lib/cn";
import type { Ticket } from "../lib/types";
import { Badge, Button, Card, Empty, Field, PageHeader, Textarea } from "../components/ui/primitives";

export function TicketDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["portal-ticket", id],
    queryFn: () => getData<Ticket>(`/portal/tickets/${id}`),
    refetchInterval: 10000,
    enabled: Boolean(id),
  });

  const sign = useMutation({
    mutationFn: () => send("post", `/portal/tickets/${id}/sign`, { signature: "signed" }),
    onSuccess: () => {
      toast.success("Job signed off");
      qc.invalidateQueries({ queryKey: ["portal-ticket", id] });
      qc.invalidateQueries({ queryKey: ["portal-tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rate = useMutation({
    mutationFn: () => send("post", `/portal/tickets/${id}/rate`, { rating, feedback }),
    onSuccess: () => {
      toast.success("Thanks for the rating");
      qc.invalidateQueries({ queryKey: ["portal-ticket", id] });
      qc.invalidateQueries({ queryKey: ["portal-tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const t = data?.data;
  if (isLoading || !t) return <Empty text={isLoading ? "Loading ticket…" : "Ticket not found"} />;

  return (
    <div>
      <PageHeader
        title={t.ticketNo}
        subtitle={t.title}
        action={<Badge tone={t.slaResolveBreached ? "red" : statusTone(t.status)}>{t.status}</Badge>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 text-sm font-semibold">Issue</div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{t.description || "No description provided."}</p>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-xs text-muted-foreground">Service</span>
              <div>{nameOf(t.subCategoryId) !== "—" ? `${nameOf(t.categoryId)} · ${nameOf(t.subCategoryId)}` : nameOf(t.categoryId)}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Site</span>
              <div>{nameOf(t.siteId)}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Asset</span>
              <div>{typeof t.assetId === "object" ? t.assetId.assetTag || t.assetId.name : "—"}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Technician</span>
              <div>{nameOf(t.assignedAgentId)}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Priority</span>
              <div className="capitalize">{t.priority}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Coverage</span>
              <div>{t.coveredByAmc ? "AMC" : "Pay per ticket"}</div>
            </div>
          </div>
          {!!t.checklist?.length && (
            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold">Job checklist</div>
              <ul className="space-y-1 text-sm">
                {t.checklist.map((c, i) => (
                  <li key={`${c.item}-${i}`} className={c.done ? "text-emerald-700" : "text-muted-foreground"}>
                    {c.done ? "✓" : "○"} {c.item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">Timeline</div>
            <ol className="space-y-2">
              {(t.history || []).map((h, i) => (
                <li key={`${h.status}-${i}`} className="text-xs">
                  <span className="font-semibold">{h.status}</span>
                  <span className="text-muted-foreground"> · {h.ts ? format(new Date(h.ts), "dd MMM, HH:mm") : ""}</span>
                  {h.note && <div className="text-muted-foreground">{h.note}</div>}
                </li>
              ))}
            </ol>
          </Card>
          {t.status === "Completed" && (
            <Card className="p-4">
              <div className="mb-2 text-sm font-semibold">Sign off</div>
              <p className="mb-3 text-xs text-muted-foreground">Confirm the technician completed the work at your site.</p>
              <Button disabled={sign.isPending} onClick={() => sign.mutate()}>
                Sign completion
              </Button>
            </Card>
          )}
          {["Completed", "ClientSigned", "Closed"].includes(t.status) && (
            <Card className="p-4">
              <div className="mb-2 text-sm font-semibold">Rate this visit</div>
              <Field label="Stars">
                <select
                  className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="mt-3">
                <Field label="Feedback">
                  <Textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                </Field>
              </div>
              <Button className="mt-3" disabled={rate.isPending} onClick={() => rate.mutate()}>
                Submit rating
              </Button>
            </Card>
          )}
          {t.status === "Rated" && (
            <Card className="p-4 text-sm">
              Rated {t.rating}/5
              {t.feedback && <div className="mt-1 text-muted-foreground">{t.feedback}</div>}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
