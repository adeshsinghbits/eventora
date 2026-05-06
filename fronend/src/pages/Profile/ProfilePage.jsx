import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  updateProfile,
  uploadAvatar,
  getFollowers,
  getFollowing,
  clearError,
  clearSuccess,
} from '../../features/proflie/profileSlice';
import {
  fetchMyEvents,
  fetchAttendingEvents,
  fetchSavedEvents,
} from '../../features/event/eventSlice';
import ProfileHeader from '../../components/profile/ProflieHader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import EditProfileModal from '../../components/profile/EditProfileModel';

// ── Sub-components ────────────────────────────────────────────────────────────

const UnauthenticatedState = ({ navigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
  >
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🔐</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Authentication Required
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Please log in to view your profile.
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/login')}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
      >
        Go to Login
      </motion.button>
    </div>
  </motion.div>
);

const ProfilePageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="space-y-4"
      >
        <div className="h-48 md:h-64 bg-gray-300 dark:bg-gray-700 rounded-2xl" />
        <div className="flex gap-6">
          <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-2xl -mt-16 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-2/3" />
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg w-1/3" />
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg w-1/2" />
          </div>
        </div>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            className="h-24 bg-gray-300 dark:bg-gray-700 rounded-xl"
          />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const EmptyProfileState = ({ navigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-20"
  >
    <div className="text-6xl mb-4">👤</div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Profile Not Found
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      The user profile you're looking for doesn't exist or has been removed.
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(-1)}
      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
    >
      Go Back
    </motion.button>
  </motion.div>
);

// ── ProfilePage ───────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useParams();

  // Profile slice
  const { followers, following, loading, uploading, error, success } =
    useSelector((state) => state.profile);

  // Auth slice
  const { user, isLoggedIn } = useSelector((state) => state.auth);

  // Event slice — real data replacing MOCK_EVENTS
  const {
    myEvents,
    attendingEvents,
    savedEvents,
    userListLoading,
  } = useSelector((state) => state.events);

  // Local UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isOwnProfile = useMemo(() => !username, [username]);

  // ── Fetch followers / following once we know who the user is ──────────────
  useEffect(() => {
    if (!user?._id || !isOwnProfile) return;
    dispatch(getFollowers(user._id));
    dispatch(getFollowing(user._id));
  }, [user?._id, isOwnProfile, dispatch]);

  // ── Fetch the three event lists for the profile tabs ─────────────────────
  useEffect(() => {
    if (!user?._id || !isOwnProfile) return;
    dispatch(fetchMyEvents());
    dispatch(fetchAttendingEvents());
    dispatch(fetchSavedEvents());
  }, [user?._id, isOwnProfile, dispatch]);

  // ── Auto-clear success toast ──────────────────────────────────────────────
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => dispatch(clearSuccess()), 3000);
    return () => clearTimeout(t);
  }, [success, dispatch]);

  // ── Auto-clear error toast ────────────────────────────────────────────────
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => dispatch(clearError()), 5000);
    return () => clearTimeout(t);
  }, [error, dispatch]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEditClick = useCallback(() => setIsEditModalOpen(true), []);
  const handleEditModalClose = useCallback(() => setIsEditModalOpen(false), []);

  const handleSaveProfile = useCallback(
    async (formData) => {
      const result = await dispatch(updateProfile(formData));
      if (!result.payload?.error) setIsEditModalOpen(false);
    },
    [dispatch]
  );

  const handleAvatarChange = useCallback(
    (file) => dispatch(uploadAvatar(file)),
    [dispatch]
  );

  const handleTabChange = useCallback((tabId) => setActiveTab(tabId), []);

  // ── Memoised event data passed to ProfileTabs ─────────────────────────────
  // Keeps reference stable so ProfileTabs doesn't re-render on unrelated state
  const eventData = useMemo(
    () => ({
      created: myEvents,
      attending: attendingEvents,
      saved: savedEvents,
    }),
    [myEvents, attendingEvents, savedEvents]
  );
  // ── Render guards ─────────────────────────────────────────────────────────
  if (loading && !user) return <ProfilePageSkeleton />;
  if (!isLoggedIn) return <UnauthenticatedState navigate={navigate} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        {user ? (
          <>
            <ProfileHeader
              user={user}
              onEditClick={handleEditClick}
              onAvatarChange={handleAvatarChange}
              isOwnProfile={isOwnProfile}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <ProfileTabs
                user={user}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                // Real data — no more MOCK_EVENTS
                createdEvents={eventData.created}
                attendingEvents={eventData.attending}
                savedEvents={eventData.saved}
                followers={followers}
                following={following}
                // Pass loading so tabs can show skeletons while fetching
                eventsLoading={userListLoading}
              />
            </motion.div>
          </>
        ) : (
          <EmptyProfileState navigate={navigate} />
        )}

        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          user={user}
          onSave={handleSaveProfile}
          isLoading={loading || uploading}
        />
      </div>
    </motion.div>
  );
};

export default ProfilePage;