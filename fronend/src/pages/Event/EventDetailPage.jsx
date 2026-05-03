import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchEventDetails,
  attendEvent,
  cancelAttendance,
  toggleSaveEvent,
  clearSelectedEvent,
} from "../../features/event/eventSlice";
import {
  LuMapPin as MapPin,
  LuCalendar as Calendar,
  LuClock as Clock,
  LuUsers as Users,
  LuBookmark as Bookmark,
  LuBookmarkCheck as BookmarkCheck,
  LuShare2 as Share2,
  LuArrowLeft as ArrowLeft,
  LuTag as Tag,
  LuGlobe as Globe,
  LuPhone as Phone,
  LuMail as Mail,
  LuChevronDown as ChevronDown,
  LuChevronUp as ChevronUp,
  LuTicket as Ticket,
  LuStar as Star,
  LuExternalLink as ExternalLink,
  LuInstagram as Instagram,
  LuFacebook as Facebook,
  LuMessageCircle as MessageCircle,
  LuCopy as Copy,
  LuCheck as Check,
} from "react-icons/lu";
import { FaRegCheckCircle as CheckCircle } from "react-icons/fa";
import { GoXCircle as XCircle } from "react-icons/go";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CATEGORY_COLORS = {
  music: { bg: "bg-purple-100", text: "text-purple-700", accent: "#7c3aed" },
  tech: { bg: "bg-blue-100", text: "text-blue-700", accent: "#2563eb" },
  sports: { bg: "bg-green-100", text: "text-green-700", accent: "#16a34a" },
  education: { bg: "bg-yellow-100", text: "text-yellow-800", accent: "#d97706" },
  food: { bg: "bg-orange-100", text: "text-orange-700", accent: "#ea580c" },
  business: { bg: "bg-indigo-100", text: "text-indigo-700", accent: "#4338ca" },
  festival: { bg: "bg-pink-100", text: "text-pink-700", accent: "#db2777" },
  meetup: { bg: "bg-teal-100", text: "text-teal-700", accent: "#0891b2" },
  other: { bg: "bg-gray-100", text: "text-gray-700", accent: "#6b7280" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (date, opts) =>
  date ? new Date(date).toLocaleDateString("en-US", opts) : "";

const fmtDate = (d) =>
  fmt(d, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

const fmtShort = (d) => fmt(d, { month: "short", day: "numeric" });

const fmtPrice = (price, isFree, currency = "USD") =>
  isFree || price === 0
    ? "Free"
    : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const DetailSkeleton = () => (
  <div className="min-h-screen bg-[#f8f7f4] animate-pulse">
    <div className="h-72 md:h-[420px] bg-gray-200 w-full" />
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-5">
        <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-40 bg-gray-200 rounded-xl" />
      </div>
      <div className="space-y-4">
        <div className="h-48 bg-gray-200 rounded-2xl" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  </div>
);

// ── Collapsible section ───────────────────────────────────────────────────────
const Collapsible = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// ── Share button ──────────────────────────────────────────────────────────────
const ShareButton = ({ title }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-sm text-gray-600 hover:text-gray-800 transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
};

// ── RSVP Card (sticky sidebar) ────────────────────────────────────────────────
const RSVPCard = ({ event, isAttending, isSaved, onAttend, onCancelAttend, onSave, attending, saving }) => {
  const { price, isFree, currency, availableSeats, totalSeats, status } = event;
  const soldOut = availableSeats === 0 && totalSeats > 0;
  const pct = totalSeats ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100) : 0;
  const cancelled = status === "cancelled";

  return (
    <div className="bg-transparent rounded-2xl shadow-md shadow-purple-200 overflow-hidden">
      {/* Price bar */}
      <div className="bg-purple-700 px-5 py-4">
        <p className="text-indigo-200 text-xs font-medium mb-0.5">Admission</p>
        <p className="text-white text-2xl font-bold tracking-tight">
          {fmtPrice(price, isFree, currency)}
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Seat meter */}
        {totalSeats && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{availableSeats} seats left</span>
              <span>{pct}% full</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-indigo-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        {cancelled ? (
          <div className="flex items-center gap-2 justify-center py-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Event Cancelled
          </div>
        ) : isAttending ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              You're going!
            </div>
            <button
              onClick={onCancelAttend}
              disabled={attending}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
            >
              {attending ? "Cancelling…" : "Cancel RSVP"}
            </button>
          </div>
        ) : (
          <button
            onClick={onAttend}
            disabled={attending || soldOut}
            className="w-full py-3 rounded-xl bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            {attending ? "Registering…" : soldOut ? "Sold Out" : "RSVP Now"}
          </button>
        )}

        {/* Save */}
        <button
          onClick={onSave}
          disabled={saving}
          className={`w-full py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
            isSaved
              ? "border-purple-200 bg-purple-50 text-purple-700"
              : "border-gray-200 text-gray-600 hover:border-purple-200 hover:text-purple-600"
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {isSaved ? "Saved" : "Save Event"}
        </button>

        {/* Quick stats */}
        <div className="pt-1 border-t border-gray-700 grid grid-cols-2 gap-3">
          {event.totalAttendees > 0 && (
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{event.totalAttendees.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Attending</p>
            </div>
          )}
          {event.viewsCount > 0 && (
            <div className="text-center">
              <p className="text-lg font-bold text-gray-400">{event.viewsCount.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Views</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const EventDetailPage = () => {
    const { id } = useParams();
    const eventId = id.split("-").pop();
    const dispatch = useDispatch();
    const navigate = useNavigate();
  const { selectedEvent: event, detailLoading, error } = useSelector((s) => s.events);
  const { user, isLoggedIn } = useSelector((s) => s.auth);

  const [isAttending, setIsAttending] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [attending, setAttending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState(null); // gallery image index
  const [faqOpen, setFaqOpen] = useState(null);
  useEffect(() => {
    if (eventId) {
        dispatch(fetchEventDetails(eventId));
    }

    return () => dispatch(clearSelectedEvent());
    }, [eventId, dispatch]);

  // Sync attend/save state once event loads
  useEffect(() => {
    if (!event || !user) return;
    setIsAttending(event.attendees?.some((a) => (a._id || a) === user._id) ?? false);
    setIsSaved(event.savedByUsers?.some((s) => (s._id || s) === user._id) ?? false);
  }, [event, user]);

  const handleAttend = useCallback(async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    setAttending(true);
    setIsAttending(true); // optimistic
    try {
      await dispatch(attendEvent(event._id)).unwrap();
    } catch {
      setIsAttending(false);
    } finally {
      setAttending(false);
    }
  }, [dispatch, event?._id, isLoggedIn, navigate]);

  const handleCancelAttend = useCallback(async () => {
    setAttending(true);
    setIsAttending(false); // optimistic
    try {
      await dispatch(cancelAttendance(event._id)).unwrap();
    } catch {
      setIsAttending(true);
    } finally {
      setAttending(false);
    }
  }, [dispatch, event?._id]);

  const handleSave = useCallback(async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    setSaving(true);
    setIsSaved((p) => !p); // optimistic
    try {
      await dispatch(toggleSaveEvent(event._id)).unwrap();
    } catch {
      setIsSaved((p) => !p);
    } finally {
      setSaving(false);
    }
  }, [dispatch, event?._id, isLoggedIn, navigate]);

  // ── Error / loading states ────────────────────────────────────────────────
  if (detailLoading) return <DetailSkeleton />;

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Event not found</h2>
          <p className="text-gray-500 mb-6 text-sm">{error || "This event may have been removed."}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const {
    title, description, category, bannerImage, galleryImages = [],
    startDate, endDate, startTime, endTime, timezone,
    venueName, addressLine1, addressLine2, city, state, country, postalCode, landmark,
    location, organizer, tags = [], rules = [], faq = [],
    website, instagram, facebook, whatsapp, contactEmail, contactPhone,
    isFeatured, isVerifiedOrganizer, spokenLanguages = [], dressCode,
    ageRestriction, refundPolicy, status,
  } = event;

  const cat = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  const coords = location?.coordinates; // [lng, lat]
  const isMultiDay = endDate && fmtShort(startDate) !== fmtShort(endDate);
  const isCancelled = status === "cancelled";

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ── Hero Banner ── */}
      <div className="relative h-64 md:h-[420px] w-full overflow-hidden bg-gray-900">
        {bannerImage?.url ? (
          <img
            src={bannerImage.url}
            alt={title}
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center">
            <Calendar className="w-20 h-20 text-white/20" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back + actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-2 bg-black/40 backdrop-blur-sm text-white rounded-xl text-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <ShareButton title={title} />
        </div>

        {/* Badges on image */}
        <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
          {isFeatured && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
          {isCancelled && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              Cancelled
            </span>
          )}
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${cat.bg} ${cat.text}`}>
            {category}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left / Main column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title block */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-300 leading-tight mb-3">
                {title}
              </h1>

              {/* Quick meta row */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  {isMultiDay
                    ? `${fmtShort(startDate)} – ${fmtShort(endDate)}`
                    : fmtDate(startDate)}
                </span>
                {startTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    {startTime}{endTime && ` – ${endTime}`}
                    {timezone && <span className="text-gray-400 text-xs ml-0.5">{timezone}</span>}
                  </span>
                )}
                {(venueName || city) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    {venueName || city}
                  </span>
                )}
              </div>
            </motion.div>

            {/* About */}
            <Collapsible title="About this Event" icon={Tag} >
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </Collapsible>

            {/* Date & Time detail */}
            <Collapsible title="Date & Time" icon={Calendar}>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex gap-3">
                  <div className="w-28 flex-shrink-0 text-gray-400">Start</div>
                  <span>{fmtDate(startDate)}{startTime && `, ${startTime}`}</span>
                </div>
                {endDate && (
                  <div className="flex gap-3">
                    <div className="w-28 flex-shrink-0 text-gray-400">End</div>
                    <span>{fmtDate(endDate)}{endTime && `, ${endTime}`}</span>
                  </div>
                )}
                {timezone && (
                  <div className="flex gap-3">
                    <div className="w-28 flex-shrink-0 text-gray-400">Timezone</div>
                    <span>{timezone}</span>
                  </div>
                )}
              </div>
            </Collapsible>

            {/* Location */}
            <Collapsible title="Location" icon={MapPin}>
              <div className="space-y-3">
                {venueName && (
                  <p className="font-semibold text-gray-800">{venueName}</p>
                )}
                <p className="text-sm text-gray-600">
                  {[addressLine1, addressLine2, city, state, postalCode, country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {landmark && (
                  <p className="text-xs text-gray-400">Near: {landmark}</p>
                )}

                {/* Mini map */}
                {coords && (
                  <div className="mt-3 h-48 rounded-xl overflow-hidden border border-gray-100">
                    <MapContainer
                      center={[coords[1], coords[0]]}
                      zoom={15}
                      className="w-full h-full"
                      zoomControl={false}
                      attributionControl={false}
                      dragging={false}
                      scrollWheelZoom={false}
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                      <Marker position={[coords[1], coords[0]]}>
                        <Popup>{venueName || title}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [venueName, addressLine1, city, country].filter(Boolean).join(", ")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-xs font-medium mt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Google Maps
                </a>
              </div>
            </Collapsible>

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <Collapsible title={`Gallery (${galleryImages.length})`} icon={Star}>
                <div className="grid grid-cols-3 gap-2">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox(i)}
                      className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <img src={img.url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </Collapsible>
            )}

            {/* Event details */}
            <Collapsible title="Event Details" icon={Ticket} defaultOpen={false}>
              <dl className="space-y-3 text-sm">
                {spokenLanguages.length > 0 && (
                  <div className="flex gap-3">
                    <dt className="w-32 flex-shrink-0 text-gray-400">Language</dt>
                    <dd className="text-gray-700">{spokenLanguages.join(", ")}</dd>
                  </div>
                )}
                {dressCode && (
                  <div className="flex gap-3">
                    <dt className="w-32 flex-shrink-0 text-gray-400">Dress Code</dt>
                    <dd className="text-gray-700">{dressCode}</dd>
                  </div>
                )}
                {ageRestriction > 0 && (
                  <div className="flex gap-3">
                    <dt className="w-32 flex-shrink-0 text-gray-400">Age Restriction</dt>
                    <dd className="text-gray-700">{ageRestriction}+</dd>
                  </div>
                )}
              </dl>
            </Collapsible>

            {/* Rules */}
            {rules.length > 0 && (
              <Collapsible title="Event Rules" icon={CheckCircle} defaultOpen={false}>
                <ul className="space-y-2">
                  {rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </Collapsible>
            )}

            {/* FAQ */}
            {faq.length > 0 && (
              <Collapsible title="FAQ" icon={MessageCircle} defaultOpen={false}>
                <div className="space-y-2">
                  {faq.map((item, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                        className="w-full flex justify-between items-center px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        {item.question}
                        {faqOpen === i ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      <AnimatePresence initial={false}>
                        {faqOpen === i && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-3 text-sm text-gray-600">{item.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </Collapsible>
            )}

            {/* Refund policy */}
            {refundPolicy && (
              <Collapsible title="Refund Policy" defaultOpen={false}>
                <p className="text-sm text-gray-700 leading-relaxed">{refundPolicy}</p>
              </Collapsible>
            )}

            {/* Organizer */}
            {organizer && (
              <Collapsible title="Organizer" icon={Users}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-indigo-100 flex-shrink-0">
                    {organizer.profileImage?.url ? (
                      <img src={organizer.profileImage.url} alt={organizer.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {organizer.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{organizer.name}</p>
                      {isVerifiedOrganizer && (
                        <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{organizer.email}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 transition-colors">
                      <Mail className="w-3.5 h-3.5" /> {contactEmail}
                    </a>
                  )}
                  {contactPhone && (
                    <a href={`tel:${contactPhone}`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 transition-colors">
                      <Phone className="w-3.5 h-3.5" /> {contactPhone}
                    </a>
                  )}
                  {website && (
                    <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">
                      <Globe className="w-3.5 h-3.5" /> Website
                    </a>
                  )}
                </div>

                {/* Socials */}
                {(instagram || facebook || whatsapp) && (
                  <div className="mt-3 flex gap-3">
                    {instagram && (
                      <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500 hover:bg-pink-100 transition-colors">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {facebook && (
                      <a href={facebook} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {whatsapp && (
                      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </Collapsible>
            )}
          </div>

          {/* ── Right / Sidebar ── */}
          <div className="space-y-4">
            {/* Sticky RSVP card */}
            <div className="lg:sticky lg:top-24">
              <RSVPCard
                event={event}
                isAttending={isAttending}
                isSaved={isSaved}
                onAttend={handleAttend}
                onCancelAttend={handleCancelAttend}
                onSave={handleSave}
                attending={attending}
                saving={saving}
              />

              {/* Quick info card */}
              <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Info</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>{fmtDate(startDate)}</span>
                  </div>
                  {startTime && (
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span>{startTime}{endTime ? ` – ${endTime}` : ""}</span>
                    </div>
                  )}
                  {(city || country) && (
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{[city, country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  {category && (
                    <div className="flex items-center gap-2.5">
                      <Tag className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.bg} ${cat.text}`}>
                        {category}
                      </span>
                    </div>
                  )}
                  {event.totalAttendees > 0 && (
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span>{event.totalAttendees.toLocaleString()} going</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={galleryImages[lightbox]?.url}
              alt="Gallery"
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
            {galleryImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                    className={`w-2 h-2 rounded-full transition-colors ${i === lightbox ? "bg-white" : "bg-white/40"}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetailPage;