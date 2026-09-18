import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { getData } from "../lib/api";
import { inr, nameOf, statusTone } from "../lib/cn";
import type { PortalMe, PortalSummary, Ticket } from "../lib/types";
import { Badge, Button, Card, Empty, PageHeader } from "../components/ui/primitives";

export function DashboardPage() {
  const me = useQuery({
    queryKey: ["portal-me"],
    queryFn: () => getData<PortalMe>("/portal/me"),
  });
  const summary = useQuery({
    queryKey: ["portal-summary"],
    queryFn: () => getData<PortalSummary>("/portal/summary"),
    refetchInterval: 15000,
  });

  const org = me.data?.data.org;
  const stats = summary.data?.data;
  const contract = stats?.contract;

  return (
    <div>
      <PageHeader
        title={org?.name || "Overview"}
        subtitle="Live tickets, AMC coverage, and invoices for your organization"
        action={
          <Link to="/book">
            <Button>Call a technician</Button>
          </Link>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Open tickets</div>
          <div className="mt-1 text-2xl font-bold">{stats?.openTickets ?? "—"}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase text-muted-foreground">AMC / SLA</div>
          <div className="mt-1 text-lg font-bold">{contract ? "Active coverage" : "Pay per ticket"}</div>
          {contract && (
            <div className="text-xs text-muted-foreground">
              Until {new Date(contract.endDate).toLocaleDateString("en-IN")} · {contract.slaTerms?.responseMinutes}m response
            </div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Unpaid invoices</div>
          <div className="mt-1 text-2xl font-bold">{inr(stats?.unpaid.total)}</div>
          <div className="text-xs text-muted-foreground">{stats?.unpaid.count || 0} outstanding</div>
        </Card>
      </div>
      <Card>
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Recent bookings</div>
        {!stats?.recentTickets?.length && <Empty text="No tickets yet — book a service to get started." />}
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Service</th>
                <th>Site</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentTickets || []).map((t: Ticket) => (
                <tr key={t._id}>
                  <td>
                    <Link className="font-semibold text-primary" to={`/tickets/${t._id}`}>
                      {t.ticketNo}
                    </Link>
                    <div className="text-[11px] text-muted-foreground">{t.title}</div>
                  </td>
                  <td>{nameOf(t.categoryId)}</td>
                  <td>{nameOf(t.siteId)}</td>
                  <td>
                    <Badge tone={t.slaResolveBreached ? "red" : statusTone(t.status)}>{t.status}</Badge>
                  </td>
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
