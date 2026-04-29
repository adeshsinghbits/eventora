import React from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiUser,
  FiMapPin,
  FiShield,
  FiAward,
  FiUsers,
  FiCalendar,
  FiStar,
  FiEdit,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import Spinner from "../../components/ui/Spinner";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <Spinner />
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-700 p-8 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center text-5xl font-bold uppercase">
              {user.fullName?.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold">{user.fullName}</h1>
              <p className="text-lg text-white/80">@{user.username}</p>

              <div className="mt-3 flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  {user.role}
                </span>

                {user.isVerified && (
                  <span className="px-3 py-1 bg-green-500 rounded-full text-sm">
                    Verified
                  </span>
                )}

                {user.isBlocked && (
                  <span className="px-3 py-1 bg-red-500 rounded-full text-sm">
                    Blocked
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <button className="px-5 py-3 rounded-xl bg-white text-black font-semibold flex items-center gap-2 hover:scale-105 transition">
              <FiEdit />
              Edit Profile
            </button>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-900 rounded-2xl p-6 border border-slate-800"
            >
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-slate-300">
                {user.bio || "No bio added yet."}
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-6 text-sm">
                <div className="flex items-center gap-3">
                  <FiMail />
                  {user.email}
                </div>

                <div className="flex items-center gap-3">
                  <FiCalendar />
                  Joined {joinDate}
                </div>

                <div className="flex items-center gap-3">
                  <FiShield />
                  Email Verified: {user.emailVerified ? "Yes" : "No"}
                </div>

                <div className="flex items-center gap-3">
                  <FiMapPin />
                  {user.location?.type || "No location"}
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  title: "Followers",
                  value: user.followers?.length || 0,
                  icon: <FiUsers />,
                },
                {
                  title: "Following",
                  value: user.following?.length || 0,
                  icon: <FiUsers />,
                },
                {
                  title: "Events",
                  value: user.createdEvents?.length || 0,
                  icon: <FiCalendar />,
                },
                {
                  title: "Points",
                  value: user.points || 0,
                  icon: <FiStar />,
                },
              ].map((item, i) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={i}
                  className="bg-slate-900 rounded-2xl p-5 border border-slate-800"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-slate-400 text-sm">{item.title}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            {/* Reputation */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-bold mb-4">Reputation</h2>

              <div className="space-y-3 text-sm">
                <p className="flex justify-between">
                  <span>Login Count</span>
                  <span>{user.loginCount}</span>
                </p>

                <p className="flex justify-between">
                  <span>Unread Notifications</span>
                  <span>{user.unreadNotifications}</span>
                </p>

                <p className="flex justify-between">
                  <span>Reports</span>
                  <span>{user.reportsCount}</span>
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiAward />
                Badges
              </h2>

              {user.badges?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-purple-600 text-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No badges yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}