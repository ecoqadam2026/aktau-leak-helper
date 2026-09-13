import { Link } from "@tanstack/react-router";
import { Map, PlusCircle, ClipboardList, Radio } from "lucide-react";

const items = [
  { to: "/", label: "Карта", icon: Map },
  { to: "/report", label: "Сообщить", icon: PlusCircle },
  { to: "/requests", label: "Мои заявки", icon: ClipboardList },
  { to: "/dispatcher", label: "Диспетчер", icon: Radio },
] as const;

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground data-[status=active]:text-primary"
          >
            <Icon className="h-6 w-6" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
