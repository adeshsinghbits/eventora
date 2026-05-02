import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchNearbyEvents } from "../../features/event/eventSlice";

// ── Fix Leaflet default icon broken by Vite/Webpack ─────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── Custom marker icons ───────────────────────────────────────────────────────
const createPinIcon = (color = "#4f46e5", featured = false) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:${featured ? 36 : 28}px;
        height:${featured ? 36 : 28}px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:2px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        transition:transform 0.15s;
      "></div>`,
    iconSize: [featured ? 36 : 28, featured ? 36 : 28],
    iconAnchor: [featured ? 18 : 14, featured ? 36 : 28],
    popupAnchor: [0, -(featured ? 40 : 32)],
  });

const createClusterIcon = (count) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:40px;height:40px;
        background:#4f46e5;
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 2px 10px rgba(79,70,229,0.4);
        display:flex;align-items:center;justify-content:center;
        color:white;font-weight:700;font-size:13px;
        font-family:system-ui,sans-serif;
      ">${count > 99 ? "99+" : count}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });

const userLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:18px;height:18px;">
      <div style="
        width:18px;height:18px;
        background:#3b82f6;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 0 4px rgba(59,130,246,0.25);
      "></div>
    </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const CATEGORY_COLORS = {
  music: "#7c3aed", tech: "#2563eb", sports: "#16a34a",
  education: "#d97706", food: "#ea580c", business: "#4338ca",
  festival: "#db2777", meetup: "#0891b2", other: "#6b7280",
};

// ── Debounce helper ───────────────────────────────────────────────────────────
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ── Map event listener component ──────────────────────────────────────────────
const MapEventHandler = ({ onMoveEnd, filters }) => {
  const map = useMap();

  const handleMoveEnd = useCallback(
    debounce(() => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      // Calculate approximate radius in meters from center to corner
      const ne = bounds.getNorthEast();
      const radius = Math.min(
        map.distance(center, ne),
        50000 // max 50km
      );
      onMoveEnd({ lat: center.lat, lng: center.lng, radius: Math.round(radius) });
    }, 600),
    [map, onMoveEnd]
  );

  useMapEvents({ moveend: handleMoveEnd, zoomend: handleMoveEnd });

  return null;
};

// ── Fly-to controller ─────────────────────────────────────────────────────────
const FlyToLocation = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom ?? 13, { duration: 1.2 });
  }, [target, map]);
  return null;
};

// ── Main MapView ──────────────────────────────────────────────────────────────
const MapView = ({ userLocation, flyTo, filters = {}, onEventClick }) => {
  const dispatch = useDispatch();
  const { nearbyEvents, clusteredEvents, mapLoading } = useSelector((s) => s.events);
  const [activePopup, setActivePopup] = useState(null);

  const defaultCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [28.6139, 77.2090]; // Delhi fallback

  const handleMoveEnd = useCallback(
    ({ lat, lng, radius }) => {
      dispatch(fetchNearbyEvents({ lat, lng, params: { radius, ...filters } }));
    },
    [dispatch, filters]
  );

  // Use clusters if zoomed out, markers if zoomed in
  const showClusters = clusteredEvents.length > 0;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md border border-gray-200">
      {/* Loading overlay */}
      {mapLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs text-gray-600 shadow flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading events…
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        <MapEventHandler onMoveEnd={handleMoveEnd} filters={filters} />
        {flyTo && <FlyToLocation target={flyTo} />}

        {/* User location */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={300}
              pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.08, weight: 1 }}
            />
          </>
        )}

        {/* Cluster markers */}
        {showClusters &&
          clusteredEvents.map((cluster) => {
            const [lng, lat] = cluster.coordinates;
            const isMulti = cluster.count > 1;
            return (
              <Marker
                key={cluster._id}
                position={[lat, lng]}
                icon={isMulti ? createClusterIcon(cluster.count) : createPinIcon("#4f46e5")}
              >
                <Popup className="event-popup" maxWidth={240}>
                  <div className="p-1">
                    <p className="font-semibold text-sm text-gray-800 mb-2">
                      {cluster.count} event{cluster.count > 1 ? "s" : ""} here
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cluster.events.slice(0, 4).map((e) => (
                        <Link
                          key={e._id}
                          to={`/events/${e.slug || e._id}`}
                          className="flex gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
                          onClick={() => onEventClick?.(e)}
                        >
                          {e.bannerImageUrl && (
                            <img src={e.bannerImageUrl} alt={e.title} className="w-10 h-10 object-cover rounded-md flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-800 truncate">{e.title}</p>
                            <p className="text-xs text-indigo-600">{e.isFree ? "Free" : `$${e.price}`}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Individual event markers (when not using clusters) */}
        {!showClusters &&
          nearbyEvents.map((event) => {
            if (!event.location?.coordinates) return null;
            const [lng, lat] = event.location.coordinates;
            const color = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;

            return (
              <Marker
                key={event._id}
                position={[lat, lng]}
                icon={createPinIcon(color, event.isFeatured)}
                eventHandlers={{ click: () => setActivePopup(event._id) }}
              >
                <Popup
                  className="event-popup"
                  maxWidth={220}
                  onClose={() => setActivePopup(null)}
                >
                  <Link
                    to={`/events/${event.slug || event._id}`}
                    className="block hover:opacity-90"
                    onClick={() => onEventClick?.(event)}
                  >
                    {event.bannerImage?.url && (
                      <img
                        src={event.bannerImage.url}
                        alt={event.title}
                        className="w-full h-28 object-cover rounded-lg mb-2"
                      />
                    )}
                    <p className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">{event.title}</p>
                    <p className="text-xs text-gray-500 mb-1">
                      {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {event.startTime && ` · ${event.startTime}`}
                    </p>
                    <p className={`text-xs font-semibold ${event.isFree ? "text-green-600" : "text-indigo-600"}`}>
                      {event.isFree ? "Free" : `$${event.price}`}
                    </p>
                    {event.distance && (
                      <p className="text-xs text-gray-400 mt-1">
                        {event.distance < 1000
                          ? `${Math.round(event.distance)}m away`
                          : `${(event.distance / 1000).toFixed(1)}km away`}
                      </p>
                    )}
                  </Link>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Event count badge */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs text-gray-700 shadow">
        {nearbyEvents.length} event{nearbyEvents.length !== 1 ? "s" : ""} in view
      </div>
    </div>
  );
};

export default MapView; 