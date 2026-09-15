import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { getData } from "../lib/api";
import { nameOf, statusTone } from "../lib/cn";
import type { PortalLookups, Ticket } from "../lib/types";
import { Badge, Card, Empty, Input, PageHeader, Select } from "../components/ui/primitives";

export function TicketsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const lookups = useQuery({
    queryKey: ["portal-lookups"],
    queryFn: () => getData<PortalLookups>("/portal/lookups"),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["portal-tickets", q, status],
    queryFn: () => getData<Ticket[]>("/portal/tickets", { q, status: status || undefined, limit: 50 }),
    refetchInterval: 15000,
  });

  return (
    <div>
      <PageHeader title="My tickets" subtitle="Live status for every booking under your organization" />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input className="max-w-xs" placeholder="Search ticket no or title" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select className="max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {(lookups.data?.data.ticketStatuses || []).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <Card>
        {isLoading && <Empty text="Loading tickets…" />}
        {!isLoading && !data?.data.length && <Empty text="No tickets match these filters." />}
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Service</th>
                <th>Site</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Technician</th>
                <th>Opened</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((t) => (
                <tr key={t._id}>
                  <td>
                    <Link className="font-semibold text-primary" to={`/tickets/${t._id}`}>
                      {t.ticketNo}
                    </Link>
                    <div className="text-[11px] text-muted-foreground">{t.title}</div>
                  </td>
                  <td>{nameOf(t.subCategoryId) !== "—" ? nameOf(t.subCategoryId) : nameOf(t.categoryId)}</td>
                  <td>{nameOf(t.siteId)}</td>
                  <td>
                    <Badge tone={t.priority === "critical" || t.priority === "high" ? "red" : "slate"}>{t.priority}</Badge>
                  </td>
                  <td>
                    <Badge tone={t.slaResolveBreached ? "red" : statusTone(t.status)}>{t.status}</Badge>
                    {t.coveredByAmc && <div className="text-[10px] text-teal-700">AMC</div>}
                  </td>
                  <td>{nameOf(t.assignedAgentId)}</td>
                  <td className="text-xs text-muted-foreground">
                    {t.createdAt ? formatDistanceToNow(new Date(t.createdAt), { addSuffix: true }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
