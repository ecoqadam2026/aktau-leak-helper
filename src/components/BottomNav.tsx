import { Link } from "@tanstack/react-router";
import { Map, PlusCircle, ClipboardList, Radio, BarChart3 } from "lucide-react";
import { useLanguage, type TranslationKey } from "@/lib/i18n";

const items = [
  { to: "/", label: "map", icon: Map },
  { to: "/report", label: "report", icon: PlusCircle },
  { to: "/requests", label: "requests", icon: ClipboardList },
  { to: "/dispatcher", label: "dispatcher", icon: Radio },
  { to: "/stats", label: "statistics", icon: BarChart3 },
] as const;

export default function BottomNav() {
  const { t } = useLanguage();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground data-[status=active]:text-primary"
          >
            <Icon className="h-6 w-6" />
            {t(label as TranslationKey)}
          </Link>
        ))}
      </div>
    </nav>
  );
}
