import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LeakAnalysis, ReportStatus } from "@/lib/reports";

export type Language = "ru" | "kz";

const LANGUAGE_KEY = "aqsu_language";

const translations = {
  ru: {
    map: "Карта",
    report: "Сообщить",
    requests: "Мои заявки",
    dispatcher: "Диспетчер",
    statistics: "Статистика",
    waterLeaksAktau: "Утечки воды · Актау",
    reportsCount: "заявок",
    mapLoading: "Загрузка карты…",
    leakProbability: "Вероятность утечки",
    reportLeak: "Сообщить об утечке",
    back: "Назад",
    leakPhoto: "Фото утечки",
    deletePhoto: "Удалить фото",
    choosePhoto: "Сфотографировать / выбрать",
    mapPoint: "Точка на карте",
    selected: "Выбрано",
    tapMap: "Коснитесь карты, чтобы отметить место утечки",
    description: "Описание",
    descriptionPlaceholder: "Например: из люка бьёт вода, затопило тротуар…",
    analyzing: "Анализируем…",
    sendReport: "Отправить заявку",
    photoTooLarge: "Фото слишком большое (макс. 2 МБ)",
    markLeakPoint: "Отметьте точку утечки на карте",
    addDescription: "Добавьте описание (минимум 5 символов)",
    noReports: "Заявок пока нет",
    priority: "Приоритет",
    newReport: "Новая заявка",
    total: "всего",
    active: "активных",
    criticalPlural: "критических",
    acceptWork: "Принять в работу",
    markResolved: "Отметить устранённой",
    statsOverview: "Обзор заявок об утечках",
    totalReports: "Всего заявок",
    averageProbability: "Средняя вероятность",
    waterSaved: "Сэкономлено воды",
    reportsByDistrict: "Заявки по районам",
    noData: "Пока нет данных",
    centerDistrict: "Центр города",
    eastDistrict: "Восточный район",
    westDistrict: "Западный район",
    southDistrict: "Южный район",
    northDistrict: "Северный район",
    reportNotFound: "Заявка не найдена",
    toMap: "На карту",
    reportSent: "Заявка отправлена",
    automaticAnalysis: "Предварительный анализ выполнен автоматически",
    scale: "Масштаб",
    sentToDispatcher:
      "Заявка передана диспетчеру водоканала. Статус можно отслеживать в разделе «Мои заявки».",
    pageNotFound: "Страница не найдена",
    pageNotFoundDescription: "Эта страница не существует или была перемещена.",
    goHome: "На главную",
    pageLoadError: "Страница не загрузилась",
    pageLoadErrorDescription: "Произошла ошибка. Обновите страницу или вернитесь на главную.",
    tryAgain: "Повторить",
  },
  kz: {
    map: "Карта",
    report: "Хабарлау",
    requests: "Өтінімдерім",
    dispatcher: "Диспетчер",
    statistics: "Статистика",
    waterLeaksAktau: "Су ағуы · Ақтау",
    reportsCount: "өтінім",
    mapLoading: "Карта жүктелуде…",
    leakProbability: "Су ағу ықтималдығы",
    reportLeak: "Су ағуы туралы хабарлау",
    back: "Артқа",
    leakPhoto: "Су ағуының фотосы",
    deletePhoto: "Фотосуретті жою",
    choosePhoto: "Суретке түсіру / таңдау",
    mapPoint: "Картадағы орын",
    selected: "Таңдалды",
    tapMap: "Су ағып жатқан орынды белгілеу үшін картаны түртіңіз",
    description: "Сипаттама",
    descriptionPlaceholder: "Мысалы: құдықтан су атқылап, жаяужолды су басты…",
    analyzing: "Талдап жатырмыз…",
    sendReport: "Өтінімді жіберу",
    photoTooLarge: "Фотосурет тым үлкен (ең көбі 2 МБ)",
    markLeakPoint: "Картадан су ағып жатқан орынды белгілеңіз",
    addDescription: "Сипаттама қосыңыз (кемінде 5 таңба)",
    noReports: "Әзірге өтінім жоқ",
    priority: "Басымдық",
    newReport: "Жаңа өтінім",
    total: "барлығы",
    active: "белсенді",
    criticalPlural: "шұғыл",
    acceptWork: "Жұмысқа қабылдау",
    markResolved: "Жойылды деп белгілеу",
    statsOverview: "Су ағуы туралы өтінімдерге шолу",
    totalReports: "Барлық өтінім",
    averageProbability: "Орташа ықтималдық",
    waterSaved: "Үнемделген су",
    reportsByDistrict: "Аудандар бойынша өтінімдер",
    noData: "Әзірге дерек жоқ",
    centerDistrict: "Қала орталығы",
    eastDistrict: "Шығыс аудан",
    westDistrict: "Батыс аудан",
    southDistrict: "Оңтүстік аудан",
    northDistrict: "Солтүстік аудан",
    reportNotFound: "Өтінім табылмады",
    toMap: "Картаға өту",
    reportSent: "Өтінім жіберілді",
    automaticAnalysis: "Алдын ала талдау автоматты түрде орындалды",
    scale: "Ауқымы",
    sentToDispatcher:
      "Өтінім су арнасының диспетчеріне жіберілді. Күйін «Өтінімдерім» бөлімінен бақылауға болады.",
    pageNotFound: "Бет табылмады",
    pageNotFoundDescription: "Бұл бет жоқ немесе басқа мекенжайға көшірілген.",
    goHome: "Басты бетке",
    pageLoadError: "Бет жүктелмеді",
    pageLoadErrorDescription: "Қате орын алды. Бетті жаңартыңыз немесе басты бетке оралыңыз.",
    tryAgain: "Қайталау",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["ru"];

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ru");

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === "ru" || saved === "kz") setLanguageState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "kz" ? "kk" : "ru";
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (next) => {
        setLanguageState(next);
        localStorage.setItem(LANGUAGE_KEY, next);
      },
      t: (key) => translations[language][key],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}

export function statusLabel(status: ReportStatus, language: Language): string {
  const labels: Record<Language, Record<ReportStatus, string>> = {
    ru: { new: "Новая", in_progress: "В работе", resolved: "Устранена" },
    kz: { new: "Жаңа", in_progress: "Жұмыста", resolved: "Жойылды" },
  };
  return labels[language][status];
}

export function priorityLabel(priority: LeakAnalysis["priority"], language: Language): string {
  const labels: Record<Language, Record<LeakAnalysis["priority"], string>> = {
    ru: { низкий: "Низкий", средний: "Средний", высокий: "Высокий", критический: "Критический" },
    kz: { низкий: "Төмен", средний: "Орташа", высокий: "Жоғары", критический: "Шұғыл" },
  };
  return labels[language][priority];
}

export function scaleLabel(scale: LeakAnalysis["scale"], language: Language): string {
  const labels: Record<Language, Record<LeakAnalysis["scale"], string>> = {
    ru: { точечная: "Точечная", локальная: "Локальная", масштабная: "Масштабная" },
    kz: { точечная: "Нүктелік", локальная: "Жергілікті", масштабная: "Ауқымды" },
  };
  return labels[language][scale];
}

export function localizedTimeAgo(timestamp: number, language: Language): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return language === "kz" ? "жаңа ғана" : "только что";
  if (minutes < 60) return language === "kz" ? `${minutes} мин бұрын` : `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return language === "kz" ? `${hours} сағ бұрын` : `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return language === "kz" ? `${days} күн бұрын` : `${days} дн назад`;
}