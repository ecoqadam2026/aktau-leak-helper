import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Gauge, Ruler, Flag, ClipboardList } from "lucide-react";
import {
  loadReports,
  PRIORITY_LABEL,
  SCALE_LABEL,
  type Report,
} from "@/lib/reports";

export const Route = createFileRoute("/result/$id")({
  head: () => ({
    meta: [
      { title: "Заявка отправлена — AQ SU" },
      {
        name: "description",
        content: "Результат анализа заявки: вероятность утечки, масштаб и приоритет.",
      },
      { property: "og:title", content: "Заявка отправлена — AQ SU" },
      {
        property: "og:description",
        content: "Результат анализа заявки об утечке воды.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResultPage,
});

function probabilityColor(p: number) {
  if (p >= 85) return "text-destructive";
  if (p >= 65) return "text-chart-4";
  return "text-primary";
}

function ResultPage() {
  const { id } = Route.useParams();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    setReport(loadReports().find((r) => r.id === id) ?? null);
  }, [id]);

  if (!report) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-muted-foreground">Заявка не найдена</p>
        <Link to="/" className="rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground">
          На карту
        </Link>
      </div>
    );
  }

  const { probability, scale, priority } = report.analysis;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex-1 space-y-5 px-4 pb-8 pt-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <CheckCircle2 className="h-9 w-9 text-primary" />
          </div>
          <h1 className="mt-3 text-xl font-extrabold">Заявка отправлена</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Предварительный анализ выполнен автоматически
          </p>
        </div>

        {report.photo && (
          <img
            src={report.photo}
            alt="Фото утечки"
            className="h-40 w-full rounded-2xl object-cover"
          />
        )}

        {/* Вероятность */}
        <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
            <Gauge className="h-4 w-4" />
            Вероятность утечки
          </div>
          <p className={`mt-1 text-6xl font-extrabold tabular-nums ${probabilityColor(probability)}`}>
            {probability}
            <span className="text-3xl">%</span>
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${probability}%` }}
            />
          </div>
        </div>

        {/* Масштаб и приоритет */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Ruler className="h-4 w-4" />
              Масштаб
            </div>
            <p className="mt-1.5 text-lg font-bold">{SCALE_LABEL[scale]}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Flag className="h-4 w-4" />
              Приоритет
            </div>
            <p className="mt-1.5 text-lg font-bold">{PRIORITY_LABEL[priority]}</p>
          </div>
        </div>

        <p className="rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
          Заявка передана диспетчеру водоканала. Статус можно отслеживать в разделе
          «Мои заявки».
        </p>
      </div>

      <div className="space-y-2 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <Link
          to="/requests"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-xl active:scale-[0.98]"
        >
          <ClipboardList className="h-5 w-5" />
          Мои заявки
        </Link>
        <Link
          to="/"
          className="flex w-full items-center justify-center rounded-2xl bg-secondary py-4 text-base font-bold text-secondary-foreground active:scale-[0.98]"
        >
          На карту
        </Link>
      </div>
    </div>
  );
}
