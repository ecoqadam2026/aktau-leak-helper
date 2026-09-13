import { useEffect, useRef } from "react";
import type { Report, ReportStatus } from "@/lib/reports";

interface Props {
  center: [number, number];
  zoom?: number;
  reports?: Report[];
  /** Режим выбора точки на карте */
  pickMode?: boolean;
  picked?: { lat: number; lng: number } | null;
  onPick?: (lat: number, lng: number) => void;
  onMarkerClick?: (report: Report) => void;
  className?: string;
}

const STATUS_COLOR: Record<ReportStatus, string> = {
  new: "#e11d48",
  in_progress: "#d97706",
  resolved: "#059669",
};

const PICK_COLOR = "#0891b2";

function markerHtml(color: string) {
  return `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`;
}

export default function LeafletMap({
  center,
  zoom = 14,
  reports = [],
  pickMode = false,
  picked,
  onPick,
  onMarkerClick,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const pickMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const callbacksRef = useRef({ onPick, onMarkerClick });
  callbacksRef.current = { onPick, onMarkerClick };

  // Инициализация карты один раз (Leaflet требует window — только на клиенте)
  useEffect(() => {
    let destroyed = false;
    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (destroyed || !ref.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(ref.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);
      map.on("click", (e: any) => {
        callbacksRef.current.onPick?.(e.latlng.lat, e.latlng.lng);
      });
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      destroyed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Маркеры заявок
  useEffect(() => {
    const L = leafletRef.current;
    const layer = layerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    for (const r of reports) {
      const icon = L.divIcon({
        html: markerHtml(STATUS_COLOR[r.status]),
        className: "",
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      });
      const m = L.marker([r.lat, r.lng], { icon });
      m.on("click", () => callbacksRef.current.onMarkerClick?.(r));
      m.addTo(layer);
    }
  }, [reports]);

  // Маркер выбранной точки
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (pickMarkerRef.current) {
      pickMarkerRef.current.remove();
      pickMarkerRef.current = null;
    }
    if (pickMode && picked) {
      const icon = L.divIcon({
        html: markerHtml(PICK_COLOR),
        className: "",
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      });
      pickMarkerRef.current = L.marker([picked.lat, picked.lng], { icon }).addTo(map);
    }
  }, [picked, pickMode]);

  return <div ref={ref} className={className} style={{ touchAction: "pan-x pan-y" }} />;
}
