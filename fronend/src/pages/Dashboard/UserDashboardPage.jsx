import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  FiPlus, FiCompass, FiCalendar, FiUsers,
  FiBookmark, FiTrendingUp, FiClock, FiMapPin,
} from "react-icons/fi";
import {
  fetchMyEvents,
  fetchAttendingEvents,
  fetchSavedEvents,
} from "../../features/event/eventSlice";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

const fmtPrice = (price, isFree) =>
  isFree || price === 0 ? "Free" : `$${price}`;

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};

const StatCard = ({ icon: Icon, label, value, color, loading }) => (
  <motion.div
    variants={item}
    className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      {loading ? (
        <div className="h-7 w-12 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </motion.div>
);

const EventRow = ({ event }) => {
  const { _id, slug, title, startDate, startTime, city, country, isFree, price, status, bannerImage } = event;
  const statusColor = {
    published: "bg-green-100 text-green-700",
    draft: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-600",
    completed: "bg-blue-100 text-blue-700",
  }[status] ?? "bg-gray-100 text-gray-600";

  return (
    <Link
      to={`/explore-events/${slug}-${_id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-indigo-50 flex-shrink-0">
        {bannerImage?.url ? (
          <img src={bannerImage.url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiCalendar className="text-purple-700" size={18} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
          {title}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <FiClock size={11} />
            {fmtDate(startDate)}{startTime ? `, ${startTime}` : ""}
          </span>
          {(city || country) && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <FiMapPin size={11} />
              {[city, country].filter(Boolean).join(", ")}
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
          {status}
        </span>
        <span className={`text-xs font-medium ${isFree || price === 0 ? "text-green-600" : "text-gray-600"}`}>
          {fmtPrice(price, isFree)}
        </span>
      </div>
    </Link>
  );
};

const EmptyState = ({ emoji, message, sub, action, onAction }) => (
  <div className="text-center py-10">
    <div className="text-4xl mb-3">{emoji}</div>
    <p className="font-semibold text-gray-800 dark:text-white mb-1">{message}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{sub}</p>
    {action && (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAction}
        className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
      >
        <FiPlus size={15} />
        {action}
      </motion.button>
    )}
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-3 p-3 animate-pulse">
    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
    </div>
    <div className="w-16 h-5 bg-gray-200 dark:bg-slate-700 rounded-full" />
  </div>
);

export default function UserDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((s) => s.auth);
  const {
    myEvents,
    attendingEvents,
    savedEvents,
    userListLoading,
  } = useSelector((s) => s.events);

  useEffect(() => {
    if (!user?._id) return;
    dispatch(fetchMyEvents());
    dispatch(fetchAttendingEvents());
    dispatch(fetchSavedEvents());
  }, [user?._id, dispatch]);

  const now = new Date();

  const upcomingHosted = myEvents.filter(
    (e) => new Date(e.startDate) >= now && e.status === "published"
  );

  const upcomingAttending = attendingEvents.filter(
    (e) => new Date(e.startDate) >= now
  );

  const totalAttendees = myEvents.reduce(
    (sum, e) => sum + (e.totalAttendees ?? e.attendees?.length ?? 0),
    0
  );

  const recentActivity = [
    ...myEvents.slice(0, 5).map((e) => ({
      id: `created-${e._id}`,
      icon: "🎉",
      message: `You created "${e.title}"`,
      timestamp: timeAgo(e.createdAt),
      _ts: new Date(e.createdAt).getTime(),
    })),
    ...attendingEvents.slice(0, 5).map((e) => ({
      id: `rsvp-${e._id}`,
      icon: "✅",
      message: `You RSVP'd to "${e.title}"`,
      timestamp: timeAgo(e.startDate),
      _ts: new Date(e.startDate).getTime(),
    })),
  ]
    .sort((a, b) => b._ts - a._ts)
    .slice(0, 6);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ── Hero ── */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-purple-100 dark:bg-purple-900/30 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative z-10 px-8 py-10 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-indigo-500 mb-1">Dashboard</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, <span className="text-indigo-600">{user.fullName ?? user.name}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
              {upcomingHosted.length > 0
                ? `You have ${upcomingHosted.length} upcoming event${upcomingHosted.length > 1 ? "s" : ""} — keep the momentum going.`
                : "You have no upcoming events yet. Create one and get started!"}
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:border-indigo-300 transition-colors"
            >
              <FiCompass size={15} />
              Explore
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/create-event")}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <FiPlus size={15} />
              Create Event
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FiCalendar}
          label="Events Hosted"
          value={myEvents.length}
          color="bg-indigo-50 text-indigo-600"
          loading={userListLoading}
        />
        <StatCard
          icon={FiUsers}
          label="Total Attendees"
          value={totalAttendees}
          color="bg-purple-50 text-purple-600"
          loading={userListLoading}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Attending"
          value={attendingEvents.length}
          color="bg-green-50 text-green-600"
          loading={userListLoading}
        />
        <StatCard
          icon={FiBookmark}
          label="Saved"
          value={savedEvents.length}
          color="bg-amber-50 text-amber-600"
          loading={userListLoading}
        />
      </motion.div>

      {/* ── Upcoming hosted events ── */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white text-base">
            Your Upcoming Events
          </h2>
          {myEvents.length > 0 && (
            <Link to="/profile" className="text-xs text-indigo-600 hover:underline">
              See all
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          {userListLoading ? (
            <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
            </div>
          ) : upcomingHosted.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-slate-700/50 p-2">
              {upcomingHosted.slice(0, 5).map((e) => (
                <EventRow key={e._id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No Upcoming Events"
              sub="Create your first event to get started!"
              action="Create Event"
              onAction={() => navigate("/create-event")}
            />
          )}
        </div>
      </motion.div>

      {/* ── Bottom grid: Activity + Attending + Tips ── */}
      <motion.div variants={container} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <motion.div
          variants={item}
          className="lg:col-span-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm p-6"
        >
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          {userListLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((act) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/40 hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-colors"
                >
                  <div className="text-xl flex-shrink-0 leading-none mt-0.5">{act.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {act.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-8">No recent activity yet</p>
          )}
        </motion.div>

        {/* Right column */}
        <div className="flex flex-col gap-6">

          {/* Attending soon */}
          <motion.div
            variants={item}
            className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm p-5 flex-1"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">
              Attending Soon
            </h2>
            {userListLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <SkeletonRow key={i} />)}
              </div>
            ) : upcomingAttending.length > 0 ? (
              <div className="space-y-1">
                {upcomingAttending.slice(0, 4).map((e) => (
                  <Link
                    key={e._id}
                    to={`/explore-events/${e.slug}-${e._id}`}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-indigo-50 flex-shrink-0">
                      {e.bannerImage?.url ? (
                        <img src={e.bannerImage.url} alt={e.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiCalendar className="text-purple-700" size={14} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                        {e.title}
                      </p>
                      <p className="text-xs text-gray-400">{fmtDate(e.startDate)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                emoji="🗓️"
                message="Nothing yet"
                sub="Browse events and RSVP to some!"
                action="Explore"
                onAction={() => navigate("/explore-events")}
              />
            )}
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            variants={item}
            className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800 shadow-sm p-5"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">
              💡 Quick Tips
            </h2>
            <div className="space-y-2">
              {[
                { tip: "Add more details", sub: "Better descriptions → more RSVPs" },
                { tip: "Share on social media", sub: "Reach more of your community" },
                { tip: "Engage attendees", sub: "Respond to messages, build trust" },
              ].map(({ tip, sub }) => (
                <motion.div
                  key={tip}
                  whileHover={{ x: 3 }}
                  className="p-3 bg-white dark:bg-slate-800 rounded-xl"
                >
                  <p className="text-xs font-semibold text-gray-800 dark:text-white">{tip}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}