import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLayout,
  FiCalendar,
  FiBookmark,
  FiUsers,
  FiSettings,
} from 'react-icons/fi';

/**
 * ProfileTabs - Memoized tabs component
 * 
 * Optimizations:
 * - Memoized tabs array to prevent recalculation
 * - Separated tab content components for better code splitting
 * - Optimized conditional rendering
 */
const ProfileTabs = React.memo(({
  user,
  activeTab,
  onTabChange,
  createdEvents,
  attendingEvents,
  savedEvents,
  followers,
  following,
}) => {
  // Memoize tabs configuration
  const tabs = useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FiLayout size={18} aria-hidden="true" />,
    },
    {
      id: 'created',
      label: 'Created Events',
      icon: <FiCalendar size={18} aria-hidden="true" />,
      badge: createdEvents?.length || 0,
    },
    {
      id: 'attending',
      label: 'Attending',
      icon: <FiCalendar size={18} aria-hidden="true" />,
      badge: attendingEvents?.length || 0,
    },
    {
      id: 'saved',
      label: 'Saved Events',
      icon: <FiBookmark size={18} aria-hidden="true" />,
      badge: savedEvents?.length || 0,
    },
    {
      id: 'followers',
      label: 'Followers',
      icon: <FiUsers size={18} aria-hidden="true" />,
      badge: followers?.length || 0,
    },
    {
      id: 'following',
      label: 'Following',
      icon: <FiUsers size={18} aria-hidden="true" />,
      badge: following?.length || 0,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <FiSettings size={18} aria-hidden="true" />,
    },
  ], [
    createdEvents?.length,
    attendingEvents?.length,
    savedEvents?.length,
    followers?.length,
    following?.length,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-1" role="tablist" aria-label="Profile sections">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-4 py-4 text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              tabIndex={activeTab === tab.id ? 0 : -1}
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>

              {tab.badge !== undefined && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold"
                  aria-label={`${tab.label} count: ${tab.badge}`}
                >
                  {tab.badge}
                </motion.span>
              )}

              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  transition={{ duration: 0.3 }}
                  aria-hidden="true"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          role="tabpanel"
          id={`${activeTab}-panel`}
        >
          {activeTab === 'overview' && (
            <OverviewTab user={user} />
          )}
          {activeTab === 'created' && (
            <EventsTab events={createdEvents} title="Created Events" />
          )}
          {activeTab === 'attending' && (
            <EventsTab events={attendingEvents} title="Attending Events" />
          )}
          {activeTab === 'saved' && (
            <EventsTab events={savedEvents} title="Saved Events" />
          )}
          {activeTab === 'followers' && (
            <PeopleTab people={followers} title="Followers" />
          )}
          {activeTab === 'following' && (
            <PeopleTab people={following} title="Following" />
          )}
          {activeTab === 'settings' && (
            <SettingsTab user={user} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.activeTab === nextProps.activeTab &&
    prevProps.user?._id === nextProps.user?._id &&
    prevProps.createdEvents?.length === nextProps.createdEvents?.length &&
    prevProps.attendingEvents?.length === nextProps.attendingEvents?.length &&
    prevProps.savedEvents?.length === nextProps.savedEvents?.length &&
    prevProps.followers?.length === nextProps.followers?.length &&
    prevProps.following?.length === nextProps.following?.length
  );
});

ProfileTabs.displayName = 'ProfileTabs';

/**
 * OverviewTab - User bio and contact information
 */
const OverviewTab = React.memo(({ user }) => (
  <div className="space-y-6">
    {/* Bio Section */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        About
      </h3>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {user?.bio || 'No bio added yet. Start by editing your profile to add one!'}
      </p>
    </motion.div>

    {/* Contact Info */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Contact Information
      </h3>
      <div className="space-y-3">
        {user?.email && (
          <InfoRow label="Email" value={user.email} />
        )}
        {user?.phone && (
          <InfoRow label="Phone" value={user.phone} />
        )}
        {user?.website && (
          <InfoRow
            label="Website"
            value={user.website}
            isLink
          />
        )}
      </div>
    </motion.div>

    {/* Interests */}
    {user?.interests && user.interests.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Interests
        </h3>
        <div className="flex flex-wrap gap-2">
          {user.interests.map((interest) => (
            <motion.span
              key={interest}
              whileHover={{ y: -2 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold"
            >
              {interest}
            </motion.span>
          ))}
        </div>
      </motion.div>
    )}

    {/* Activity */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Activity
      </h3>
      <div className="space-y-3 text-gray-700 dark:text-gray-300">
        <div className="flex justify-between">
          <span>Last Login</span>
          <span className="font-semibold">
            {user?.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleDateString()
              : 'Never'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total Logins</span>
          <span className="font-semibold">{user?.loginCount || 0}</span>
        </div>
      </div>
    </motion.div>
  </div>
));

OverviewTab.displayName = 'OverviewTab';

/**
 * EventsTab - Display list of events
 */
const EventsTab = React.memo(({ events, title }) => (
  <div>
    {events && events.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event, idx) => (
          <EventCard key={event._id} event={event} idx={idx} />
        ))}
      </div>
    ) : (
      <EmptyState title={title} message="No events yet" />
    )}
  </div>
));

EventsTab.displayName = 'EventsTab';

/**
 * EventCard - Individual event card
 */
const EventCard = React.memo(({ event, idx }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.1 }}
    className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
    whileHover={{ y: -4 }}
    role="article"
  >
    <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
      {event.title || event.name}
    </h4>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
      {event.description}
    </p>
    <div className="mt-4 text-sm text-gray-500 dark:text-gray-500 space-y-1">
      {event.date && (
        <div>📅 {new Date(event.date).toLocaleDateString()}</div>
      )}
      {event.attendees && (
        <div>👥 {event.attendees} attending</div>
      )}
    </div>
  </motion.div>
));

EventCard.displayName = 'EventCard';

/**
 * PeopleTab - Display list of followers/following
 */
const PeopleTab = React.memo(({ people, title }) => (
  <div>
    {people && people.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person, idx) => (
          <PersonCard key={person._id} person={person} idx={idx} />
        ))}
      </div>
    ) : (
      <EmptyState title={title} message="No people yet" />
    )}
  </div>
));

PeopleTab.displayName = 'PeopleTab';

/**
 * PersonCard - Individual person card
 */
const PersonCard = React.memo(({ person, idx }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: idx * 0.05 }}
    className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow text-center group"
    whileHover={{ y: -4 }}
    role="article"
  >
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
      {person.avatar?.url ? (
        <img
          src={person.avatar.url}
          alt={person.fullName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-2xl text-white font-bold">
          {person.fullName?.charAt(0)?.toUpperCase()}
        </span>
      )}
    </div>
    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
      {person.fullName}
    </h4>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
      @{person.username}
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-shadow"
      aria-label={`View ${person.fullName}'s profile`}
    >
      View Profile
    </motion.button>
  </motion.div>
));

PersonCard.displayName = 'PersonCard';

/**
 * SettingsTab - User settings and preferences
 */
const SettingsTab = React.memo(({ user }) => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
      Profile Settings
    </h3>
    <div className="space-y-4">
      <SettingToggle
        label="Email Notifications"
        description="Receive email updates about events and followers"
        checked={user?.notificationsEnabled || false}
      />
      <SettingToggle
        label="Email Verified"
        description="Your email address is verified"
        checked={user?.emailVerified || false}
        disabled
      />
      <SettingToggle
        label="Public Profile"
        description="Allow others to view your profile"
        checked={true}
      />
    </div>
  </div>
));

SettingsTab.displayName = 'SettingsTab';

/**
 * SettingToggle - Settings checkbox component
 */
const SettingToggle = React.memo(({ label, description, checked, disabled = false }) => (
  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
    <div>
      <p className="font-semibold text-gray-900 dark:text-white">
        {label}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
    <input
      type="checkbox"
      defaultChecked={checked}
      disabled={disabled}
      className="w-5 h-5 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={label}
    />
  </div>
));

SettingToggle.displayName = 'SettingToggle';

/**
 * InfoRow - Contact information display
 */
const InfoRow = React.memo(({ label, value, isLink = false }) => (
  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    {isLink ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        aria-label={`${label}: ${value}`}
      >
        {value}
      </a>
    ) : (
      <span className="text-gray-900 dark:text-white font-semibold">
        {value}
      </span>
    )}
  </div>
));

InfoRow.displayName = 'InfoRow';

/**
 * EmptyState - Display when no content available
 */
const EmptyState = React.memo(({ title, message }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="py-12 text-center"
    role="status"
    aria-label={message}
  >
    <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">
      {message}
    </p>
    <p className="text-sm text-gray-400 dark:text-gray-500">
      Check back soon or create your first {title.toLowerCase().replace(/s$/, '')}!
    </p>
  </motion.div>
));

EmptyState.displayName = 'EmptyState';

export default ProfileTabs;