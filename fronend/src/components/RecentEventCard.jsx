import { motion } from "framer-motion";
import { FiUsers, FiMapPin, FiCalendar, FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function RecentEventCard({ event }) {
  const navigate = useNavigate();

  const categoryColors = {
    tech: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    music: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
    sports: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    business: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    food: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    education: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    festival: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    meetup: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-48 bg-slate-700">
        <motion.img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          whileHover={{ scale: 1.1 }}
        />

        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
            categoryColors[event.category] || categoryColors.meetup
          }`}
        >
          {event.category}
        </motion.div>

        {/* Edit Button */}
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(`/edit-event/${event.id}`)}
          className="absolute top-3 right-3 p-2 bg-white dark:bg-slate-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          <FiEdit2 size={18} className="text-gray-700 dark:text-gray-300" />
        </motion.button>

        {/* Date Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-3 right-3 px-3 py-1 bg-white dark:bg-slate-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white shadow-md"
        >
          {formatDate(event.date)}
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
        >
          {event.title}
        </motion.h3>

        {/* Date & Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3"
        >
          <FiCalendar size={16} />
          <span>
            {formatDate(event.date)} at {event.time}
          </span>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4"
        >
          <FiMapPin size={16} />
          <span className="truncate">{event.location}</span>
        </motion.div>

        {/* Attendees */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <FiUsers size={16} />
            <span>{event.attendees} attending</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/event/${event.id}`)}
            className="flex-1 px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-shadow"
          >
            View Details
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}