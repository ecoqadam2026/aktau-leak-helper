import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import {
  loadReports,
  updateStatus,
  PRIORITY_LABEL,
  STATUS_LABEL,
  timeAgo,
  type Report,
  type ReportStatus,
} from "@/lib/reports";

export const Route = createFileRoute("/dispatcher")({
  head: () => ({
    meta: [
      { title: "Панель диспетчера — AQ SU" },
      { name: "description", content: "Все заявки об утечках воды в Актау: статусы и приоритеты." },
      { property: "og:title", content: "Панель диспетчера — AQ SU" },
      { property: "og:description", content: "Все заявки об утечках воды в Актау." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DispatcherPage,
});

const PRIORITY_ORDER: Record<string, number> = {
  критический: 0,
  высокий: 1,
  средний: 2,
  низкий: 3,
};

const NEXT_STATUS: Record<ReportStatus, { label: string; to: ReportStatus } | null> = {
  new: { label: "Принять в работу", to: "in_progress" },
  in_progress: { label: "Отметить устранённой", to: "resolved" },
  resolved: null,
};

function DispatcherPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    setReports(loadReports());
  }, []);

  const sorted = [...reports].sort(
    (a, b) =>
      (a.status === "resolved" ? 1 : 0) - (b.status === "resolved" ? 1 : 0) ||
      PRIORITY_ORDER[a.analysis.priority]! - PRIORITY_ORDER[b.analysis.priority]! ||
      b.createdAt - a.createdAt,
  );

  const active = reports.filter((r) => r.status !== "resolved").length;
  const critical = reports.filter(
    (r) => r.analysis.priority === "критический" && r.status !== "resolved",
  ).length;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="flex items-center gap-2">
          <Radio className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-extrabold">Диспетчер</h1>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-secondary p-2">
            <p className="text-lg font-extrabold">{reports.length}</p>
            <p className="text-[11px] text-muted-foreground">всего</p>
          </div>
          <div className="rounded-xl bg-secondary p-2">
            <p className="text-lg font-extrabold">{active}</p>
            <p className="text-[11px] text-muted-foreground">активных</p>
          </div>
          <div className="rounded-xl bg-destructive/10 p-2">
            <p className="text-lg font-extrabold text-destructive">{critical}</p>
            <p className="text-[11px] text-muted-foreground">критических</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24 pt-4">
        {sorted.map((r) => {
          const next = NEXT_STATUS[r.status];
          return (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {r.photo && (
                  <img src={r.photo} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-secondary-foreground">
                      {STATUS_LABEL[r.status]}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        r.analysis.priority === "критический"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {PRIORITY_LABEL[r.analysis.priority]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm">{r.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.analysis.probability}% · {r.lat.toFixed(4)}, {r.lng.toFixed(4)} ·{" "}
                    {timeAgo(r.createdAt)}
                  </p>
                </div>
              </div>
              {next && (
                <button
                  onClick={() => setReports(updateStatus(r.id, next.to))}
                  className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground active:scale-[0.98]"
                >
                  {next.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
