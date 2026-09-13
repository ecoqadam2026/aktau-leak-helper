import { useLanguage } from "@/lib/i18n";

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex shrink-0 rounded-lg bg-secondary p-1" aria-label="Тіл / Язык">
      {(["ru", "kz"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          aria-pressed={language === item}
          className={`min-w-9 rounded-md px-2 py-1.5 text-xs font-extrabold transition-colors ${
            language === item
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}