import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Droplets, Gauge, ClipboardList } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { loadReports, STATUS_LABEL, type Report, type ReportStatus } from "@/lib/reports";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Статистика — AQ SU" },
      { name: "description", content: "Статистика заявок об утечках воды в Актау." },
      { property: "og:title", content: "Статистика — AQ SU" },
      { property: "og:description", content: "Статистика заявок об утечках воды в Актау." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatsPage,
});

const STATUS_SEQUENCE: ReportStatus[] = ["new", "in_progress", "resolved"];
const STATUS_COLORS: Record<ReportStatus, string> = {
  new: "bg-destructive/10 text-destructive",
  in_progress: "bg-chart-4/15 text-chart-3",
  resolved: "bg-chart-2/15 text-chart-2",
};

function detectDistrict(lat: number, lng: number): string {
  if (lat >= 43.65 && lng >= 51.15 && lng <= 51.16) return "Центр города";
  if (lng >= 51.16) return "Восточный район";
  if (lng <= 51.14) return "Западный район";
  if (lat < 43.65) return "Южный район";
  return "Северный район";
}

export default function StatsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    setReports(loadReports());
  }, []);

  const stats = useMemo(() => {
    const total = reports.length;
    const byStatus = {
      new: reports.filter((r) => r.status === "new").length,
      in_progress: reports.filter((r) => r.status === "in_progress").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
    };
    const avgProbability = total
      ? Math.round(reports.reduce((sum, r) => sum + r.analysis.probability, 0) / total)
      : 0;
    const savedWater = byStatus.resolved * 15;

    const districts = new Map<string, number>();
    reports.forEach((r) => {
      const district = detectDistrict(r.lat, r.lng);
      districts.set(district, (districts.get(district) ?? 0) + 1);
    });
    const districtEntries = Array.from(districts.entries()).sort((a, b) => b[1] - a[1]);
    const maxDistrict = districtEntries.length ? Math.max(...districtEntries.map(([, n]) => n)) : 0;

    return { total, byStatus, avgProbability, savedWater, districtEntries, maxDistrict };
  }, [reports]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">Статистика</h1>
            <p className="text-xs text-muted-foreground">Обзор заявок об утечках</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24 pt-4">
        {/* Total */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <ClipboardList className="h-4 w-4 text-primary" />
            Всего заявок
          </div>
          <p className="mt-2 text-5xl font-extrabold tabular-nums text-foreground">
            {stats.total}
          </p>
        </div>

        {/* Status breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {STATUS_SEQUENCE.map((status) => (
            <div
              key={status}
              className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm"
            >
              <p className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[status]}`}>
                {STATUS_LABEL[status]}
              </p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums">
                {stats.byStatus[status]}
              </p>
            </div>
          ))}
        </div>

        {/* Average probability & saved water */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Gauge className="h-4 w-4 text-primary" />
              Средняя вероятность
            </div>
            <p className="mt-2 text-3xl font-extrabold tabular-nums text-primary">
              {stats.avgProbability}%
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Droplets className="h-4 w-4 text-chart-2" />
              Сэкономлено воды
            </div>
            <p className="mt-2 text-3xl font-extrabold tabular-nums text-chart-2">
              {stats.savedWater}
              <span className="ml-0.5 text-lg">м³</span>
            </p>
          </div>
        </div>

        {/* Districts bar chart */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
            <BarChart3 className="h-5 w-5 text-primary" />
            Заявки по районам
          </h2>
          {stats.districtEntries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Пока нет данных</p>
          ) : (
            <div className="space-y-4">
              {stats.districtEntries.map(([district, count], index) => {
                const width = stats.maxDistrict ? (count / stats.maxDistrict) * 100 : 0;
                const barColor =
                  index % 5 === 0
                    ? "bg-primary"
                    : index % 5 === 1
                      ? "bg-chart-2"
                      : index % 5 === 2
                        ? "bg-chart-3"
                        : index % 5 === 3
                          ? "bg-chart-4"
                          : "bg-accent";
                return (
                  <div key={district}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{district}</span>
                      <span className="font-extrabold tabular-nums">{count}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-700`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
