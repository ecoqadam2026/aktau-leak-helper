import { createFileRoute, useNavigate, ClientOnly } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, MapPin, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import LeafletMap from "@/components/LeafletMap";
import { AKTAU_CENTER, addReport, analyzeLeak } from "@/lib/reports";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Сообщить об утечке — AQ SU" },
      {
        name: "description",
        content: "Отправьте заявку об утечке воды в Актау: фото, точка на карте и описание.",
      },
      { property: "og:title", content: "Сообщить об утечке — AQ SU" },
      {
        property: "og:description",
        content: "Отправьте заявку об утечке воды в Актау: фото, точка на карте и описание.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error("Фото слишком большое (макс. 2 МБ)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!point) {
      toast.error("Отметьте точку утечки на карте");
      return;
    }
    if (description.trim().length < 5) {
      toast.error("Добавьте описание (минимум 5 символов)");
      return;
    }
    setSending(true);
    // Имитация анализа фото/описания
    setTimeout(() => {
      const report = {
        id: crypto.randomUUID(),
        lat: point.lat,
        lng: point.lng,
        description: description.trim().slice(0, 500),
        photo: photo ?? undefined,
        createdAt: Date.now(),
        status: "new" as const,
        analysis: analyzeLeak(description, !!photo),
      };
      addReport(report);
      navigate({ to: "/result/$id", params: { id: report.id } });
    }, 1200);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
          aria-label="Назад"
        >
          <X className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Сообщить об утечке</h1>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-32 pt-4">
        {/* Фото */}
        <section>
          <h2 className="mb-2 text-sm font-bold">Фото утечки</h2>
          {photo ? (
            <div className="relative">
              <img src={photo} alt="Фото утечки" className="h-44 w-full rounded-2xl object-cover" />
              <button
                onClick={() => setPhoto(null)}
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-foreground/70 text-background"
                aria-label="Удалить фото"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input bg-card text-muted-foreground active:bg-secondary"
            >
              <Camera className="h-8 w-8" />
              <span className="text-sm font-medium">Сфотографировать / выбрать</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </section>

        {/* Карта */}
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
            <MapPin className="h-4 w-4 text-primary" />
            Точка на карте
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border">
            <ClientOnly
              fallback={<div className="flex h-56 items-center justify-center text-sm text-muted-foreground">Загрузка карты…</div>}
            >
              <LeafletMap
                center={point ? [point.lat, point.lng] : AKTAU_CENTER}
                zoom={point ? 16 : 13}
                pickMode
                picked={point}
                onPick={(lat, lng) => setPoint({ lat, lng })}
                className="h-56 w-full"
              />
            </ClientOnly>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {point
              ? `Выбрано: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
              : "Коснитесь карты, чтобы отметить место утечки"}
          </p>
        </section>

        {/* Описание */}
        <section>
          <h2 className="mb-2 text-sm font-bold">Описание</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Например: из люка бьёт вода, затопило тротуар…"
            className="w-full resize-none rounded-2xl border border-input bg-card p-4 text-base outline-none placeholder:text-muted-foreground focus:border-ring"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{description.length}/500</p>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-8">
        <button
          onClick={submit}
          disabled={sending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-xl active:scale-[0.98] disabled:opacity-70"
        >
          {sending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Анализируем…
            </>
          ) : (
            "Отправить заявку"
          )}
        </button>
      </div>
    </div>
  );
}
