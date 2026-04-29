import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiTrendingUp,
  FiCalendar,
  FiUsers,
  FiBookmark,
  FiBarChart,
  FiDollarSign,
  FiPlus,
  FiEdit3,
  FiBarChart2,
  FiCompass,
} from "react-icons/fi";
import RecentEventCard from "../../components/RecentEventCard";
import "../.././index.css";
import Spinner from "../../components/ui/Spinner";

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { stats, upcomingEvents, recentActivity } = useSelector((state) => state.dashboard);
  console.log(user);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (!user) {
    return <Spinner/>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-transparent border border-gray-200 shadow-sm"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -ml-32 -mb-32 animate-pulse" />
        </div>

        <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
            <h1 className="text-3xl text-white md:text-4xl font-bold mb-3">
              Welcome back, <span className="text-purple-500">{user.fullName}</span>
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-lg">
              You're doing great! Your events are engaging the community. Keep creating amazing experiences.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Upcoming Events */}
      <div>
        <motion.h2 variants={itemVariants} className="text-lg rounded-lg px-2 border border-purple-500  text-purple-500 font-medium mb-4 inline-block items-center gap-2">
          <p className="block">Your Upcoming Events</p>
        </motion.h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => <RecentEventCard key={event.id} event={event} />)
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full text-center py-16"
            >
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Upcoming Events</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first event to get started!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/create-event")}
                className="inline-flex items-center gap-2 px-6 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-shadow"
              >
                <FiPlus size={18} />
                Create First Event
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm p-6"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="text-xl shrink-0">{activity.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-linear-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 shadow-sm p-6"
        >
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">💡 Quick Tips</h2>
          <div className="space-y-3">
            <motion.div
              whileHover={{ x: 4 }}
              className="p-3 bg-white dark:bg-slate-800 rounded-xl"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Add more details to your event
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Better descriptions lead to more RSVPs
              </p>
            </motion.div>
            <motion.div
              whileHover={{ x: 4 }}
              className="p-3 bg-white dark:bg-slate-800 rounded-xl"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Share on social media
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Reach more people in your community
              </p>
            </motion.div>
            <motion.div
              whileHover={{ x: 4 }}
              className="p-3 bg-white dark:bg-slate-800 rounded-xl"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Engage with your attendees
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Respond to messages and build community
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}