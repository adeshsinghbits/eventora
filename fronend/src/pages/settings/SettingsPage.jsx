import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FiUser, FiLock, FiBell, FiEye, FiSun, FiAlertTriangle,
  FiChevronRight, FiCheck, FiCamera, FiTrash2, FiLogOut,
  FiShield, FiGlobe, FiMail, FiSmartphone, FiSave,
  FiLoader, FiMoon, FiMonitor,
} from "react-icons/fi";
import { uploadAvatar, updateProfile } from "../../features/proflie/profileSlice";
import { changeUserPassword } from "../../features/auth/authThunks";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.32, delay: i * 0.06 },
  }),
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const Toggle = ({ checked, onChange, disabled = false }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 flex-shrink-0
      ${checked ? "bg-purple-600" : "bg-slate-600"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
      ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
  </button>
);

const Section = ({ title, description, icon: Icon, children, index = 0 }) => (
  <motion.section
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden"
  >
    <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-purple-400" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="divide-y divide-slate-700/40">{children}</div>
  </motion.section>
);

const Row = ({ label, description, children, onClick, danger = false }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between gap-4 px-6 py-4 
      ${onClick ? "cursor-pointer hover:bg-slate-700/30 transition-colors" : ""}
      ${danger ? "hover:bg-red-900/10" : ""}`}
  >
    <div className="min-w-0">
      <p className={`text-sm font-medium ${danger ? "text-red-400" : "text-gray-200"}`}>{label}</p>
      {description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <div className="flex-shrink-0 flex items-center gap-2">{children}</div>
  </div>
);

const inputCls = "w-full px-3 py-2.5 bg-slate-700/60 border border-slate-600 rounded-xl text-gray-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-colors";

const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = true, loading = false }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? "bg-red-900/30" : "bg-purple-900/30"}`}>
            <FiAlertTriangle size={22} className={danger ? "text-red-400" : "text-purple-400"} />
          </div>
          <h3 className="text-base font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-600 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50
                ${danger ? "bg-red-600 hover:bg-red-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}`}
            >
              {loading ? <FiLoader size={14} className="animate-spin" /> : confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const NAV_ITEMS = [
  { id: "account",       label: "Account",       icon: FiUser },
  { id: "security",      label: "Security",      icon: FiLock },
  { id: "notifications", label: "Notifications", icon: FiBell },
  { id: "privacy",       label: "Privacy",       icon: FiEye },
  { id: "danger",        label: "Danger Zone",   icon: FiAlertTriangle, danger: true },
];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [activeSection, setActiveSection] = useState("account");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // "logout" | "delete"
  const [modalLoading, setModalLoading] = useState(false);

  const [account, setAccount] = useState({
    fullName: user?.fullName || user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    website: user?.website || "",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const [notifs, setNotifs] = useState({
    emailNewFollower: true,
    emailEventReminder: true,
    emailEventUpdates: true,
    emailMarketing: false,
    pushNewFollower: true,
    pushEventReminder: true,
    pushEventUpdates: false,
    pushMarketing: false,
    smsReminder: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",   
    showAttending: true,
    showSaved: false,
    showFollowers: true,
    allowTagging: true,
    dataCollection: true,
  });

  const avatarRef = useRef(null);
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    dispatch(uploadAvatar(file));
    toast.success("Avatar updated!"); 
  };

  const saveAccount = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfile(account)).unwrap();
      await new Promise((r) => setTimeout(r, 800)); 
      toast.success("Account updated");
    } catch {
      toast.error("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!security.currentPassword) return toast.error("Enter your current password");
    if (security.newPassword.length < 8) return toast.error("New password must be at least 8 characters");
    if (security.newPassword !== security.confirmPassword) return toast.error("Passwords don't match");
    setSaving(true);
    try {
      await dispatch(changeUserPassword(security)).unwrap();
      await new Promise((r) => setTimeout(r, 800));
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed");
    } catch {
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const saveNotifs = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Notification preferences saved");
  };

  const savePrivacy = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Privacy settings saved");
  };

  const handleLogout = async () => {
    setModalLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // dispatch(logout());
    setModalLoading(false);
    setModal(null);
    toast.success("Logged out");
  };

  const handleDeleteAccount = async () => {
    setModalLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    // dispatch(deleteAccount());
    setModalLoading(false);
    setModal(null);
    toast.success("Account deleted");
  };

  const toggle = (setter) => (key) => (val) =>
    setter((prev) => ({ ...prev, [key]: val }));

  const renderSection = () => {
    switch (activeSection) {

      case "account":
        return (
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
            {/* Avatar */}
            <Section title="Profile Photo" icon={FiCamera} index={0}>
              <div className="px-6 py-5 flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-purple-900/40 border-2 border-purple-600/30">
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-purple-400">
                        {(user?.fullName || user?.name || "U")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
                  >
                    <FiCamera size={12} className="text-white" />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{user?.fullName || user?.name}</p>
                  <p className="text-xs text-slate-500 mb-3">JPG, PNG or WEBP · Max 5 MB</p>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    className="text-xs px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-colors"
                  >
                    Upload new photo
                  </button>
                </div>
              </div>
            </Section>

            {/* Profile details */}
            <Section title="Profile Details" icon={FiUser} index={1}>
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input value={account.fullName} onChange={(e) => setAccount((p) => ({ ...p, fullName: e.target.value }))} className={inputCls} placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                    <input value={account.username} onChange={(e) => setAccount((p) => ({ ...p, username: e.target.value }))} className={`${inputCls} pl-7`} placeholder="username" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                  <input type="email" value={account.email} onChange={(e) => setAccount((p) => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
                  <input type="tel" value={account.phone} onChange={(e) => setAccount((p) => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+91 98765 43210" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
                  <textarea value={account.bio} onChange={(e) => setAccount((p) => ({ ...p, bio: e.target.value }))} rows={3} className={`${inputCls} resize-none`} placeholder="Tell people a little about yourself…" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Website</label>
                  <input value={account.website} onChange={(e) => setAccount((p) => ({ ...p, website: e.target.value }))} className={inputCls} placeholder="https://yourwebsite.com" />
                </div>
              </div>
              <div className="px-6 pb-5">
                <button onClick={saveAccount} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {saving ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
                  Save Changes
                </button>
              </div>
            </Section>
          </motion.div>
        );

      case "security":
        return (
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
            <Section title="Change Password" icon={FiLock} index={0} description="Use a strong password with 8+ characters">
              <div className="px-6 py-5 space-y-4">
                {[
                  { key: "currentPassword", label: "Current Password" },
                  { key: "newPassword",     label: "New Password" },
                  { key: "confirmPassword", label: "Confirm New Password" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={security[key]}
                      onChange={(e) => setSecurity((p) => ({ ...p, [key]: e.target.value }))}
                      className={inputCls}
                      placeholder="••••••••"
                    />
                  </div>
                ))}
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <Toggle checked={showPasswords} onChange={setShowPasswords} />
                  Show passwords
                </label>
              </div>
              <div className="px-6 pb-5">
                <button onClick={savePassword} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {saving ? <FiLoader size={14} className="animate-spin" /> : <FiShield size={14} />}
                  Update Password
                </button>
              </div>
            </Section>

            <Section title="Active Sessions" icon={FiMonitor} index={1} description="Devices currently signed in to your account">
              {[
                { device: "Chrome · Windows 11", location: "Delhi, IN", current: true, time: "Now" },
                { device: "Safari · iPhone 15",   location: "Delhi, IN", current: false, time: "2 days ago" },
              ].map((session, i) => (
                <Row
                  key={i}
                  label={session.device}
                  description={`${session.location} · ${session.time}`}
                >
                  {session.current ? (
                    <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full border border-green-800/50">
                      Current
                    </span>
                  ) : (
                    <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                      Revoke
                    </button>
                  )}
                </Row>
              ))}
            </Section>

            <Section title="Two-Factor Authentication" icon={FiSmartphone} index={2} description="Add an extra layer of security to your account">
              <Row label="Authenticator App" description="Use an app like Google Authenticator">
                <span className="text-xs text-slate-500 mr-2">Not set up</span>
                <button className="text-xs px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-colors">
                  Set up
                </button>
              </Row>
              <Row label="SMS Verification" description="Receive codes by text message">
                <Toggle checked={false} onChange={() => toast("Coming soon")} />
              </Row>
            </Section>
          </motion.div>
        );

      case "notifications":
        return (
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
            {[
              {
                title: "Email Notifications", icon: FiMail, index: 0,
                rows: [
                  { key: "emailNewFollower",  label: "New follower",      desc: "When someone follows you" },
                  { key: "emailEventReminder",label: "Event reminders",   desc: "24 hours before an event you're attending" },
                  { key: "emailEventUpdates", label: "Event updates",     desc: "Changes to events you're attending" },
                  { key: "emailMarketing",    label: "Tips & promotions", desc: "Product news and featured events" },
                ],
              },
              {
                title: "Push Notifications", icon: FiBell, index: 1,
                rows: [
                  { key: "pushNewFollower",  label: "New follower",    desc: "Real-time follower alerts" },
                  { key: "pushEventReminder",label: "Event reminders", desc: "Reminder notifications" },
                  { key: "pushEventUpdates", label: "Event changes",   desc: "Cancellations and updates" },
                  { key: "pushMarketing",    label: "Promotions",      desc: "Deals and featured events" },
                ],
              },
              {
                title: "SMS Notifications", icon: FiSmartphone, index: 2,
                rows: [
                  { key: "smsReminder", label: "Event reminders", desc: "Text message 2 hours before event" },
                ],
              },
            ].map(({ title, icon, index, rows }) => (
              <Section key={title} title={title} icon={icon} index={index}>
                {rows.map(({ key, label, desc }) => (
                  <Row key={key} label={label} description={desc}>
                    <Toggle checked={notifs[key]} onChange={toggle(setNotifs)(key)} />
                  </Row>
                ))}
              </Section>
            ))}
            <div className="flex justify-end">
              <button onClick={saveNotifs} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {saving ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
                Save Preferences
              </button>
            </div>
          </motion.div>
        );

      case "privacy":
        return (
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
            <Section title="Profile Visibility" icon={FiGlobe} index={0} description="Control who can see your profile">
              <div className="px-6 py-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "public",    label: "Public",    desc: "Anyone" },
                    { value: "followers", label: "Followers", desc: "Only followers" },
                    { value: "private",   label: "Private",   desc: "Only you" },
                  ].map(({ value, label, desc }) => (
                    <button
                      key={value}
                      onClick={() => setPrivacy((p) => ({ ...p, profileVisibility: value }))}
                      className={`relative flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-center transition-all
                        ${privacy.profileVisibility === value
                          ? "border-purple-500 bg-purple-600/15 text-purple-300"
                          : "border-slate-600 text-slate-400 hover:border-slate-500"}`}
                    >
                      {privacy.profileVisibility === value && (
                        <FiCheck size={11} className="absolute top-2 right-2 text-purple-400" />
                      )}
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-xs opacity-60">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="Activity Privacy" icon={FiEye} index={1}>
              {[
                { key: "showAttending", label: "Show events I'm attending", desc: "Visible on your profile" },
                { key: "showSaved",     label: "Show saved events",         desc: "Your saved list is visible to others" },
                { key: "showFollowers", label: "Show followers & following", desc: "Others can see your network" },
                { key: "allowTagging",  label: "Allow tagging in events",   desc: "Organisers can tag you as attending" },
              ].map(({ key, label, desc }) => (
                <Row key={key} label={label} description={desc}>
                  <Toggle checked={privacy[key]} onChange={toggle(setPrivacy)(key)} />
                </Row>
              ))}
            </Section>

            <Section title="Data & Analytics" icon={FiShield} index={2}>
              <Row
                label="Usage analytics"
                description="Help improve the app by sharing anonymous usage data"
              >
                <Toggle checked={privacy.dataCollection} onChange={toggle(setPrivacy)("dataCollection")} />
              </Row>
              <Row label="Download my data" description="Get a copy of all your data">
                <button
                  onClick={() => toast("Download request submitted — you'll get an email shortly.")}
                  className="text-xs px-3 py-1.5 bg-slate-700 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Request
                </button>
              </Row>
            </Section>

            <div className="flex justify-end">
              <button onClick={savePrivacy} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {saving ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
                Save Privacy Settings
              </button>
            </div>
          </motion.div>
        );

      case "danger":
        return (
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
            <div className="flex items-start gap-3 px-4 py-3 bg-red-900/20 border border-red-800/40 rounded-xl">
              <FiAlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300/80 leading-relaxed">
                Actions in this section are irreversible. Please proceed with caution.
              </p>
            </div>

            <Section title="Session" icon={FiLogOut} index={0}>
              <Row
                label="Log out of all devices"
                description="Sign out from every device except this one"
                onClick={() => {}}
              >
                <button
                  onClick={() => toast("All other sessions revoked")}
                  className="text-xs px-3 py-1.5 bg-slate-700 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Revoke all
                </button>
              </Row>
              <Row
                label="Sign out"
                description="Log out of your current session"
                danger
                onClick={() => setModal("logout")}
              >
                <FiChevronRight size={16} className="text-slate-500" />
              </Row>
            </Section>

            <Section title="Account" icon={FiTrash2} index={1}>
              <Row
                label="Deactivate account"
                description="Temporarily hide your profile and events. You can reactivate anytime."
              >
                <button
                  onClick={() => toast("Account deactivated (simulated)")}
                  className="text-xs px-3 py-1.5 bg-slate-700 text-amber-400 border border-amber-800/40 rounded-lg hover:bg-amber-900/20 transition-colors"
                >
                  Deactivate
                </button>
              </Row>
              <Row
                label="Delete account permanently"
                description="This will erase your profile, events, and all data. This cannot be undone."
                danger
                onClick={() => setModal("delete")}
              >
                <FiChevronRight size={16} className="text-slate-500" />
              </Row>
            </Section>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200">
      {/* ── Page header ── */}
      <div className="border-b border-slate-700/60 px-6 py-5">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your account, privacy and preferences</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-8">

        {/* ── Sidebar nav ── */}
        <nav className="hidden md:flex flex-col w-52 flex-shrink-0 gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, danger }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full
                ${activeSection === id
                  ? danger
                    ? "bg-red-900/20 text-red-400 border border-red-800/40"
                    : "bg-purple-600/15 text-purple-300 border border-purple-600/25"
                  : danger
                    ? "text-red-500/70 hover:bg-red-900/10 hover:text-red-400"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}`}
            >
              <Icon size={15} />
              {label}
              {activeSection === id && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${danger ? "bg-red-400" : "bg-purple-400"}`} />
              )}
            </button>
          ))}
        </nav>

        {/* ── Mobile tab bar ── */}
        <div className="md:hidden w-full mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {NAV_ITEMS.map(({ id, label, icon: Icon, danger }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0
                  ${activeSection === id
                    ? danger
                      ? "bg-red-900/30 text-red-400 border border-red-800/50"
                      : "bg-purple-600/20 text-purple-300 border border-purple-600/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"}`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Modals ── */}
      <ConfirmModal
        open={modal === "logout"}
        onClose={() => setModal(null)}
        onConfirm={handleLogout}
        title="Sign out?"
        message="You'll be signed out of your current session and redirected to the login page."
        confirmLabel="Sign out"
        loading={modalLoading}
      />
      <ConfirmModal
        open={modal === "delete"}
        onClose={() => setModal(null)}
        onConfirm={handleDeleteAccount}
        title="Delete account permanently?"
        message="All your data — profile, events, RSVPs, and followers — will be erased immediately. This action cannot be undone."
        confirmLabel="Delete forever"
        loading={modalLoading}
      />
    </div>
  );
}