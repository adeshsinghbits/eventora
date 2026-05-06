import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { FaCrosshairs } from "react-icons/fa";
import { createNewEvent, uploadEventBanner, reverseGeocodeLocation } from "../../features/event/eventSlice";
import "leaflet/dist/leaflet.css";
import { toast } from "react-hot-toast";
import markericon from "../../assets/marker-icon.png";
import markershadow from "../../assets/marker-shadow.png"

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markericon,
  shadowUrl: markershadow,
});

// Button to get current location (with stopPropagation)
const CurrentLocationButton = ({ setLocation, setFormData, autoFill }) => {
  const dispatch = useDispatch();
  const map = useMap();

  const handleCurrentLocation = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    e?.nativeEvent?.stopImmediatePropagation?.();
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        map.flyTo([lat, lng], 14);
        setLocation({ lat, lng });

        if (!autoFill) return;

        try {
          const data = await dispatch(reverseGeocodeLocation({ lat, lng })).unwrap();
          setFormData((prev) => ({
            ...prev,
            venueName: prev.venueName.trim() || data.name || "",
            addressLine1: prev.addressLine1.trim() || data.address || "",
            city: prev.city.trim() || data.city || "",
            state: prev.state.trim() || data.state || "",
            country: prev.country.trim() || data.country || "",
            postalCode: prev.postalCode.trim() || data.postcode || "",
          }));
        } catch (err) {
          console.error("Geocode failed:", err);
          toast.error("Could not get address details");
        }
      },
      (error) => {
        console.error("Location error:", error);
        toast.error("Unable to get your location. Please check permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="absolute top-24 left-4 z-9999 pointer-events-auto">
      <button
        onClick={handleCurrentLocation}
        className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition"
        title="Use my current location"
      >
        <FaCrosshairs className="text-purple-600 text-xl" />
      </button>
    </div>

  );
};

// LocationPicker component (handles map clicks)
const LocationPicker = ({ setLocation, setFormData, formData, autoFill }) => {
  const dispatch = useDispatch();

  useMapEvents({
    async click(e) {
      if (e.originalEvent?.target?.closest("button")) return; 
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });

      if (!autoFill) return;

      try {
        const data = await dispatch(reverseGeocodeLocation({ lat, lng })).unwrap();
        setFormData((prev) => ({
          ...prev,
          venueName: prev.venueName.trim() || data.name || "",
          addressLine1: prev.addressLine1.trim() || data.address || "",
          city: prev.city.trim() || data.city || "",
          state: prev.state.trim() || data.state || "",
          country: prev.country.trim() || data.country || "",
          postalCode: prev.postalCode.trim() || data.postcode || "",
        }));
      } catch (err) {
        console.error("Geocode failed:", err);
        toast.error("Failed to get address details");
      }
    },
  });

  return null;
};

// Main Component
export default function CreateEventPage() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    venueName: "",
    contactEmail: "",
    isFree: true,
    price: 0,
    totalSeats: 100,
    addressLine1: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: "draft",
    visibility: "public",
  });

  const [location, setLocation] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([28.7041, 77.1025]);
  const [autoFill, setAutoFill] = useState(true);

  // Initial map center from user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
        () => console.log("Geolocation denied, using fallback")
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.startDate) return "Start date is required";
    if (!formData.endDate) return "End date is required";
    if (!formData.startTime) return "Start time is required";
    if (!formData.endTime) return "End time is required";
    if (!formData.venueName.trim()) return "Venue name is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State/Province is required";
    if (!formData.contactEmail.trim()) return "Contact email is required";
    if (!location) return "Please select a location on the map";
    if (!/^\S+@\S+\.\S+$/.test(formData.contactEmail)) return "Invalid email address";
    if (formData.totalSeats <= 0) return "Total seats must be a positive number";
    if (!formData.isFree && (!formData.price || formData.price <= 0)) {
      return "Price must be greater than 0 for paid events";
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    if (endDateTime <= startDateTime) {
      return "End date/time must be after start date/time";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      let bannerResult = null;
      
      if (bannerImage) {
      const uploaded = await dispatch(
        uploadEventBanner({ file: bannerImage })
      ).unwrap();

      bannerResult = {
        public_id: uploaded.public_id,
        url: uploaded.url,
      };
    }

      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.description.slice(0, 120),
        category: formData.category,
        venueName: formData.venueName,
        contactEmail: formData.contactEmail,
        totalSeats: formData.totalSeats,
        isFree: formData.isFree,
        price: formData.isFree ? 0 : formData.price,
        timezone: formData.timezone,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        addressLine1: formData.addressLine1,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode || "000000",
        ticketType: formData.isFree ? "free" : "paid",
        status: formData.status,
        visibility: formData.visibility,
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
        bannerImage: {
          public_id: bannerResult.public_id,
          url: bannerResult.url,
        },
      };

      await dispatch(createNewEvent(payload)).unwrap();

      toast.success("Event created successfully! 🎉");

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "other",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        venueName: "",
        contactEmail: "",
        isFree: true,
        price: 0,
        totalSeats: 100,
        addressLine1: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setLocation(null);
      setBannerImage(null);
    } catch (err) {
      toast.error(err.message || "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "music", "tech", "sports", "education", "food", "business", "festival", "meetup", "other"
  ];

  return (
    <div className="flex flex-col fixed top-0 lg:flex-row h-screen bg-slate-900 w-full">
      {/* LEFT: FORM PANEL */}
      <div className="w-full lg:w-96 pt-16 overflow-y-auto scrollbar-custom bg-slate-900 text-gray-300 shadow-xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl bg-slate-900 text-center font-bold text-purple-700 p-0 sticky top-0 shadow-md shadow-slate-600 py-4 z-10 mb-4">
            Create New Event
          </h2>

          <div className="space-y-4 px-4">
            <div>
              <label className="block font-medium">Event Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Enter event title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-medium">Event Description *</label>
              <textarea
                name="description"
                placeholder="Enter full description (minimum 50 words)"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full p-3 border rounded-lg border-gray-300 focus:border-purple-500 focus:ring-1 overflow-y-auto scrollbar-custom focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-medium">Event Type</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg border-gray-300"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium">Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="p-3 border rounded-lg w-full" />
              </div>
              <div>
                <label className="block font-medium">Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="p-3 border rounded-lg w-full" />
              </div>
              <div>
                <label className="block font-medium">End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="p-3 border rounded-lg w-full" />
              </div>
              <div>
                <label className="block font-medium">End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="p-3 border rounded-lg w-full" />
              </div>
            </div>

            <div>
              <label className="block font-medium">Venue Name *</label>
              <input
                type="text"
                name="venueName"
                placeholder="Venue Name"
                value={formData.venueName}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium">Street Address</label>
              <input
                type="text"
                name="addressLine1"
                placeholder="Street Address"
                value={formData.addressLine1}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium">City *</label>
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="p-3 border rounded-lg w-full" />
              </div>
              <div>
                <label className="block font-medium">State *</label>
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="p-3 border rounded-lg w-full" />
              </div>
              <div>
                <label className="block font-medium">Country</label>
                <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className="p-3 border rounded-lg w-full" />
              </div>
              <div>
                <label className="block font-medium">Postal Code</label>
                <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} className="p-3 border rounded-lg w-full" />
              </div>
            </div>

            <div>
              <label className="block font-medium">Contact Email *</label>
              <input
                type="email"
                name="contactEmail"
                placeholder="Contact Email"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} />
                Free Event
              </label>
              {!formData.isFree && (
                <div>
                  <label className="block font-medium">Price (INR) *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-32 p-3 border rounded-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium">Total Seats *</label>
              <input
                type="number"
                name="totalSeats"
                placeholder="Total Seats"
                value={formData.totalSeats}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerImage(e.target.files[0])}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block font-medium">Visibility</label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Creating Event..." : "Create Event"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* RIGHT: MAP PANEL */}
      <div className="flex-1 relative h-96 lg:h-full">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          />
          <LocationPicker
            setLocation={setLocation}
            setFormData={setFormData}
            formData={formData}
            autoFill={autoFill}
          />
          {location && <Marker position={[location.lat, location.lng]} />}
          <CurrentLocationButton
            setLocation={setLocation}
            setFormData={setFormData}
            autoFill={autoFill}
          />
        </MapContainer>

        {/* Auto-fill checkbox (on map) */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 p-2 rounded shadow text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoFill}
              onChange={(e) => setAutoFill(e.target.checked)}
            />
            Auto-fill address on map click / current location
          </label>
        </div>

        {/* Info note */}
        <div className="absolute bottom-4 right-4 z-10 bg-white/80 p-2 rounded shadow text-sm pointer-events-none">
          ℹ️ Click map or use <FaCrosshairs className="inline text-purple-600" /> button
        </div>
      </div>
    </div>
  );
}