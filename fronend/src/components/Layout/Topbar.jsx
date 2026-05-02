import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  FiSearch,
  FiBell,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";

import AvatarLogo from "../../assets/avatarLogo.png";
import { openMobileSidebar } from "../../features/ui/uiSlice";
import { logout } from "../../features/auth/authThunks";

export default function Topbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user);
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
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 h-20 z-30 flex items-center justify-between px-4 md:px-6 border-b transition-all duration-300
      ${sidebarOpen ? "lg:left-72" : "lg:left-24"}
      bg-slate-900/90 backdrop-blur-xl`}
    >
      {/* LEFT */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => dispatch(openMobileSidebar())}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <FiMenu size={20} />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-3 w-full max-w-md px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search events, organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-sm dark:text-white"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 md:gap-4">
        {user ? (
          <>
            {/* Create Event */}
            <NavLink
              to="/create-event"
              className="hidden sm:flex px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white"
            >
              + Create Event
            </NavLink>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-lg text-white cursor-pointer"
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
                    <div className="p-4 font-semibold border-b dark:text-white">
                      Notifications
                    </div>

                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border-b text-sm border-gray-100 dark:border-slate-700"
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

            {/* USER DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <img
                  src={user?.avatar?.url || AvatarLogo}
                  alt="user"
                  className="w-9 h-9 rounded-full object-cover"
                />

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold dark:text-white">
                    {user?.fullName}
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
                    className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white dark:bg-slate-800 border"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <>
            {/* NOT LOGGED IN */}
            <NavLink
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600"
            >
              Login
            </NavLink>

            <NavLink
              to="/register"
              className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}