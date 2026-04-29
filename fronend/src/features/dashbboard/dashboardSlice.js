import { createSlice } from "@reduxjs/toolkit";

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      totalEventsCreated: 12,
      upcomingEvents: 4,
      totalRSVPs: 487,
      savedEvents: 23,
      monthlyVisitors: 3284,
      revenue: 4250,
    },
    upcomingEvents: [
      {
        id: 1,
        title: "Tech Meetup 2024",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        date: "2024-02-15",
        time: "18:00",
        location: "San Francisco, CA",
        attendees: 45,
        category: "tech",
      },
      {
        id: 2,
        title: "Startup Founders Circle",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        date: "2024-02-20",
        time: "19:00",
        location: "San Francisco, CA",
        attendees: 28,
        category: "business",
      },
      {
        id: 3,
        title: "AI & Machine Learning Workshop",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        date: "2024-02-25",
        time: "14:00",
        location: "San Francisco, CA",
        attendees: 67,
        category: "tech",
      },
    ],
    recentActivity: [
      {
        id: 1,
        type: "rsvp",
        message: "24 people RSVP'd to Tech Meetup 2024",
        timestamp: "2 hours ago",
        icon: "✓",
      },
      {
        id: 2,
        type: "approved",
        message: "Your event Web Summit 2024 has been approved",
        timestamp: "5 hours ago",
        icon: "✓",
      },
      {
        id: 3,
        type: "follower",
        message: "Sarah Chen followed your events",
        timestamp: "1 day ago",
        icon: "👤",
      },
      {
        id: 4,
        type: "review",
        message: "New 5-star review on Tech Meetup",
        timestamp: "2 days ago",
        icon: "⭐",
      },
      {
        id: 5,
        type: "milestone",
        message: "You reached 500 total RSVP milestone!",
        timestamp: "3 days ago",
        icon: "🎉",
      },
    ],
    loading: false,
    error: null,
  },
  reducers: {
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setUpcomingEvents: (state, action) => {
      state.upcomingEvents = action.payload;
    },
    setRecentActivity: (state, action) => {
      state.recentActivity = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setStats, setUpcomingEvents, setRecentActivity, setLoading, setError } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;