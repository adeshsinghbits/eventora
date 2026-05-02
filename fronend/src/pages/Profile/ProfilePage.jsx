import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import {
  updateProfile,
  uploadAvatar,
  getFollowers,
  getFollowing,
  clearError,
  clearSuccess,
} from '../../features/proflie/profileSlice';
import { fetchProfile } from '../../features/auth/authThunks';
import ProfileHeader from '../../components/profile/ProflieHader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import EditProfileModal from '../../components/profile/EditProfileModel';
import { MOCK_EVENTS } from '../../constants/mockData';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useParams();

  // Redux selectors
  const {
    followers,
    following,
    loading,
    uploading,
    error,
    success,
  } = useSelector((state) => state.profile);
  const { user, isLoggedIn } = useSelector((state) => state.auth);

  console.log(isLoggedIn);
  

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Determine if viewing own profile
  const isOwnProfile = useMemo(() => !username, [username]);

  useEffect(() => {
    if (!user?._id || !isOwnProfile) return;

    dispatch(getFollowers(user._id));
    dispatch(getFollowing(user._id));
  }, [user?._id, isOwnProfile, dispatch]);

  useEffect(() => {
    if (!success) return;

    setShowSuccessMessage(true);
    const timer = setTimeout(() => {
      setShowSuccessMessage(false);
      dispatch(clearSuccess());
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, dispatch]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      dispatch(clearError());
    }, 5000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const handleEditClick = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleSaveProfile = useCallback(async (formData) => {
    const result = await dispatch(updateProfile(formData));
    // Only close modal on success
    if (!result.payload?.error) {
      setIsEditModalOpen(false);
    }
  }, [dispatch]);

  const handleAvatarChange = useCallback(async (file) => {
    await dispatch(uploadAvatar(file));
  }, [dispatch]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);
  
  // ============ MEMOIZED EVENT DATA ============
  const eventData = useMemo(() => ({
    created: MOCK_EVENTS.CREATED,
    attending: MOCK_EVENTS.ATTENDING,
    saved: MOCK_EVENTS.SAVED,
  }), []);

  if (loading && !user) {
    return <ProfilePageSkeleton />;
  }

  if (!isLoggedIn) {
    return <UnauthenticatedState navigate={navigate} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Content */}
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
                createdEvents={eventData.created}
                attendingEvents={eventData.attending}
                savedEvents={eventData.saved}
                followers={followers}
                following={following}
              />
            </motion.div>
          </>
        ) : (
          <EmptyProfileState navigate={navigate} />
        )}

        {/* Edit Profile Modal */}
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
      {/* Header Skeleton */}
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

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            className="h-24 bg-gray-300 dark:bg-gray-700 rounded-xl"
          />
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-300 dark:bg-gray-700 rounded-xl"
            />
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

export default ProfilePage;