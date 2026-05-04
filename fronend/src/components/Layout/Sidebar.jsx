// Sidebar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import {
  FiHome,
  FiCompass,
  FiCalendar,
  FiPlus,
  FiBookmark,
  FiCheck,
  FiBell,
  FiMessageSquare,
  FiBarChart,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { FaUser } from "react-icons/fa"

import {
  toggleSidebar,
  closeMobileSidebar,
} from "../../features/ui/uiSlice";

export default function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sidebarOpen, mobileSidebarOpen } = useSelector(
    (state) => state.ui
  );

  const [hoveredItem, setHoveredItem] = useState(null);

  const user = {
    avatar: "https://i.pravatar.cc/150?img=12",
  };

  const navItems = [
    { id: 1, label: "Dashboard", icon: FiHome, path: "/user-dashboard" },
    { id: 2, label: "Profile", icon: FaUser, path: "/profile" },
    { id: 3, label: "Explore Events", icon: FiCompass, path: "/explore-events" },
    { id: 4, label: "My Events", icon: FiCalendar, path: "/my-events" },
    { id: 5, label: "Create Event", icon: FiPlus, path: "/create-event" },
    { id: 8, label: "Notifications", icon: FiBell, path: "/notifications" },
    { id: 9, label: "Messages", icon: FiMessageSquare, path: "/messages" },
    { id: 11, label: "Settings", icon: FiSettings, path: "/settings" },
    { id: 12, label: "Help", icon: FiHelpCircle, path: "/helpdesk" },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen z-40 flex-col transition-all duration-300
        ${
          sidebarOpen ? "w-72" : "w-24"
        }
        bg-slate-900 `}
      >
        {/* Header */}
        <div className="h-20 px-5 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-2xl font-bold text-white">
              Eventora
            </h1>
          )}

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg hover:bg-slate-800 text-white"
          >
            {sidebarOpen ? (
              <FiChevronLeft size={18} />
            ) : (
              <FiChevronRight size={18} />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-custom">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl relative group transition-all
                  ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={20} />

                {sidebarOpen && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}

                {!sidebarOpen && hoveredItem === item.id && (
                  <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-black text-white rounded whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(closeMobileSidebar())}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 h-screen w-72 z-50 flex flex-col bg-slate-900 lg:hidden"
            >
              <div className="h-20 px-5 border-b flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  Eventora
                </h1>

                <button
                  onClick={() => dispatch(closeMobileSidebar())}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <FiX size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-custom">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={() => dispatch(closeMobileSidebar())}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3 rounded-xl
                        ${
                          isActive
                            ? "bg-purple-600 text-black"
                            : "hover:bg-gray-800 text-white"
                        }`
                      }
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}