import React, { useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiCamera, FiShare2 } from 'react-icons/fi';
import { MdVerified, MdStar } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';

/**
 * ProfileHeader - Memoized component to prevent unnecessary re-renders
 * 
 * Optimizations:
 * - Uses React.memo to prevent re-renders when props haven't changed
 * - Memoizes expensive calculations
 * - useCallback for event handlers to prevent child re-renders
 */
const ProfileHeader = React.memo(({ 
  user, 
  onEditClick, 
  onAvatarChange, 
  isOwnProfile 
}) => {
  const fileInputRef = useRef(null);

  // Memoize profile completion calculation
  const profileCompletion = useMemo(() => {
    return calculateProfileCompletion(user);
  }, [user]);

  // Animation variants
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
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Memoized handlers
  const handleAvatarClick = useCallback(() => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isOwnProfile]);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onAvatarChange]);

  // Memoize location string
  const locationString = useMemo(() => {
    if (user?.city && user?.state) {
      return `${user.city}, ${user.state}`;
    }
    return user?.city || user?.country || 'Not specified';
  }, [user?.city, user?.state, user?.country]);

  // Memoize role badge classes
  const roleBadgeClasses = useMemo(() => {
    const baseClasses = 'px-4 py-1.5 rounded-full text-sm font-semibold capitalize';
    const roleType = user?.role;

    if (roleType === 'organizer') {
      return `${baseClasses} bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300`;
    }
    if (roleType === 'admin') {
      return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300`;
    }
    return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300`;
  }, [user?.role]);

  const roleEmoji = useMemo(() => {
    const role = user?.role;
    if (role === 'organizer') return '🎯';
    if (role === 'admin') return '⚙️';
    return '';
  }, [user?.role]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10"
    >
      {/* Cover Background */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-overlay opacity-30"></div>

        {/* Animated background elements */}
        <motion.div
          className="absolute top-10 right-20 w-40 h-40 bg-white rounded-full mix-blend-overlay opacity-10"
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-60 h-60 bg-white rounded-full mix-blend-overlay opacity-5"
          animate={{ y: [0, 20, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Main Content */}
      <div className="relative px-6 md:px-8 -mt-24 md:-mt-32">
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-end gap-6"
        >
          {/* Avatar Section */}
          <AvatarSection
            user={user}
            isOwnProfile={isOwnProfile}
            onAvatarClick={handleAvatarClick}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
          />

          {/* User Info */}
          <motion.div
            variants={itemVariants}
            className="flex-1 mb-2"
          >
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {user?.fullName}
              </h1>
              {user?.isVerified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full"
                >
                  <MdVerified className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Verified
                  </span>
                </motion.div>
              )}
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              @{user?.username}
            </p>

            {/* Role Badge */}
            {user?.role && (
              <div className="flex items-center gap-2 mb-3">
                <span className={roleBadgeClasses}>
                  {roleEmoji && `${roleEmoji} `}
                  {user.role}
                </span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
              <FiMapPin size={18} aria-hidden="true" />
              <span>{locationString}</span>
            </div>

            {/* Metadata */}
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Joined {formatDistanceToNow(new Date(user?.createdAt), { addSuffix: true })}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex gap-3"
          >
            {isOwnProfile ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEditClick}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
                aria-label="Edit profile"
              >
                Edit Profile
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
                aria-label="Follow user"
              >
                Follow
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Share profile"
            >
              <FiShare2 size={20} />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-8"
        >
          <StatCard 
            label="Followers" 
            value={user?.followers?.length || 0} 
            icon="👥" 
          />
          <StatCard 
            label="Following" 
            value={user?.following?.length || 0} 
            icon="🔗" 
          />
          <StatCard 
            label="Points" 
            value={user?.points || 0} 
            icon={<MdStar className="text-yellow-500" />} 
          />
          <StatCard 
            label="Reputation" 
            value={`${profileCompletion}%`} 
            icon="⭐" 
          />
        </motion.div>

        {/* Profile Completion Bar */}
        <motion.div
          variants={itemVariants}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Profile Completeness
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {profileCompletion}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - return true if props are equal (skip re-render)
  return (
    prevProps.user?._id === nextProps.user?._id &&
    prevProps.user?.fullName === nextProps.user?.fullName &&
    prevProps.user?.avatar?.url === nextProps.user?.avatar?.url &&
    prevProps.isOwnProfile === nextProps.isOwnProfile
  );
});

ProfileHeader.displayName = 'ProfileHeader';

/**
 * AvatarSection - Separated component for better maintainability
 */
const AvatarSection = React.memo(({
  user,
  isOwnProfile,
  onAvatarClick,
  fileInputRef,
  onFileSelect,
}) => (
  <div className="relative flex-shrink-0">
    <motion.div
      className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 cursor-pointer group"
      whileHover={isOwnProfile ? { scale: 1.05 } : undefined}
      whileTap={isOwnProfile ? { scale: 0.95 } : undefined}
      onClick={onAvatarClick}
      role={isOwnProfile ? 'button' : undefined}
      tabIndex={isOwnProfile ? 0 : undefined}
      onKeyDown={isOwnProfile ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onAvatarClick();
        }
      } : undefined}
    >
      {user?.avatar?.url ? (
        <>
          <img
            src={user.avatar.url}
            alt={user.fullName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
              <FiCamera 
                className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" 
                aria-hidden="true"
              />
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
          <span className="text-4xl text-white font-bold">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </span>
        </div>
      )}
    </motion.div>

    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={onFileSelect}
      className="hidden"
      aria-label="Upload profile picture"
    />

    {/* Online Status */}
    <div 
      className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg" 
      aria-label="Online"
      title="Online"
    />
  </div>
));

AvatarSection.displayName = 'AvatarSection';

/**
 * StatCard - Memoized stat display component
 */
const StatCard = React.memo(({ label, value, icon }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
        {label}
      </span>
      <span className="text-xl" aria-hidden="true">
        {typeof icon === 'string' ? icon : icon}
      </span>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
  </motion.div>
));

StatCard.displayName = 'StatCard';

/**
 * Calculate profile completion percentage
 * Optimized: Uses early returns to skip unnecessary checks
 */
function calculateProfileCompletion(user) {
  if (!user) return 0;

  const fields = [
    'fullName',
    'username',
    'email',
    'avatar',
    'bio',
    'phone',
    'website',
    'city',
    'country',
    'interests',
  ];

  const completed = fields.filter((field) => {
    const value = user[field];
    
    // Early returns for different value types
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return value && Object.keys(value).length > 0;
    return value && String(value).trim().length > 0;
  }).length;

  return Math.round((completed / fields.length) * 100);
}

export default ProfileHeader;