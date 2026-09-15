import { useQuery } from "@tanstack/react-query";
import { getData } from "../lib/api";
import { inr } from "../lib/cn";
import type { Contract } from "../lib/types";
import { Badge, Card, Empty, PageHeader } from "../components/ui/primitives";

export function ContractPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["portal-contracts"],
    queryFn: () => getData<Contract[]>("/portal/contracts"),
  });

  return (
    <div>
      <PageHeader title="AMC / contracts" subtitle="Coverage and SLA terms stored for your organization" />
      {isLoading && <Empty text="Loading contracts…" />}
      {!isLoading && !data?.data.length && <Empty text="No contract on file. Tickets will be billed per visit." />}
      <div className="grid gap-4">
        {(data?.data || []).map((c) => (
          <Card key={c._id} className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-bold">
                {new Date(c.startDate).toLocaleDateString("en-IN")} – {new Date(c.endDate).toLocaleDateString("en-IN")}
              </div>
              <Badge tone={c.status === "active" ? "green" : "slate"}>{c.status}</Badge>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">Contract value</div>
                {inr(c.value)}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Response SLA</div>
                {c.slaTerms?.responseMinutes || "—"} minutes
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Resolution SLA</div>
                {c.slaTerms?.resolutionMinutes || "—"} minutes
              </div>
            </div>
            {!!c.coveredCategories?.length && (
              <div className="mt-3 flex flex-wrap gap-1">
                {c.coveredCategories.map((cat) => (
                  <Badge key={cat._id} tone="teal">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}
            {c.notes && <p className="mt-3 text-xs text-muted-foreground">{c.notes}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
