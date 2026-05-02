import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getNearbyEvents,
  getClusteredEvents,
  mapSearchEvents,
  getEventDetails,
  getFeaturedNearbyEvents,
  getMapFilterOptions,
  createEvent,
  updateEvent as updateEventService,
  toggleSaveEvent as toggleSaveEventService,
  attendEvent as attendEventService,
  getMyEvents,
  getAttendingEvents,
  getSavedEvents,
  uploadEventBannerService,
  reverseGeocode,
  getExploreEvents,
} from "../../services/eventService";
import  { toast } from 'react-hot-toast';

export const fetchNearbyEvents = createAsyncThunk(
  'events/fetchNearby',
  async ({ lat, lng, params }, { rejectWithValue }) => {
    try {
      const data = await getNearbyEvents(lat, lng, params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch nearby events'
      );
    }
  }
);

export const uploadEventBanner = createAsyncThunk(
  "event/uploadBanner",
  async (file, { rejectWithValue }) => {
    try {
      const data = await uploadEventBannerService(file);
      console.log(file);
      
      toast.success("Banner uploaded successfully!");
      return data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
      return rejectWithValue(err.message);
    }
  }
);

export const fetchClusteredEvents = createAsyncThunk(
  'events/fetchClusters',
  async ({ lat, lng, params }, { rejectWithValue }) => {
    try {
      const data = await getClusteredEvents(lat, lng, params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clusters');
    }
  }
);

export const searchEvents = createAsyncThunk(
  'events/search',
  async ({ query, lat, lng, params }, { rejectWithValue }) => {
    try {
      const data = await mapSearchEvents(query, lat, lng, params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Search failed'
      );
    }
  }
);

export const fetchEventDetails = createAsyncThunk(
  'events/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const data = await getEventDetails(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch event details'
      );
    }
  }
);

export const fetchFeaturedEvents = createAsyncThunk(
  'events/fetchFeatured',
  async ({ lat, lng, params }, { rejectWithValue }) => {
    try {
      const data = await getFeaturedNearbyEvents(lat, lng, params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch featured events'
      );
    }
  }
);

export const fetchMapFilterOptions = createAsyncThunk(
  'events/fetchFilters',
  async ({ lat, lng, params }, { rejectWithValue }) => {
    try {
      const data = await getMapFilterOptions(lat, lng, params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch filter options'
      );
    }
  }
);

export const createNewEvent = createAsyncThunk(
  "events/create",
  async (eventData, { rejectWithValue }) => {
    try {
      const data = await createEvent(eventData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reverseGeocodeLocation = createAsyncThunk(
  'events/reverseGeocode',
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      const data = await reverseGeocode(lat, lng);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reverse geocode location'
      );
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const data = await updateEventService(id, eventData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update event'
      );
    }
  }
);

export const toggleSaveEvent = createAsyncThunk(
  'events/toggleSave',
  async (eventId, { rejectWithValue }) => {
    try {
      const data = await toggleSaveEventService(eventId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to save event'
      );
    }
  }
);

export const attendEvent = createAsyncThunk(
  'events/attend',
  async (eventId, { rejectWithValue }) => {
    try {
      const data = await attendEventService(eventId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to attend event'
      );
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  'events/fetchMyEvents',
  async (params, { rejectWithValue }) => {
    try {
      const data = await getMyEvents(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch my events'
      );
    }
  }
);

export const fetchAttendingEvents = createAsyncThunk(
  'events/fetchAttending',
  async (params, { rejectWithValue }) => {
    try {
      const data = await getAttendingEvents(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attending events'
      );
    }
  }
);

export const fetchSavedEvents = createAsyncThunk(
  'events/fetchSaved',
  async (params, { rejectWithValue }) => {
    try {
      const data = await getSavedEvents(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch saved events'
      );
    }
  }
);
export const fetchExploreEvents = createAsyncThunk(
  "events/fetchExplore",
  async ({ page = 1, limit = 20, filters = {} }, { rejectWithValue }) => {
    try {
      const params = { page, limit, ...filters };
      const data = await getExploreEvents(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch events"
      );
    }
  }
);

const initialState = {
  nearbyEvents: [],
  clusteredEvents: [],
  featuredEvents: [],
  selectedEvent: null,
  myEvents: [],
  attendingEvents: [],
  savedEvents: [],
  filterOptions: null,
  loading: false,
  error: null,
  successMessage: null,
  pagination: { page: 1, limit: 20, total: 0 },
  exploreEvents: [],
  exploreLoading: false,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
    resetEvents: (state) => {
      state.nearbyEvents = [];
      state.clusteredEvents = [];
      state.selectedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Nearby Events
      .addCase(fetchNearbyEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyEvents = action.payload.data || [];
      })
      .addCase(fetchNearbyEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clustered Events
      .addCase(fetchClusteredEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClusteredEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.clusteredEvents = action.payload.data || [];
      })
      .addCase(fetchClusteredEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search
      .addCase(searchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyEvents = action.payload.data || [];
      })
      .addCase(searchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Event Details
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvent = action.payload.data;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Featured Events
      .addCase(fetchFeaturedEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredEvents = action.payload.data || [];
      })
      .addCase(fetchFeaturedEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Filter Options
      .addCase(fetchMapFilterOptions.fulfilled, (state, action) => {
        state.filterOptions = action.payload.data;
      })
      // Create Event
      .addCase(createNewEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Event created successfully';
        state.myEvents.unshift(action.payload.data);
      })
      .addCase(createNewEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Event updated successfully';
        const index = state.myEvents.findIndex(
          (e) => e._id === action.payload.data._id
        );
        if (index > -1) {
          state.myEvents[index] = action.payload.data;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Save
      .addCase(toggleSaveEvent.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      // Attend Event
      .addCase(attendEvent.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      // My Events
      .addCase(fetchMyEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.myEvents = action.payload.data || [];
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Attending Events
      .addCase(fetchAttendingEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendingEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.attendingEvents = action.payload.data || [];
      })
      .addCase(fetchAttendingEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Saved Events
      .addCase(fetchSavedEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSavedEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.savedEvents = action.payload.data || [];
      })
      .addCase(fetchSavedEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchExploreEvents.pending, (state) => {
        state.exploreLoading = true;
        state.error = null;
      })
      .addCase(fetchExploreEvents.fulfilled, (state, action) => {
        state.exploreLoading = false;
        state.exploreEvents = action.payload.data || [];
        state.pagination = action.payload.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        };
      })
      .addCase(fetchExploreEvents.rejected, (state, action) => {
        state.exploreLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearSelectedEvent, resetEvents } =
  eventsSlice.actions;
export default eventsSlice.reducer;