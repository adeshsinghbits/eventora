// Topbar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  FiSearch,
  FiBell,
  FiMoon,
  FiSun,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";
import AvatarLogo from "../../assets/avatarLogo.png";
import {
  openMobileSidebar,
  toggleTheme,
} from "../../features/ui/uiSlice";

export default function Topbar() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { sidebarOpen } = useSelector((state) => state.ui);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifications = [
    {
      id: 1,
      message: "Tech Meetup starts in 2 hours",
      timestamp: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      message: "10 new people joined your event",
      timestamp: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      message: "Your event was approved",
      timestamp: "3 hours ago",
      unread: false,
    },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 h-20 z-30 flex items-center justify-between text-white px-4 md:px-6 border-b transition-all duration-300
      ${
        sidebarOpen ? "lg:left-72" : "lg:left-24"
      }
      bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl
      border-gray-200 dark:border-slate-800`}
    >
      {/* Left */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu */}
        <button
          onClick={() => dispatch(openMobileSidebar())}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 "
        >
          <FiMenu size={20} />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-3 w-full max-w-md px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800">
          <FiSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-sm dark:text-white"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Create Event */}
        <NavLink
          to="/create-event"
          className="hidden sm:flex px-4 py-2 rounded-xl text-sm font-medium bg-purple-700 hover:bg-purple-800 text-white"
        >
          + Create Event
        </NavLink>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <FiBell size={20} />
          </button>

          <AnimatePresence>
            {isNotificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              >
                <div className="p-4 font-semibold border-b border-gray-200 dark:border-slate-700 dark:text-white">
                  Notifications
                </div>

                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border-b text-sm ${
                      item.unread
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    } border-gray-100 dark:border-slate-700`}
                  >
                    <p className="font-medium dark:text-white">
                      {item.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.timestamp}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <img
              src={AvatarLogo || user.avatar}
              alt="user"
              className="w-9 h-9 rounded-full object-cover"
            />

            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold dark:text-white">
                {user?.fullName || "Guest"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role || "user"}
              </p>
            </div>

            <FiChevronDown size={15} />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <p className="font-semibold text-sm dark:text-white">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <FiUser size={16} />
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}