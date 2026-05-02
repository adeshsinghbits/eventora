import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaMapMarker as Map,  } from "react-icons/fa";
import { LuLayoutGrid as LayoutGrid,  LuLocateFixed as LocateFixed  } from "react-icons/lu";
import { FiAlertCircle as AlertCircle } from "react-icons/fi";
import {
  fetchExploreEvents,
  fetchNearbyEvents,
  fetchClusteredEvents,
  fetchFeaturedEvents,
} from "../../features/event/eventSlice";
import EventCard, { EventCardSkeleton } from "../../components/event/EventCard";
import Filters from "../../components/event/Filters";
import Pagination from "../../components/event/Pagination";

// Lazy-load MapView to avoid SSR issues with Leaflet
import { lazy, Suspense } from "react";
const MapView = lazy(() => import("../../components/event/MapView"));

const SKELETONS = Array.from({ length: 8 });

// ── Geolocation hook ──────────────────────────────────────────────────────────
function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by your browser");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude });
        setGeoLoading(false);
      },
      (err) => {
        setGeoError(err.message);
        setGeoLoading(false);
        // Fall back to a default location (Delhi)
        setLocation({ lat: 28.6139, lng: 77.2090 });
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => { request(); }, []);

  return { location, geoError, geoLoading, retry: request };
}

// ── ExplorePage ───────────────────────────────────────────────────────────────
const ExplorePage = () => {
  const dispatch = useDispatch();
  const { exploreEvents, exploreLoading, pagination, nearbyEvents, mapLoading } =
    useSelector((s) => s.events);

  const [activeFilters, setActiveFilters] = useState({});
  const [page, setPage] = useState(1);
  const [showMap, setShowMap] = useState(true);
  const [flyTo, setFlyTo] = useState(null);

  const { location: userLocation, geoLoading, geoError, retry } = useGeolocation();

  // ── Load explore events when filters or page change ───────────────────────
  useEffect(() => {
    dispatch(fetchExploreEvents({ page, limit: 20, filters: activeFilters }));
  }, [dispatch, page, activeFilters]);

  // ── Load map events when user location becomes available ──────────────────
  useEffect(() => {
    if (!userLocation) return;
    const { lat, lng } = userLocation;
    dispatch(fetchNearbyEvents({ lat, lng, params: { radius: 5000, ...activeFilters } }));
    dispatch(fetchClusteredEvents({ lat, lng, params: { radius: 5000, zoom: 13 } }));
    dispatch(fetchFeaturedEvents({ lat, lng }));
  }, [dispatch, userLocation]);

  const handleFilterChange = useCallback((newFilters) => {
    setActiveFilters(newFilters);
    setPage(1);
    // Also refresh map with new filters
    if (userLocation) {
      dispatch(
        fetchNearbyEvents({
          lat: userLocation.lat,
          lng: userLocation.lng,
          params: { radius: 5000, ...newFilters },
        })
      );
    }
  }, [dispatch, userLocation]);

  const handlePageChange = useCallback((p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEventCardClick = useCallback((event) => {
    if (event.location?.coordinates) {
      const [lng, lat] = event.location.coordinates;
      setFlyTo({ lat, lng, zoom: 15 });
    }
  }, []);

  const handleLocateMe = () => {
    if (userLocation) setFlyTo({ ...userLocation, zoom: 14 });
    else retry();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Explore Events</h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Discover events near you
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Locate me */}
            <button
              onClick={handleLocateMe}
              disabled={geoLoading}
              title="Use my location"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
              <LocateFixed className={`w-4 h-4 ${geoLoading ? "animate-pulse" : ""}`} />
            </button>

            {/* Map toggle */}
            <button
              onClick={() => setShowMap((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                showMap
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-gray-200 text-gray-700 hover:border-indigo-300"
              }`}
            >
              {showMap ? <LayoutGrid className="w-4 h-4" /> : <Map className="w-4 h-4" />}
              <span className="hidden sm:inline">{showMap ? "Hide Map" : "Show Map"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Geo error banner ── */}
      {geoError && !userLocation && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Location unavailable — showing all events. <button onClick={retry} className="underline ml-1">Try again</button>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* ── Map ── */}
        {showMap && (
          <div className="mb-6 h-[340px] md:h-[400px] w-full">
            <Suspense fallback={<div className="w-full h-full bg-gray-100 rounded-2xl animate-pulse" />}>
              <MapView
                userLocation={userLocation}
                flyTo={flyTo}
                filters={activeFilters}
                onEventClick={handleEventCardClick}
              />
            </Suspense>
          </div>
        )}

        {/* ── Body: filters + grid ── */}
        <div className="flex gap-6">
          {/* Filters */}
          <Filters
            onChange={handleFilterChange}
            resultCount={pagination.total}
            loading={exploreLoading}
          />

          {/* Main grid */}
          <main className="flex-1 min-w-0">
            {/* Section title */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                {Object.keys(activeFilters).length > 0 ? "Filtered Events" : "All Events"}
              </h2>
              {!exploreLoading && (
                <span className="text-sm text-gray-400">
                  {pagination.total.toLocaleString()} results
                </span>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {exploreLoading
                ? SKELETONS.map((_, i) => <EventCardSkeleton key={i} />)
                : exploreEvents.length > 0
                ? exploreEvents.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      onClick={() => handleEventCardClick(event)}
                    />
                  ))
                : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                      <Map className="w-7 h-7 text-indigo-300" />
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-1">No events found</h3>
                    <p className="text-sm text-gray-400 max-w-xs">
                      Try adjusting your filters or searching for something else.
                    </p>
                  </div>
                )}
            </div>

            {/* Nearby events strip (map-synced) */}
            {!showMap && nearbyEvents.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold text-gray-800 mb-4">Nearby You</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {nearbyEvents.slice(0, 6).map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {!exploreLoading && exploreEvents.length > 0 && (
              <div className="mt-8">
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;