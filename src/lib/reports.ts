export type ReportStatus = "new" | "in_progress" | "resolved";

export interface LeakAnalysis {
  probability: number; // %
  scale: "точечная" | "локальная" | "масштабная";
  priority: "низкий" | "средний" | "высокий" | "критический";
}

export interface Report {
  id: string;
  lat: number;
  lng: number;
  description: string;
  photo?: string; // dataURL
  address?: string;
  createdAt: number;
  status: ReportStatus;
  analysis: LeakAnalysis;
}

const KEY = "aqsu_reports_v1";

export const AKTAU_CENTER: [number, number] = [43.6525, 51.1575];

export function loadReports(): Report[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as Report[];
  } catch {
    return seed();
  }
}

export function saveReports(reports: Report[]) {
  localStorage.setItem(KEY, JSON.stringify(reports));
}

export function addReport(r: Report) {
  const all = loadReports();
  all.unshift(r);
  saveReports(all);
}

export function updateStatus(id: string, status: ReportStatus) {
  const all = loadReports().map((r) => (r.id === id ? { ...r, status } : r));
  saveReports(all);
  return all;
}

/** Локальный "ИИ"-анализ вероятности утечки по описанию и фото. */
export function analyzeLeak(description: string, hasPhoto: boolean): LeakAnalysis {
  const text = description.toLowerCase();
  let score = 40 + Math.min(description.length / 4, 25);
  if (hasPhoto) score += 18;
  const strong = ["фонтан", "прорыв", "хлещет", "затопило", "потоп", "лужа", "бьёт", "бьет"];
  const medium = ["капает", "мокро", "сыро", "подтек", "подтёк", "влага", "труба"];
  if (strong.some((w) => text.includes(w))) score += 20;
  else if (medium.some((w) => text.includes(w))) score += 10;
  const probability = Math.max(5, Math.min(99, Math.round(score)));

  const scale: LeakAnalysis["scale"] =
    probability >= 80 ? "масштабная" : probability >= 55 ? "локальная" : "точечная";
  const priority: LeakAnalysis["priority"] =
    probability >= 85
      ? "критический"
      : probability >= 65
        ? "высокий"
        : probability >= 45
          ? "средний"
          : "низкий";
  return { probability, scale, priority };
}

function seed(): Report[] {
  const now = Date.now();
  const demo: Report[] = [
    {
      id: "demo-1",
      lat: 43.6508,
      lng: 51.1503,
      description: "Из люка бьёт фонтан воды, затопило тротуар у 4 мкр.",
      createdAt: now - 1000 * 60 * 42,
      status: "new",
      analysis: { probability: 92, scale: "масштабная", priority: "критический" },
    },
    {
      id: "demo-2",
      lat: 43.6602,
      lng: 51.1661,
      description: "Большая лужа у остановки, вода подтекает из-под земли.",
      createdAt: now - 1000 * 60 * 60 * 5,
      status: "in_progress",
      analysis: { probability: 71, scale: "локальная", priority: "высокий" },
    },
    {
      id: "demo-3",
      lat: 43.6415,
      lng: 51.1422,
      description: "Сырое пятно на дороге, влага не высыхает второй день.",
      createdAt: now - 1000 * 60 * 60 * 26,
      status: "resolved",
      analysis: { probability: 48, scale: "точечная", priority: "средний" },
    },
  ];
  saveReports(demo);
  return demo;
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  resolved: "Устранена",
};

export const PRIORITY_LABEL: Record<LeakAnalysis["priority"], string> = {
  низкий: "Низкий",
  средний: "Средний",
  высокий: "Высокий",
  критический: "Критический",
};

export const SCALE_LABEL: Record<LeakAnalysis["scale"], string> = {
  точечная: "Точечная",
  локальная: "Локальная",
  масштабная: "Масштабная",
};

export function timeAgo(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} дн назад`;
}
