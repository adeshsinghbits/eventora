import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FiCalendar, FiMapPin, FiUsers, FiEdit2, FiTrash2,
  FiBookmark, FiClock, FiPlus, FiFilter, FiGrid,
  FiList, FiChevronRight, FiXCircle, FiCheckCircle,
  FiLoader, FiSearch, FiX,
} from "react-icons/fi";
import { MdEventAvailable } from "react-icons/md";
import {
  fetchMyEvents,
  fetchAttendingEvents,
  fetchSavedEvents,
  deleteEvent,
  cancelAttendance,
  toggleSaveEvent,
} from "../../features/event/eventSlice";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtPrice = (price, isFree) => (isFree || price === 0 ? "Free" : `$${price}`);

const isUpcoming = (d) => d && new Date(d) >= new Date();
const isPast = (d) => d && new Date(d) < new Date();

const STATUS_META = {
  published:  { label: "Published",  cls: "bg-green-900/30 text-green-400 border-green-800/50" },
  draft:      { label: "Draft",      cls: "bg-slate-700 text-slate-400 border-slate-600" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-900/30 text-red-400 border-red-800/50" },
  completed:  { label: "Completed",  cls: "bg-blue-900/30 text-blue-400 border-blue-800/50" },
  pending:    { label: "Pending",    cls: "bg-amber-900/30 text-amber-400 border-amber-800/50" },
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const cardAnim = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmLabel, loading }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.16 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-900/30 flex items-center justify-center mb-4">
            <FiTrash2 size={20} className="text-red-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button
              onClick={onConfirm} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <FiLoader size={14} className="animate-spin" /> : confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const CardSkeleton = () => (
  <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-40 bg-slate-700/60" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-slate-700 rounded w-1/4" />
      <div className="h-5 bg-slate-700 rounded w-3/4" />
      <div className="h-4 bg-slate-700 rounded w-1/2" />
      <div className="h-4 bg-slate-700 rounded w-2/3" />
      <div className="flex justify-between pt-1">
        <div className="h-6 bg-slate-700 rounded w-16" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-700 rounded-xl" />
          <div className="h-8 w-8 bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

const ListRowSkeleton = () => (
  <div className="flex items-center gap-4 px-4 py-4 animate-pulse border-b border-slate-700/40 last:border-0">
    <div className="w-16 h-16 bg-slate-700 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-700 rounded w-2/3" />
      <div className="h-3 bg-slate-700 rounded w-1/3" />
      <div className="h-3 bg-slate-700 rounded w-1/2" />
    </div>
    <div className="flex gap-2 flex-shrink-0">
      <div className="h-8 w-8 bg-slate-700 rounded-xl" />
      <div className="h-8 w-8 bg-slate-700 rounded-xl" />
    </div>
  </div>
);

const EmptyState = ({ icon: Icon = MdEventAvailable, title, subtitle, action, onAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-800/30 flex items-center justify-center mb-4">
      <Icon size={28} className="text-purple-400" />
    </div>
    <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-xs mb-5">{subtitle}</p>
    {action && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <FiPlus size={15} />
        {action}
      </button>
    )}
  </motion.div>
);

const HostedCard = ({ event, onDelete, onEdit }) => {
  const { _id, slug, title, bannerImage, startDate, startTime, city, country,
          isFree, price, status, attendees, totalSeats, availableSeats, viewsCount } = event;

  const meta = STATUS_META[status] || STATUS_META.draft;
  const attendeeCount = attendees?.length ?? 0;
  const pct = totalSeats ? Math.round(((totalSeats - (availableSeats ?? totalSeats)) / totalSeats) * 100) : 0;

  return (
    <motion.div variants={cardAnim} layout className="bg-slate-800/70 border border-slate-700/60 rounded-2xl overflow-hidden flex flex-col group hover:border-purple-700/40 transition-colors">
      {/* Banner */}
      <Link to={`/events/${slug || _id}`} className="relative h-40 bg-slate-700/50 overflow-hidden block flex-shrink-0">
        {bannerImage?.url ? (
          <img src={bannerImage.url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiCalendar className="text-slate-600" size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.cls}`}>
            {meta.label}
          </span>
        </div>
        {/* Price */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isFree || price === 0 ? "bg-green-900/60 text-green-400" : "bg-slate-900/70 text-white"}`}>
            {fmtPrice(price, isFree)}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <Link to={`/events/${slug || _id}`}>
          <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-purple-400 transition-colors leading-snug">
            {title}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <FiClock size={11} />
          {fmtDate(startDate)}{startTime ? `, ${startTime}` : ""}
        </div>

        {(city || country) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FiMapPin size={11} />
            {[city, country].filter(Boolean).join(", ")}
          </div>
        )}

        {/* Capacity bar */}
        {totalSeats && (
          <div className="mt-1">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1"><FiUsers size={10} /> {attendeeCount} attending</span>
              <span>{pct}% full</span>
            </div>
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-purple-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats + Actions */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/50">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {viewsCount > 0 && <span>{viewsCount.toLocaleString()} views</span>}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(event)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-700/60 hover:bg-purple-600/20 text-slate-400 hover:text-purple-400 transition-colors"
              title="Edit event"
            >
              <FiEdit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(event)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-700/60 hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition-colors"
              title="Delete event"
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EventListRow = ({ event, onAction, actionIcon: ActionIcon, actionLabel, actionDanger = false }) => {
  const { _id, slug, title, bannerImage, startDate, startTime, city, country,
          isFree, price, status, organizer } = event;

  const meta = STATUS_META[status] || STATUS_META.draft;
  const upcoming = isUpcoming(startDate);

  return (
    <motion.div variants={cardAnim} layout className="flex items-center gap-4 px-4 py-4 border-b border-slate-700/40 last:border-0 hover:bg-slate-700/20 transition-colors group">
      {/* Thumbnail */}
      <Link to={`/events/${slug || _id}`} className="w-16 h-16 rounded-xl overflow-hidden bg-slate-700/50 flex-shrink-0">
        {bannerImage?.url ? (
          <img src={bannerImage.url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiCalendar className="text-slate-600" size={18} />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta.cls}`}>
            {meta.label}
          </span>
          {upcoming && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-400 border border-purple-800/40">
              Upcoming
            </span>
          )}
        </div>

        <Link to={`/events/${slug || _id}`}>
          <p className="text-sm font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
            {title}
          </p>
        </Link>

        <div className="flex flex-wrap items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <FiClock size={10} />
            {fmtDate(startDate)}{startTime ? `, ${startTime}` : ""}
          </span>
          {(city || country) && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <FiMapPin size={10} />
              {[city, country].filter(Boolean).join(", ")}
            </span>
          )}
          <span className={`text-xs font-medium ${isFree || price === 0 ? "text-green-500" : "text-slate-400"}`}>
            {fmtPrice(price, isFree)}
          </span>
        </div>

        {organizer?.name && (
          <p className="text-xs text-slate-600 mt-0.5">by {organizer.name}</p>
        )}
      </div>

      {/* Action + detail link */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onAction(event)}
          title={actionLabel}
          className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors
            ${actionDanger
              ? "bg-slate-700/60 hover:bg-red-600/20 text-slate-400 hover:text-red-400"
              : "bg-slate-700/60 hover:bg-purple-600/20 text-slate-400 hover:text-purple-400"}`}
        >
          <ActionIcon size={13} />
        </button>
        <Link
          to={`/events/${slug || _id}`}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-700/60 hover:bg-slate-600/60 text-slate-400 hover:text-white transition-colors"
        >
          <FiChevronRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
};

const TABS = [
  { id: "hosted",    label: "Hosted",    icon: FiCalendar },
  { id: "attending", label: "Attending", icon: FiCheckCircle },
  { id: "saved",     label: "Saved",     icon: FiBookmark },
];

const STATUS_FILTERS = ["all", "published", "draft", "cancelled", "completed"];

export default function MyEventsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((s) => s.auth);
  const { myEvents, attendingEvents, savedEvents, userListLoading } = useSelector((s) => s.events);

  const [activeTab, setActiveTab] = useState("hosted");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [confirmModal, setConfirmModal] = useState(null); // { type, event }
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    dispatch(fetchMyEvents());
    dispatch(fetchAttendingEvents());
    dispatch(fetchSavedEvents());
  }, [user?._id, dispatch]);

  const filtered = useMemo(() => {
    let list = activeTab === "hosted" ? myEvents
             : activeTab === "attending" ? attendingEvents
             : savedEvents;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.city?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((e) => e.status === statusFilter);
    }

    return list;
  }, [activeTab, myEvents, attendingEvents, savedEvents, search, statusFilter]);

  const stats = useMemo(() => ({
    hosted:    myEvents.length,
    attending: attendingEvents.length,
    saved:     savedEvents.length,
    upcoming:  myEvents.filter((e) => isUpcoming(e.startDate) && e.status === "published").length,
  }), [myEvents, attendingEvents, savedEvents]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      await dispatch(deleteEvent(confirmModal.event._id)).unwrap();
      setConfirmModal(null);
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setActionLoading(false);
    }
  }, [confirmModal, dispatch]);

  const handleCancelAttendance = useCallback(async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      await dispatch(cancelAttendance(confirmModal.event._id)).unwrap();
      setConfirmModal(null);
      dispatch(fetchAttendingEvents()); // refresh list
    } catch {
      toast.error("Failed to cancel attendance");
    } finally {
      setActionLoading(false);
    }
  }, [confirmModal, dispatch]);

  const handleUnsave = useCallback(async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      await dispatch(toggleSaveEvent(confirmModal.event._id)).unwrap();
      setConfirmModal(null);
      dispatch(fetchSavedEvents());
    } catch {
      toast.error("Failed to remove event");
    } finally {
      setActionLoading(false);
    }
  }, [confirmModal, dispatch]);

  const modalConfig = {
    delete:  { title: "Delete event?", message: "This will permanently delete the event and all RSVPs. This cannot be undone.", confirmLabel: "Delete", onConfirm: handleDeleteConfirm },
    cancel:  { title: "Cancel attendance?", message: "You'll be removed from the attendee list and your spot may be taken.", confirmLabel: "Cancel RSVP", onConfirm: handleCancelAttendance },
    unsave:  { title: "Remove from saved?", message: "This event will be removed from your saved list.", confirmLabel: "Remove", onConfirm: handleUnsave },
  };

  const activeModal = confirmModal ? modalConfig[confirmModal.type] : null;

  const renderContent = () => {
    if (userListLoading) {
      return viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
          {[1,2,3,4].map((i) => <ListRowSkeleton key={i} />)}
        </div>
      );
    }

    if (filtered.length === 0) {
      const empties = {
        hosted:    { title: "No events yet", subtitle: "Create your first event and start building your community.", action: "Create Event", onAction: () => navigate("/create-event") },
        attending: { title: "Not attending anything", subtitle: "Browse events near you and RSVP to ones you like.", action: "Explore Events", onAction: () => navigate("/explore") },
        saved:     { title: "Nothing saved", subtitle: "Tap the bookmark icon on any event to save it for later.", action: "Browse Events", onAction: () => navigate("/explore") },
      };
      const e = empties[activeTab];
      return <EmptyState icon={FiCalendar} title={search ? `No results for "${search}"` : e.title} subtitle={search ? "Try a different search term." : e.subtitle} action={!search && e.action} onAction={e.onAction} />;
    }

    if (activeTab === "hosted" && viewMode === "grid") {
      return (
        <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((event) => (
              <HostedCard
                key={event._id}
                event={event}
                onDelete={(e) => setConfirmModal({ type: "delete", event: e })}
                onEdit={(e) => navigate(`/my-events/${e._id}/edit`)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      );
    }

    return (
      <motion.div variants={container} initial="hidden" animate="visible"
        className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((event) => {
            if (activeTab === "hosted") {
              return (
                <EventListRow
                  key={event._id}
                  event={event}
                  onAction={(e) => navigate(`/events/${e.slug || e._id}/edit`)}
                  actionIcon={FiEdit2}
                  actionLabel="Edit"
                />
              );
            }
            if (activeTab === "attending") {
              return (
                <EventListRow
                  key={event._id}
                  event={event}
                  onAction={(e) => setConfirmModal({ type: "cancel", event: e })}
                  actionIcon={FiXCircle}
                  actionLabel="Cancel RSVP"
                  actionDanger
                />
              );
            }
            return (
              <EventListRow
                key={event._id}
                event={event}
                onAction={(e) => setConfirmModal({ type: "unsave", event: e })}
                actionIcon={FiBookmark}
                actionLabel="Remove from saved"
                actionDanger
              />
            );
          })}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 pb-16">

      {/* ── Header ── */}
      <div className="border-b border-slate-700/60 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Events</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage everything in one place</p>
          </div>
          <button
            onClick={() => navigate("/create-event")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex-shrink-0"
          >
            <FiPlus size={15} />
            Create Event
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: "Events Hosted",    value: stats.hosted,    color: "text-purple-400", bg: "bg-purple-900/20 border-purple-800/30" },
            { label: "Attending",         value: stats.attending, color: "text-green-400",  bg: "bg-green-900/20 border-green-800/30" },
            { label: "Saved",             value: stats.saved,     color: "text-amber-400",  bg: "bg-amber-900/20 border-amber-800/30" },
            { label: "Upcoming Hosted",   value: stats.upcoming,  color: "text-blue-400",   bg: "bg-blue-900/20 border-blue-800/30" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} border rounded-2xl px-4 py-3`}>
              {userListLoading ? (
                <div className="h-7 w-10 bg-slate-700 rounded animate-pulse mb-1" />
              ) : (
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              )}
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-1.5 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => {
            const count = id === "hosted" ? stats.hosted : id === "attending" ? stats.attending : stats.saved;
            return (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setStatusFilter("all"); setSearch(""); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${activeTab === id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
              >
                <Icon size={14} />
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-white/20" : "bg-slate-700 text-slate-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Toolbar: search + status filter + view toggle ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="w-full pl-8 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* Status filter — only relevant for hosted */}
          {activeTab === "hosted" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <FiFilter size={13} className="text-slate-500 flex-shrink-0" />
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize
                    ${statusFilter === s
                      ? "bg-purple-600/20 text-purple-400 border border-purple-600/40"
                      : "bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-500 hover:text-white"}`}
                >
                  {s === "all" ? "All" : STATUS_META[s]?.label ?? s}
                </button>
              ))}
            </div>
          )}

          {/* View toggle — grid only for hosted */}
          {activeTab === "hosted" && (
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white"}`}
              >
                <FiGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white"}`}
              >
                <FiList size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Result count ── */}
        {!userListLoading && filtered.length > 0 && (
          <p className="text-xs text-slate-600">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            {search ? ` matching "${search}"` : ""}
            {statusFilter !== "all" ? ` · ${STATUS_META[statusFilter]?.label}` : ""}
          </p>
        )}

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${statusFilter}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Confirm Modal ── */}
      {activeModal && (
        <ConfirmModal
          open={!!confirmModal}
          onClose={() => setConfirmModal(null)}
          onConfirm={activeModal.onConfirm}
          title={activeModal.title}
          message={activeModal.message}
          confirmLabel={activeModal.confirmLabel}
          loading={actionLoading}
        />
      )}
    </div>
  );
}