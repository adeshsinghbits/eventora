import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapContainer, TileLayer, Marker, useMapEvents, useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-hot-toast";
import {
  FiArrowLeft, FiSave, FiLoader, FiMapPin, FiCamera,
  FiX, FiSearch, FiCrosshair, FiAlertTriangle,
  FiCalendar, FiClock, FiDollarSign, FiUsers,
  FiGlobe, FiMail, FiEye, FiCheckCircle, FiTrash2,
} from "react-icons/fi";
import {
  fetchEventDetails,
  updateEvent,
  uploadEventBanner,
  reverseGeocodeLocation,
  clearSelectedEvent,
} from "../../features/event/eventSlice";

import markericon from "../../assets/marker-icon.png";
import markershadow from "../../assets/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markericon, shadowUrl: markershadow });

function useDebounce(value, delay = 400) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

const toDateInput = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

const searchPlaces = async (query) => {
  if (!query || query.length < 2) return [];
  const key = import.meta.env.VITE_GEOAPIFY_API_KEY;
  const res = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&limit=5&apiKey=${key}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features || []).map((f) => ({
    label: f.properties.formatted,
    name: f.properties.name || f.properties.address_line1 || "",
    address: f.properties.formatted || "",
    city: f.properties.city || f.properties.town || "",
    state: f.properties.state || "",
    country: f.properties.country || "",
    postalCode: f.properties.postcode || "",
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
  }));
};

const FlyTo = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1.1 });
  }, [target, map]);
  return null;
};

const ClickPicker = ({ onPick }) => {
  useMapEvents({
    click(e) {
      if (e.originalEvent?.target?.closest("button, input")) return;
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const LocateMeBtn = ({ onLocate }) => {
  const map = useMap();
  const handle = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { map.flyTo([coords.latitude, coords.longitude], 15); onLocate({ lat: coords.latitude, lng: coords.longitude }); },
      () => toast.error("Could not get your location"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  return (
    <div className="absolute top-16 left-3 z-[999] pointer-events-auto">
      <button onClick={handle} className="bg-white p-2.5 rounded-full shadow-lg hover:bg-gray-50 transition border border-gray-200" title="Use my location">
        <FiCrosshair className="text-purple-600" size={16} />
      </button>
    </div>
  );
};

const MapSearch = ({ onSelect }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(q, 420);
  const ref = useRef(null);

  useEffect(() => {
    if (!debounced.trim() || debounced.length < 2) { setResults([]); setOpen(false); return; }
    setSearching(true);
    searchPlaces(debounced).then((r) => { setResults(r); setOpen(r.length > 0); }).finally(() => setSearching(false));
  }, [debounced]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (place) => { setQ(place.label); setOpen(false); onSelect(place); };
  const stop = (e) => e.stopPropagation();

  return (
    <div ref={ref} className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[88%] max-w-sm pointer-events-auto"
      onMouseDown={stop} onClick={stop} onKeyDown={stop}>
      <div className="relative flex items-center bg-white rounded-xl shadow-lg border border-gray-200">
        <FiSearch className="absolute left-3 text-gray-400" size={14} />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search new location…"
          className="w-full pl-8 pr-8 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
        />
        <div className="absolute right-3">
          {searching ? <FiLoader className="text-purple-500 animate-spin" size={13} /> : q && (
            <button onClick={() => { setQ(""); setOpen(false); }} className="text-gray-400 hover:text-gray-700"><FiX size={13} /></button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.13 }}
            className="mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-56 overflow-y-auto divide-y divide-gray-50">
            {results.map((p, i) => (
              <li key={i}>
                <button onMouseDown={(e) => { e.preventDefault(); pick(p); }}
                  className="w-full flex items-start gap-2.5 px-4 py-3 hover:bg-purple-50 text-left transition-colors">
                  <FiMapPin className="text-purple-500 mt-0.5 flex-shrink-0" size={13} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name || p.city || p.label.split(",")[0]}</p>
                    <p className="text-xs text-gray-400 truncate">{p.label}</p>
                  </div>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const inputCls = "w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-gray-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-colors";
const labelCls = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5";

const Field = ({ label, required, children, hint }) => (
  <div>
    <label className={labelCls}>{label}{required && <span className="text-purple-400 ml-0.5">*</span>}</label>
    {children}
    {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
  </div>
);

const Section = ({ title, icon: Icon, children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.06 }}
    className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden"
  >
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-700/50">
      <div className="w-7 h-7 rounded-lg bg-purple-900/40 flex items-center justify-center flex-shrink-0">
        <Icon size={13} className="text-purple-400" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </motion.div>
);

const EditSkeleton = () => (
  <div className="animate-pulse space-y-5">
    <div className="h-12 bg-slate-800 rounded-2xl w-48" />
    <div className="h-48 bg-slate-800 rounded-2xl" />
    <div className="grid grid-cols-2 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-800 rounded-2xl" />)}
    </div>
    <div className="h-64 bg-slate-800 rounded-2xl" />
  </div>
);

const STATUS_OPTIONS = [
  { value: "draft",     label: "Draft",     desc: "Not visible to public",   color: "text-slate-400", bg: "bg-slate-700/50 border-slate-600" },
  { value: "published", label: "Published", desc: "Live and visible",        color: "text-green-400", bg: "bg-green-900/20 border-green-800/40" },
  { value: "cancelled", label: "Cancelled", desc: "Event is cancelled",      color: "text-red-400",   bg: "bg-red-900/20 border-red-800/40" },
];

const CATEGORIES = ["music","tech","sports","education","food","business","festival","meetup","other"];

export default function EditEventPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedEvent: event, detailLoading, bannerUpload } = useSelector((s) => s.events);
  const { user } = useSelector((s) => s.auth);

  const [form, setForm] = useState(null);
  const [location, setLocation] = useState(null); 
  const [flyTarget, setFlyTarget] = useState(null);
  const [newBannerFile, setNewBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [autoFill, setAutoFill] = useState(true);
  const [dirty, setDirty] = useState(false); 

  const bannerInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchEventDetails(id));
    return () => dispatch(clearSelectedEvent());
  }, [id, dispatch]);

  useEffect(() => {
    if (!event) return;

    const uid = user?._id;
    const isOrg = event.organizer?._id === uid || event.organizer === uid;
    const isCo = event.coHosts?.some((c) => (c._id || c) === uid);
    if (!isOrg && !isCo) {
      toast.error("You are not authorised to edit this event");
      navigate(-1);
      return;
    }

    setForm({
      title:        event.title || "",
      description:  event.description || "",
      shortDescription: event.shortDescription || "",
      category:     event.category || "other",
      startDate:    toDateInput(event.startDate),
      endDate:      toDateInput(event.endDate),
      startTime:    event.startTime || "",
      endTime:      event.endTime || "",
      timezone:     event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      venueName:    event.venueName || "",
      addressLine1: event.addressLine1 || "",
      addressLine2: event.addressLine2 || "",
      city:         event.city || "",
      state:        event.state || "",
      country:      event.country || "",
      postalCode:   event.postalCode || "",
      landmark:     event.landmark || "",
      contactEmail: event.contactEmail || "",
      contactPhone: event.contactPhone || "",
      website:      event.website || "",
      isFree:       event.isFree ?? true,
      price:        event.price ?? 0,
      currency:     event.currency || "USD",
      totalSeats:   event.totalSeats ?? 100,
      dressCode:    event.dressCode || "",
      status:       event.status || "draft",
    });

    if (event.location?.coordinates) {
      const [lng, lat] = event.location.coordinates;
      setLocation({ lat, lng });
      setFlyTarget({ lat, lng });
    }
  }, [event, user, navigate]);

  const set = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    set(name, type === "checkbox" ? checked : value);
  }, [set]);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setDirty(true);
  };

  const handleMapClick = useCallback(async ({ lat, lng }) => {
    setLocation({ lat, lng });
    setDirty(true);
    if (!autoFill) return;
    try {
      const data = await dispatch(reverseGeocodeLocation({ lat, lng })).unwrap();
      setForm((prev) => ({
        ...prev,
        venueName:    prev.venueName.trim()    || data.name    || "",
        addressLine1: prev.addressLine1.trim() || data.address || "",
        city:         prev.city.trim()         || data.city    || "",
        state:        prev.state.trim()        || data.state   || "",
        country:      prev.country.trim()      || data.country || "",
        postalCode:   prev.postalCode.trim()   || data.postcode|| "",
      }));
    } catch { /* silent */ }
  }, [autoFill, dispatch]);

  const handleSearchSelect = useCallback((place) => {
    setLocation({ lat: place.lat, lng: place.lng });
    setFlyTarget({ lat: place.lat, lng: place.lng });
    setDirty(true);
    if (!autoFill) return;
    setForm((prev) => ({
      ...prev,
      venueName:    prev.venueName.trim()    || place.name       || "",
      addressLine1: prev.addressLine1.trim() || place.address    || "",
      city:         prev.city.trim()         || place.city       || "",
      state:        prev.state.trim()        || place.state      || "",
      country:      prev.country.trim()      || place.country    || "",
      postalCode:   prev.postalCode.trim()   || place.postalCode || "",
    }));
  }, [autoFill]);

  const validate = () => {
    if (!form.title.trim())        return "Title is required";
    if (!form.description.trim())  return "Description is required";
    if (!form.startDate)           return "Start date is required";
    if (!form.endDate)             return "End date is required";
    if (!form.startTime)           return "Start time is required";
    if (!form.endTime)             return "End time is required";
    if (!form.venueName.trim())    return "Venue name is required";
    if (!form.city.trim())         return "City is required";
    if (!form.contactEmail.trim()) return "Contact email is required";
    if (!/^\S+@\S+\.\S+$/.test(form.contactEmail)) return "Invalid email";
    if (!location)                 return "Please pin a location on the map";
    if (form.totalSeats <= 0)      return "Total seats must be positive";
    if (!form.isFree && form.price <= 0) return "Price must be > 0 for paid events";
    const start = new Date(`${form.startDate}T${form.startTime}`);
    const end   = new Date(`${form.endDate}T${form.endTime}`);
    if (end <= start)              return "End date/time must be after start";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }

    setSaving(true);
    try {
      let bannerResult = event.bannerImage || null;
      if (newBannerFile) {
        const uploaded = await dispatch(uploadEventBanner({ file: newBannerFile })).unwrap();
        bannerResult = { url: uploaded.url, public_id: uploaded.public_id };
      }

      const payload = {
        ...form,
        price:       form.isFree ? 0 : Number(form.price),
        totalSeats:  Number(form.totalSeats),
        ticketType:  form.isFree ? "free" : "paid",
        postalCode:  form.postalCode || "000000",
        shortDescription: form.shortDescription || form.description.slice(0, 120),
        location: { type: "Point", coordinates: [location.lng, location.lat] },
        ...(bannerResult && { bannerImage: bannerResult }),
      };

      await dispatch(updateEvent({ id, eventData: payload })).unwrap();
      setDirty(false);
      setNewBannerFile(null);
      navigate(`/events/${event.slug || id}`);
    } catch (e) {
      toast.error(e?.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (detailLoading || !form) {
    return (
      <div className="min-h-screen bg-slate-900 px-4 py-8 max-w-6xl mx-auto">
        <EditSkeleton />
      </div>
    );
  }

  const mapCenter = location ? [location.lat, location.lng] : [28.7041, 77.1025];

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-xl px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <FiArrowLeft size={17} />
            </button>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Edit Event</h1>
              <p className="text-xs text-slate-500 truncate max-w-xs">{event.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Unsaved indicator */}
            <AnimatePresence>
              {dirty && (
                <motion.span
                  initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
                  className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 px-2.5 py-1 rounded-full"
                >
                  <FiAlertTriangle size={11} />
                  Unsaved changes
                </motion.span>
              )}
            </AnimatePresence>

            {/* Preview link */}
            <a
              href={`/events/${event.slug || id}`}
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-xs font-medium transition-colors"
            >
              <FiEye size={13} />
              Preview
            </a>

            <button
              onClick={handleSubmit}
              disabled={saving || !dirty}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
            >
              {saving ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Form ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Status */}
          <Section title="Event Status" icon={FiCheckCircle} index={0}>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map(({ value, label, desc, color, bg }) => (
                <button
                  key={value}
                  onClick={() => set("status", value)}
                  className={`relative flex flex-col gap-1 p-3 rounded-xl border text-left transition-all ${
                    form.status === value ? `${bg} ring-1 ring-purple-500/40` : "border-slate-700 hover:border-slate-500"
                  }`}
                >
                  {form.status === value && (
                    <FiCheckCircle size={11} className="absolute top-2 right-2 text-purple-400" />
                  )}
                  <span className={`text-sm font-semibold ${form.status === value ? color : "text-slate-400"}`}>
                    {label}
                  </span>
                  <span className="text-xs text-slate-600">{desc}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Banner */}
          <Section title="Banner Image" icon={FiCamera} index={1}>
            <div className="relative">
              {/* Preview */}
              <div className="h-44 rounded-xl overflow-hidden bg-slate-700/50 border border-slate-700">
                {bannerPreview || event.bannerImage?.url ? (
                  <img
                    src={bannerPreview || event.bannerImage.url}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
                    <FiCamera size={28} />
                    <span className="text-sm">No banner image</span>
                  </div>
                )}
                {(bannerPreview || event.bannerImage?.url) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => bannerInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 rounded-xl text-xs font-medium transition-colors"
                >
                  <FiCamera size={13} />
                  {event.bannerImage?.url ? "Replace Image" : "Upload Image"}
                </button>
                {(bannerPreview || event.bannerImage?.url) && (
                  <button
                    onClick={() => { setNewBannerFile(null); setBannerPreview(null); setDirty(true); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-800/40 rounded-xl text-xs font-medium transition-colors"
                  >
                    <FiTrash2 size={12} />
                    Remove
                  </button>
                )}
              </div>
              <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
              {newBannerFile && (
                <p className="text-xs text-purple-400 mt-1.5 flex items-center gap-1">
                  <FiCheckCircle size={11} /> New image selected — will upload on save
                </p>
              )}
              {bannerUpload.uploading && (
                <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all" style={{ width: `${bannerUpload.progress}%` }} />
                </div>
              )}
            </div>
          </Section>

          {/* Core details */}
          <Section title="Event Details" icon={FiCalendar} index={2}>
            <Field label="Title" required>
              <input name="title" value={form.title} onChange={handleChange} className={inputCls} placeholder="Event title" />
            </Field>
            <Field label="Description" required>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                className={`${inputCls} resize-none overflow-auto scrollbar-custom`} placeholder="Describe your event in detail…" />
            </Field>
            <Field label="Short Description" hint="Shown in event cards (max 120 chars)">
              <input name="shortDescription" value={form.shortDescription} onChange={handleChange}
                maxLength={120} className={inputCls} placeholder="One-liner summary" />
              <p className="text-xs text-slate-600 mt-1 text-right">{form.shortDescription.length}/120</p>
            </Field>
            <Field label="Category">
              <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-800">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </Field>
          </Section>

          {/* Date & Time */}
          <Section title="Date & Time" icon={FiClock} index={3}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date" required>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Start Time" required>
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="End Date" required>
                <input type="date" name="endDate" value={form.endDate} min={form.startDate} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="End Time" required>
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className={inputCls} />
              </Field>
            </div>
            <Field label="Timezone">
              <input name="timezone" value={form.timezone} onChange={handleChange} className={inputCls} placeholder="e.g. Asia/Kolkata" />
            </Field>
          </Section>

          {/* Venue */}
          <Section title="Venue & Location" icon={FiMapPin} index={4}>
            <Field label="Venue Name" required>
              <input name="venueName" value={form.venueName} onChange={handleChange} className={inputCls} placeholder="e.g. Indira Gandhi Indoor Stadium" />
            </Field>
            <Field label="Street Address">
              <input name="addressLine1" value={form.addressLine1} onChange={handleChange} className={inputCls} placeholder="Street / Building" />
            </Field>
            <Field label="Address Line 2">
              <input name="addressLine2" value={form.addressLine2} onChange={handleChange} className={inputCls} placeholder="Floor, unit, etc." />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" required>
                <input name="city" value={form.city} onChange={handleChange} className={inputCls} placeholder="City" />
              </Field>
              <Field label="State" required>
                <input name="state" value={form.state} onChange={handleChange} className={inputCls} placeholder="State" />
              </Field>
              <Field label="Country">
                <input name="country" value={form.country} onChange={handleChange} className={inputCls} placeholder="Country" />
              </Field>
              <Field label="Postal Code">
                <input name="postalCode" value={form.postalCode} onChange={handleChange} className={inputCls} placeholder="000000" />
              </Field>
            </div>
            <Field label="Landmark">
              <input name="landmark" value={form.landmark} onChange={handleChange} className={inputCls} placeholder="Near..." />
            </Field>

            {/* Pin status */}
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${location ? "bg-green-900/20 text-green-400 border-green-800/40" : "bg-slate-700/40 text-slate-500 border-slate-700"}`}>
              <FiMapPin size={11} />
              {location
                ? `Pinned: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                : "No location pinned — click the map or search"}
            </div>
          </Section>

          {/* Tickets */}
          <Section title="Tickets & Capacity" icon={FiDollarSign} index={5}>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2.5 text-sm text-gray-300 cursor-pointer select-none">
                <div
                  onClick={() => set("isFree", !form.isFree)}
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${form.isFree ? "bg-purple-600" : "bg-slate-600"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFree ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                Free Event
              </label>
            </div>
            {!form.isFree && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price" required>
                  <input type="number" name="price" min="1" value={form.price} onChange={handleChange} className={inputCls} placeholder="0" />
                </Field>
                <Field label="Currency">
                  <select name="currency" value={form.currency} onChange={handleChange} className={inputCls}>
                    {["USD","EUR","GBP","INR","AUD","CAD"].map((c) => (
                      <option key={c} value={c} className="bg-slate-800">{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
            <Field label="Total Seats" required>
              <input type="number" name="totalSeats" min="1" value={form.totalSeats} onChange={handleChange} className={inputCls} />
            </Field>
            <div className="text-xs text-slate-600">
              Currently <span className="text-white font-medium">{event.attendees?.length ?? 0}</span> people have RSVP'd.
              {event.totalSeats && ` ${event.availableSeats ?? 0} seats remaining.`}
            </div>
          </Section>

          {/* Contact */}
          <Section title="Contact & Links" icon={FiMail} index={6}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Contact Email" required>
                <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} className={inputCls} placeholder="organiser@email.com" />
              </Field>
              <Field label="Contact Phone">
                <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} className={inputCls} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Website">
                <input name="website" value={form.website} onChange={handleChange} className={inputCls} placeholder="https://..." />
              </Field>
              <Field label="Dress Code">
                <input name="dressCode" value={form.dressCode} onChange={handleChange} className={inputCls} placeholder="e.g. Smart casual" />
              </Field>
            </div>
          </Section>

          {/* Save footer (mobile) */}
          <div className="lg:hidden flex gap-3 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !dirty}
              className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Map ── */}
        <div className="w-full lg:w-96 xl:w-[440px] flex-shrink-0">
          <div className="lg:sticky lg:top-20 space-y-3">
            {/* Map panel */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-900/40 flex items-center justify-center">
                    <FiMapPin size={12} className="text-purple-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">Event Location</span>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                  <div
                    onClick={() => setAutoFill((p) => !p)}
                    className={`w-7 h-3.5 rounded-full relative transition-colors cursor-pointer ${autoFill ? "bg-purple-600" : "bg-slate-600"}`}
                  >
                    <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-transform ${autoFill ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  Auto-fill
                </label>
              </div>

              <div className="relative h-72">
                <MapContainer
                  center={mapCenter} zoom={location ? 14 : 12}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0" zoomControl={false} attributionControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <ClickPicker onPick={handleMapClick} />
                  {location && <Marker position={[location.lat, location.lng]} />}
                  {flyTarget && <FlyTo target={flyTarget} />}
                  <LocateMeBtn onLocate={handleMapClick} />
                  <MapSearch onSelect={handleSearchSelect} />
                </MapContainer>
              </div>

              <div className="px-4 py-3 border-t border-slate-700/50 text-xs text-slate-600">
                Search above, click the map, or use <FiCrosshair className="inline text-purple-400" size={11} /> to pin
              </div>
            </div>

            {/* Desktop save card */}
            <div className="hidden lg:block bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Save</div>
              <button
                onClick={handleSubmit}
                disabled={saving || !dirty}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {saving ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
                {saving ? "Saving changes…" : "Save Changes"}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm hover:bg-slate-700/50 hover:text-white transition-colors"
              >
                Discard & Go Back
              </button>
              {dirty && (
                <p className="flex items-center gap-1.5 text-xs text-amber-400">
                  <FiAlertTriangle size={11} />
                  You have unsaved changes
                </p>
              )}
            </div>

            {/* Danger */}
            <div className="hidden lg:block bg-red-900/10 border border-red-900/30 rounded-2xl p-4">
              <p className="text-xs font-semibold text-red-400 mb-1">Danger Zone</p>
              <p className="text-xs text-slate-600 mb-3">Cancelling this event will notify all attendees.</p>
              {form.status !== "cancelled" && (
                <button
                  onClick={() => { set("status", "cancelled"); toast("Status set to Cancelled — save to confirm."); }}
                  className="w-full py-2 rounded-xl bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-semibold border border-red-800/40 transition-colors"
                >
                  Mark as Cancelled
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}