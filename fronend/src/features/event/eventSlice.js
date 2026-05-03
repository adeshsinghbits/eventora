import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import * as svc from "../../services/eventService";

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const fetchNearbyEvents = createAsyncThunk(
  "events/fetchNearby",
  async ({ lat, lng, params = {} }, { rejectWithValue }) => {
    try {
      return await svc.getNearbyEvents(lat, lng, params);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch nearby events");
    }
  }
);

export const fetchClusteredEvents = createAsyncThunk(
  "events/fetchClusters",
  async ({ lat, lng, params = {} }, { rejectWithValue }) => {
    try {
      return await svc.getClusteredEvents(lat, lng, params);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch clusters");
    }
  }
);

export const searchMapEvents = createAsyncThunk(
  "events/mapSearch",
  async ({ query, lat, lng, params = {} }, { rejectWithValue }) => {
    try {
      return await svc.mapSearchEvents(query, lat, lng, params);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Search failed");
    }
  }
);

export const fetchEventDetails = createAsyncThunk(
  "events/fetchDetails",
  async (id, { rejectWithValue }) => {
    try {
      return await svc.getEventDetails(id);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch event details");
    }
  }
);

export const fetchFeaturedEvents = createAsyncThunk(
  "events/fetchFeatured",
  async ({ lat, lng, params = {} }, { rejectWithValue }) => {
    try {
      return await svc.getFeaturedNearbyEvents(lat, lng, params);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch featured events");
    }
  }
);

export const fetchMapFilterOptions = createAsyncThunk(
  "events/fetchFilters",
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      return await svc.getMapFilterOptions(lat, lng);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch filter options");
    }
  }
);

export const fetchExploreEvents = createAsyncThunk(
  "events/fetchExplore",
  async ({ page = 1, limit = 20, filters = {} }, { rejectWithValue }) => {
    try {
      return await svc.getExploreEvents({ page, limit, ...filters });
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch events");
    }
  }
);

export const createNewEvent = createAsyncThunk(
  "events/create",
  async (eventData, { rejectWithValue }) => {
    try {
      return await svc.createEvent(eventData);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  "events/update",
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      return await svc.updateEvent(id, eventData);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to update event");
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/delete",
  async (id, { rejectWithValue }) => {
    try {
      await svc.deleteEvent(id);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to delete event");
    }
  }
);

export const toggleSaveEvent = createAsyncThunk(
  "events/toggleSave",
  async (eventId, { rejectWithValue }) => {
    try {
      return await svc.toggleSaveEvent(eventId);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to save event");
    }
  }
);

export const attendEvent = createAsyncThunk(
  "events/attend",
  async (eventId, { rejectWithValue }) => {
    try {
      return await svc.attendEvent(eventId);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to attend event");
    }
  }
);

export const cancelAttendance = createAsyncThunk(
  "events/  ",
  async (eventId, { rejectWithValue }) => {
    try {
      return await svc.cancelAttendance(eventId);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to cancel attendance");
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  "events/fetchMyEvents",
  async (params, { rejectWithValue }) => {
    try {
      return await svc.getMyEvents(params);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch my events");
    }
  }
);

export const fetchAttendingEvents = createAsyncThunk(
  "events/fetchAttending",
  async (params, { rejectWithValue }) => {
    try {
      return await svc.getAttendingEvents(params);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch attending events");
    }
  }
);

export const fetchSavedEvents = createAsyncThunk(
  "events/fetchSaved",
  async (params, { rejectWithValue }) => {
    try {
      return await svc.getSavedEvents(params);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch saved events");
    }
  }
);

// FIX: uploadBanner now has a proper fulfilled handler + stores bannerUpload state
export const uploadEventBanner = createAsyncThunk(
  "events/uploadBanner",
  async ({ file, onProgress }, { rejectWithValue }) => {
    try {
      return await svc.uploadEventBannerService(file, onProgress);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Upload failed");
    }
  }
);

export const reverseGeocodeLocation = createAsyncThunk(
  "events/reverseGeocode",
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      return await svc.reverseGeocode(lat, lng);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Geocoding failed");
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────
// FIX: granular loading flags instead of one global flag that blocks the whole UI
const initialState = {
  // Explore grid
  exploreEvents: [],
  exploreLoading: false,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },

  // Map
  nearbyEvents: [],
  clusteredEvents: [],
  featuredEvents: [],
  filterOptions: null,
  mapLoading: false,

  // Detail
  selectedEvent: null,
  detailLoading: false,

  // User collections
  myEvents: [],
  attendingEvents: [],
  savedEvents: [],
  userListLoading: false,

  // Banner upload
  bannerUpload: { url: "", public_id: "", uploading: false, progress: 0 },

  // Shared
  error: null,
  successMessage: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────
const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.successMessage = null; },
    clearSelectedEvent: (state) => { state.selectedEvent = null; },
    clearBannerUpload: (state) => {
      state.bannerUpload = { url: "", public_id: "", uploading: false, progress: 0 };
    },
    setBannerProgress: (state, action) => {
      state.bannerUpload.progress = action.payload;
    },
    resetMapEvents: (state) => {
      state.nearbyEvents = [];
      state.clusteredEvents = [];
    },
    // Optimistic save toggle for instant UI feedback
    optimisticToggleSave: (state, action) => {
      const eventId = action.payload;
      const updateList = (list) =>
        list.map((e) =>
          e._id === eventId ? { ...e, _isSavedOptimistic: !e._isSavedOptimistic } : e
        );
      state.exploreEvents = updateList(state.exploreEvents);
      state.nearbyEvents = updateList(state.nearbyEvents);
    },
  },
  extraReducers: (builder) => {
    // ── Explore Events ──────────────────────────────────────────────────────
    builder
      .addCase(fetchExploreEvents.pending, (state) => {
        state.exploreLoading = true;
        state.error = null;
      })
      .addCase(fetchExploreEvents.fulfilled, (state, { payload }) => {
        state.exploreLoading = false;
        state.exploreEvents = payload.data || [];
        state.pagination = payload.pagination || initialState.pagination;
      })
      .addCase(fetchExploreEvents.rejected, (state, { payload }) => {
        state.exploreLoading = false;
        state.error = payload;
      });

    // ── Nearby Events ───────────────────────────────────────────────────────
    builder
      .addCase(fetchNearbyEvents.pending, (state) => { state.mapLoading = true; state.error = null; })
      .addCase(fetchNearbyEvents.fulfilled, (state, { payload }) => {
        state.mapLoading = false;
        state.nearbyEvents = payload.data || [];
      })
      .addCase(fetchNearbyEvents.rejected, (state, { payload }) => {
        state.mapLoading = false;
        state.error = payload;
      });

    // ── Clustered Events ────────────────────────────────────────────────────
    builder
      .addCase(fetchClusteredEvents.pending, (state) => { state.mapLoading = true; })
      .addCase(fetchClusteredEvents.fulfilled, (state, { payload }) => {
        state.mapLoading = false;
        state.clusteredEvents = payload.data || [];
      })
      .addCase(fetchClusteredEvents.rejected, (state, { payload }) => {
        state.mapLoading = false;
        state.error = payload;
      });

    // ── Map Search ──────────────────────────────────────────────────────────
    builder
      .addCase(searchMapEvents.pending, (state) => { state.mapLoading = true; state.error = null; })
      .addCase(searchMapEvents.fulfilled, (state, { payload }) => {
        state.mapLoading = false;
        state.nearbyEvents = payload.data || [];
      })
      .addCase(searchMapEvents.rejected, (state, { payload }) => {
        state.mapLoading = false;
        state.error = payload;
      });

    // ── Event Details ───────────────────────────────────────────────────────
    builder
      .addCase(fetchEventDetails.pending, (state) => { state.detailLoading = true; })
      .addCase(fetchEventDetails.fulfilled, (state, { payload }) => {
        state.detailLoading = false;
        state.selectedEvent = payload.data;
      })
      .addCase(fetchEventDetails.rejected, (state, { payload }) => {
        state.detailLoading = false;
        state.error = payload;
      });

    // ── Featured ────────────────────────────────────────────────────────────
    builder
      .addCase(fetchFeaturedEvents.fulfilled, (state, { payload }) => {
        state.featuredEvents = payload.data || [];
      });

    // ── Filter Options ──────────────────────────────────────────────────────
    builder
      .addCase(fetchMapFilterOptions.fulfilled, (state, { payload }) => {
        state.filterOptions = payload.data;
      });

    // ── Create Event ────────────────────────────────────────────────────────
    builder
      .addCase(createNewEvent.pending, (state) => { state.exploreLoading = true; state.error = null; })
      .addCase(createNewEvent.fulfilled, (state, { payload }) => {
        state.exploreLoading = false;
        state.successMessage = "Event created successfully";
        state.myEvents.unshift(payload.data);
        toast.success("Event created!");
      })
      .addCase(createNewEvent.rejected, (state, { payload }) => {
        state.exploreLoading = false;
        state.error = payload;
        toast.error(payload || "Failed to create event");
      });

    // ── Update Event ────────────────────────────────────────────────────────
    builder
      .addCase(updateEvent.fulfilled, (state, { payload }) => {
        state.successMessage = "Event updated successfully";
        const idx = state.myEvents.findIndex((e) => e._id === payload.data._id);
        if (idx > -1) state.myEvents[idx] = payload.data;
        toast.success("Event updated!");
      })
      .addCase(updateEvent.rejected, (state, { payload }) => {
        state.error = payload;
        toast.error(payload || "Failed to update event");
      });

    // ── Delete Event ────────────────────────────────────────────────────────
    builder
      .addCase(deleteEvent.fulfilled, (state, { payload: id }) => {
        state.myEvents = state.myEvents.filter((e) => e._id !== id);
        state.successMessage = "Event deleted";
        toast.success("Event deleted");
      })
      .addCase(deleteEvent.rejected, (state, { payload }) => {
        state.error = payload;
        toast.error(payload || "Failed to delete event");
      });

    // ── Toggle Save ─────────────────────────────────────────────────────────
    builder
      .addCase(toggleSaveEvent.fulfilled, (state, { payload }) => {
        toast.success(payload.isSaved ? "Event saved!" : "Removed from saved");
      })
      .addCase(toggleSaveEvent.rejected, (state, { payload }) => {
        toast.error(payload || "Failed to save event");
      });

    // ── Attend / Cancel ─────────────────────────────────────────────────────
    builder
      .addCase(attendEvent.fulfilled, (_, { payload }) => {
        toast.success(payload.message || "You're attending!");
      })
      .addCase(attendEvent.rejected, (state, { payload }) => {
        toast.error(payload || "Failed to RSVP");
      })
      .addCase(cancelAttendance.fulfilled, (_, { payload }) => {
        toast.success(payload.message || "Attendance cancelled");
      });

    // ── User Lists ──────────────────────────────────────────────────────────
    builder
      .addCase(fetchMyEvents.pending, (state) => { state.userListLoading = true; })
      .addCase(fetchMyEvents.fulfilled, (state, { payload }) => {
        state.userListLoading = false;
        state.myEvents = payload.data || [];
      })
      .addCase(fetchMyEvents.rejected, (state, { payload }) => {
        state.userListLoading = false;
        state.error = payload;
      })
      .addCase(fetchAttendingEvents.pending, (state) => { state.userListLoading = true; })
      .addCase(fetchAttendingEvents.fulfilled, (state, { payload }) => {
        state.userListLoading = false;
        state.attendingEvents = payload.data || [];
      })
      .addCase(fetchAttendingEvents.rejected, (state, { payload }) => {
        state.userListLoading = false;
        state.error = payload;
      })
      .addCase(fetchSavedEvents.pending, (state) => { state.userListLoading = true; })
      .addCase(fetchSavedEvents.fulfilled, (state, { payload }) => {
        state.userListLoading = false;
        state.savedEvents = payload.data || [];
      })
      .addCase(fetchSavedEvents.rejected, (state, { payload }) => {
        state.userListLoading = false;
        state.error = payload;
      });

    // ── Banner Upload (FIX: was completely missing fulfilled handler) ────────
    builder
      .addCase(uploadEventBanner.pending, (state) => {
        state.bannerUpload.uploading = true;
        state.bannerUpload.progress = 0;
      })
      .addCase(uploadEventBanner.fulfilled, (state, { payload }) => {
        state.bannerUpload.uploading = false;
        state.bannerUpload.url = payload.url;
        state.bannerUpload.public_id = payload.public_id;
        state.bannerUpload.progress = 100;
        toast.success("Banner uploaded!");
      })
      .addCase(uploadEventBanner.rejected, (state, { payload }) => {
        state.bannerUpload.uploading = false;
        state.error = payload;
        toast.error(payload || "Upload failed");
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearSelectedEvent,
  clearBannerUpload,
  setBannerProgress,
  resetMapEvents,
  optimisticToggleSave,
} = eventsSlice.actions;

export default eventsSlice.reducer;