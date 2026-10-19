import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { GOOGLE_CITIES, META_AREA } from "@/lib/ads/areas";

const LEAFLET = "https://unpkg.com/leaflet@1.9.4/dist/leaflet";
const META_COLOR = "#2d4fd6";
const GOOGLE_COLOR = "#0f7f86";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Leaflet vem do CDN, sem tipos
type Leaflet = any;

function loadLeaflet(): Promise<Leaflet> {
  const w = window as unknown as { L?: Leaflet; __leafletLoading?: Promise<Leaflet> };
  if (w.L) return Promise.resolve(w.L);
  if (w.__leafletLoading) return w.__leafletLoading;
  w.__leafletLoading = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${LEAFLET}.css`;
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = `${LEAFLET}.js`;
    js.async = true;
    js.onload = () => (w.L ? resolve(w.L) : reject(new Error("Mapa indisponível")));
    js.onerror = () => reject(new Error("Mapa indisponível"));
    document.head.appendChild(js);
  });
  return w.__leafletLoading;
}

export function AreaMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let map: Leaflet | null = null;
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !ref.current) return;
        map = L.map(ref.current, { scrollWheelZoom: false, attributionControl: true });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: "© OpenStreetMap",
        }).addTo(map);
        L.circle([META_AREA.center.lat, META_AREA.center.lng], {
          radius: META_AREA.radiusKm * 1000,
          color: META_COLOR,
          weight: 2,
          fillOpacity: 0.12,
        }).addTo(map);
        GOOGLE_CITIES.forEach((city) => {
          L.circleMarker([city.lat, city.lng], {
            radius: 7,
            color: "#fff",
            weight: 2,
            fillColor: GOOGLE_COLOR,
            fillOpacity: 1,
          })
            .addTo(map)
            .bindTooltip(city.name, {
              permanent: true,
              direction: "right",
              offset: [8, 0],
              className: "city-label",
            });
        });
        const { lat, lng } = META_AREA.center;
        const dLat = META_AREA.radiusKm / 111;
        const dLng = META_AREA.radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
        map.fitBounds(
          [
            [lat - dLat, lng - dLng],
            [lat + dLat, lng + dLng],
          ],
          { padding: [8, 8] },
        );
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <section className="metric-card mt-4" aria-label="Onde os anúncios aparecem">
      <h2 className="list-heading">Onde seus anúncios aparecem</h2>
      <div className="area-body">
        {failed ? (
          <p className="empty-state">O mapa não carregou agora. As cidades estão abaixo.</p>
        ) : (
          <div
            ref={ref}
            className="area-map"
            role="img"
            aria-label={`Raio de ${META_AREA.radiusKm} km em volta de ${META_AREA.center.name} e as cidades do Google`}
          />
        )}
        <div className="area-legend">
          <div className="area-group">
            <div className="area-title">
              <span className="area-swatch meta" />
              Instagram e Facebook
            </div>
            <p className="day-details">
              Raio de {META_AREA.radiusKm} km em volta de {META_AREA.center.name}
            </p>
          </div>
          <div className="area-group">
            <div className="area-title">
              <span className="area-swatch google" />
              Google
            </div>
            <ul className="city-list">
              {GOOGLE_CITIES.map((city) => (
                <li key={city.name}>
                  <MapPin size={14} />
                  {city.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
