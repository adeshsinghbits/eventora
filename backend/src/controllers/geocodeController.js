import axios from "axios";

export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "lat & lon required" });
    }

    const response = await axios.get(
      "https://api.geoapify.com/v1/geocode/reverse",
      {
        params: {
          lat,
          lon,
          apiKey: process.env.GEOAPIFY_API_KEY,
        },
      }
    );

    const result = response.data.features[0];
    const formattedData = {
        name: result?.properties?.name || "",
        address: result?.properties?.formatted || "",
        city: result?.properties?.city || "",
        state: result?.properties?.state || "",
        country: result?.properties?.country || "",
        lat: result?.geometry?.coordinates[1],
        lng: result?.geometry?.coordinates[0],
        };

        res.json(formattedData);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Reverse geocoding failed" });
  }
};

export const geocodePlace = async (req, res) => {
  try {
    const { place } = req.query;

    if (!place) {
      return res.status(400).json({
        message: "place query is required",
      });
    }

    const response = await axios.get(
      "https://api.geoapify.com/v1/geocode/search",
      {
        params: {
          text: place,
          apiKey: process.env.GEOAPIFY_API_KEY,
        },
      }
    );

    const result = response.data.features[0];

    if (!result) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    const formattedData = {
      name: result?.properties?.name || "",
      address: result?.properties?.formatted || "",
      city: result?.properties?.city || "",
      state: result?.properties?.state || "",
      country: result?.properties?.country || "",
      lat: result?.geometry?.coordinates[1],
      lng: result?.geometry?.coordinates[0],
    };

    res.json(formattedData);
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      message: "Geocoding failed",
    });
  }
};