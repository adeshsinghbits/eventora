import api from "../utils/axioInstance";

// ── MAP ───────────────────────────────────────────────────────────────────────
export const getNearbyEvents = (lat, lng, params = {}) =>
  api.get("/events/map/nearby", { params: { lat, lng, ...params } }).then((r) => r.data);

export const getClusteredEvents = (lat, lng, params = {}) =>
  api.get("/events/map/clusters", { params: { lat, lng, ...params } }).then((r) => r.data);

export const mapSearchEvents = (q, lat, lng, params = {}) =>
  api.get("/events/map/search", { params: { q, lat, lng, ...params } }).then((r) => r.data);

export const getFeaturedNearbyEvents = (lat, lng, params = {}) =>
  api.get("/events/map/featured", { params: { lat, lng, ...params } }).then((r) => r.data);

export const getMapFilterOptions = (lat, lng, params = {}) =>
  api.get("/events/map/filters", { params: { lat, lng, ...params } }).then((r) => r.data);

// ── EXPLORE / CRUD ────────────────────────────────────────────────────────────
export const getExploreEvents = (params = {}) =>
  api.get("/events", { params }).then((r) => r.data);

export const getEventDetails = (id) =>
  api.get(`/events/${id}/details`).then((r) => r.data);

export const createEvent = (data) =>
  api.post("/events", data, { headers: { "Content-Type": "application/json" } }).then((r) => r.data);

export const updateEvent = (id, data) =>
  api.put(`/events/${id}`, data).then((r) => r.data);

export const deleteEvent = (id) =>
  api.delete(`/events/${id}`).then((r) => r.data);

// ── INTERACTIONS ──────────────────────────────────────────────────────────────
export const attendEvent = (id) =>
  api.post(`/events/${id}/attend`).then((r) => r.data);

// FIX: was POST /cancel-attendance → correct route is DELETE /attend
export const cancelAttendance = (id) =>
  api.delete(`/events/${id}/attend`).then((r) => r.data);

export const toggleSaveEvent = (id) =>
  api.post(`/events/${id}/save`).then((r) => r.data);

// ── BANNER UPLOAD ─────────────────────────────────────────────────────────────
export const uploadEventBannerService = (file, onProgress) => {
  const formData = new FormData();
  formData.append("banner", file);
  return api
    .post("/events/upload-banner", formData, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    })
    .then((r) => r.data);
};

// ── USER LISTS ────────────────────────────────────────────────────────────────
// FIX: all three were pointing to wrong URLs
export const getMyEvents = (params = {}) =>
  api.get("/events/user/events/my", { params }).then((r) => r.data);

export const getAttendingEvents = (params = {}) =>
  api.get("/events/user/events/attending", { params }).then((r) => r.data);

export const getSavedEvents = (params = {}) =>
  api.get("/events/user/events/saved", { params }).then((r) => r.data);

// ── GEOCODING ─────────────────────────────────────────────────────────────────
export const reverseGeocode = (lat, lng) =>
  api.get("/geocode/reverse", { params: { lat, lon: lng } }).then((r) => r.data);