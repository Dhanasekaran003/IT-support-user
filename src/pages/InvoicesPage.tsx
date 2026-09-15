import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getData } from "../lib/api";
import { inr } from "../lib/cn";
import type { Invoice, PortalLookups } from "../lib/types";
import { Badge, Card, Empty, PageHeader, Select } from "../components/ui/primitives";

export function InvoicesPage() {
  const [status, setStatus] = useState("");
  const lookups = useQuery({
    queryKey: ["portal-lookups"],
    queryFn: () => getData<PortalLookups>("/portal/lookups"),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["portal-invoices", status],
    queryFn: () => getData<Invoice[]>("/portal/invoices", { status: status || undefined, limit: 50 }),
  });

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Billing issued against your organization" />
      <div className="mb-4 max-w-[200px]">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {(lookups.data?.data.invoiceStatuses || []).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <Card>
        {isLoading && <Empty text="Loading invoices…" />}
        {!isLoading && !data?.data.length && <Empty text="No invoices yet." />}
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Amount</th>
                <th>GST</th>
                <th>Total</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((inv) => (
                <tr key={inv._id}>
                  <td className="font-mono text-xs">{inv.invoiceNo}</td>
                  <td>{inr(inv.amount)}</td>
                  <td>{inr(inv.gst)}</td>
                  <td className="font-semibold">{inr(inv.total)}</td>
                  <td className="text-xs">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td>
                    <Badge tone={inv.status === "paid" ? "green" : inv.status === "overdue" ? "red" : "amber"}>{inv.status}</Badge>
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
