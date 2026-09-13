import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import {
  loadReports,
  PRIORITY_LABEL,
  STATUS_LABEL,
  timeAgo,
  type Report,
  type ReportStatus,
} from "@/lib/reports";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Мои заявки — AQ SU" },
      { name: "description", content: "Список ваших заявок об утечках воды в Актау и их статусы." },
      { property: "og:title", content: "Мои заявки — AQ SU" },
      { property: "og:description", content: "Список ваших заявок об утечках воды в Актау." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestsPage,
});

const STATUS_STYLE: Record<ReportStatus, string> = {
  new: "bg-destructive/10 text-destructive",
  in_progress: "bg-chart-4/15 text-chart-3",
  resolved: "bg-chart-2/15 text-chart-2",
};

function RequestsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    setReports(loadReports());
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <h1 className="text-xl font-extrabold">Мои заявки</h1>
        <p className="text-sm text-muted-foreground">{reports.length} заявок</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24 pt-4">
        {reports.length === 0 && (
          <div className="mt-16 text-center text-muted-foreground">
            <p>Заявок пока нет</p>
          </div>
        )}
        {reports.map((r) => (
          <Link
            key={r.id}
            to="/result/$id"
            params={{ id: r.id }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm active:bg-secondary"
          >
            {r.photo ? (
              <img src={r.photo} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg font-extrabold text-primary">
                {r.analysis.probability}%
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[r.status]}`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
                <span className="text-[11px] text-muted-foreground">{timeAgo(r.createdAt)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm">{r.description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Приоритет: {PRIORITY_LABEL[r.analysis.priority]}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-16 bg-gradient-to-t from-background to-transparent px-4 pb-3 pt-6">
        <Link
          to="/report"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-xl active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Новая заявка
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
