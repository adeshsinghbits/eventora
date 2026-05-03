import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LuMapPin as MapPin,
  LuCalendar as Calendar,
  LuUsers as Users,
  LuBookmark as Bookmark,
  LuBookmarkCheck as BookmarkCheck,
  LuTag as Tag
} from "react-icons/lu";
import { toggleSaveEvent,  } from "../../features/event/eventSlice";

const CATEGORY_COLORS = {
  music:     "bg-purple-100 text-purple-700",
  tech:      "bg-blue-100 text-blue-700",
  sports:    "bg-green-100 text-green-700",
  education: "bg-yellow-100 text-yellow-700",
  food:      "bg-orange-100 text-orange-700",
  business:  "bg-indigo-100 text-indigo-700",
  festival:  "bg-pink-100 text-pink-700",
  meetup:    "bg-teal-100 text-teal-700",
  other:     "bg-gray-100 text-gray-600",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const formatPrice = (price, isFree, currency = "USD") => {
  if (isFree || price === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const EventCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="flex justify-between pt-1">
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-200 rounded w-8" />
      </div>
    </div>
  </div>
);

// ── Main Card ─────────────────────────────────────────────────────────────────
const EventCard = ({ event, isSaved = false, className = "" }) => {
  const dispatch = useDispatch();
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  const {
    _id,
    title,
    slug,
    category,
    bannerImage,
    startDate,
    startTime,
    price,
    isFree,
    currency,
    venueName,
    city,
    totalAttendees,
    attendees,
    isFeatured,
    availableSeats,
    totalSeats,
  } = event;

  const attendeeCount = totalAttendees ?? attendees?.length ?? 0;
  const soldOut = availableSeats === 0 && totalSeats > 0;
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;

    setSaving(true);
    setSaved((prev) => !prev); // optimistic
    //dispatch(optimisticToggleSave(_id));

    try {
      await dispatch(toggleSaveEvent(_id)).unwrap();
    } catch {
      setSaved((prev) => !prev); // revert on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link
      to={`/explore-events/${slug}-${_id}`}
      className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col ${className}`}
    >
      {/* Banner */}
      <div className="relative h-44 overflow-hidden bg-gray-100 flex-shrink-0">
        {bannerImage?.url ? (
          <img
            src={bannerImage.url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
            <Calendar className="w-10 h-10 text-indigo-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {isFeatured && (
            <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          {soldOut && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          aria-label={saved ? "Remove from saved" : "Save event"}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors disabled:opacity-60"
        >
          {saved ? (
            <BookmarkCheck className="w-4 h-4 text-indigo-600" />
          ) : (
            <Bookmark className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Category */}
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${categoryColor}`}>
          <Tag className="w-3 h-3" />
          {category}
        </span>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{formatDate(startDate)}{startTime && ` · ${startTime}`}</span>
        </div>

        {/* Venue */}
        {(venueName || city) && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{venueName ? `${venueName}${city ? `, ${city}` : ""}` : city}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <span className={`font-semibold text-sm ${isFree || price === 0 ? "text-green-600" : "text-gray-900"}`}>
            {formatPrice(price, isFree, currency)}
          </span>

          {attendeeCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="w-3.5 h-3.5" />
              {attendeeCount.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;