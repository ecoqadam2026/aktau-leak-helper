import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Droplets, Plus } from "lucide-react";
import LeafletMap from "@/components/LeafletMap";
import BottomNav from "@/components/BottomNav";
import {
  AKTAU_CENTER,
  loadReports,
  STATUS_LABEL,
  timeAgo,
  type Report,
} from "@/lib/reports";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AQ SU — карта утечек воды в Актау" },
      {
        name: "description",
        content:
          "Карта заявок об утечках воды в городе Актау. Сообщите о коммунальной аварии за минуту.",
      },
      { property: "og:title", content: "AQ SU — карта утечек воды в Актау" },
      {
        property: "og:description",
        content: "Карта заявок об утечках воды в городе Актау.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);

  useEffect(() => {
    setReports(loadReports());
  }, []);

  return (
    <div className="relative flex h-dvh flex-col">
      <header className="absolute inset-x-0 top-0 z-[1000] flex items-center justify-between bg-gradient-to-b from-background/95 to-transparent px-4 pb-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-none tracking-tight">AQ SU</h1>
            <p className="text-xs text-muted-foreground">Утечки воды · Актау</p>
          </div>
        </div>
        <span className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow">
          {reports.length} заявок
        </span>
      </header>

      <ClientOnly
        fallback={
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Загрузка карты…
          </div>
        }
      >
        <LeafletMap
          center={AKTAU_CENTER}
          zoom={14}
          reports={reports}
          onMarkerClick={setSelected}
          className="flex-1"
        />
      </ClientOnly>

      {selected && (
        <button
          onClick={() => setSelected(null)}
          className="absolute inset-x-4 bottom-24 z-[1000] rounded-2xl border border-border bg-card p-4 text-left shadow-xl"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold">
              Вероятность утечки: {selected.analysis.probability}%
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
              {STATUS_LABEL[selected.status]}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {selected.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{timeAgo(selected.createdAt)}</p>
        </button>
      )}

      {!selected && (
        <Link
          to="/report"
          className="absolute bottom-24 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-xl active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Сообщить об утечке
        </Link>
      )}

      <BottomNav />
      <div className="h-16" />
    </div>
  );
}
