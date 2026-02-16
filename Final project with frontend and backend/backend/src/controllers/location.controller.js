// import geoip from "geoip-lite";
import { configDotenv } from "dotenv";
import fetch from "node-fetch";

export const getUserLocation = async (req, res) => {
  try {
    const token = process.env.TOKEN;
    const response = await fetch(
      "https://ipinfo.io/json?token="+token
    );
    const raw = await response.json();

    const [lat, lng] = raw.loc.split(",").map(Number);

    res.json({
      city: raw.city,
      region: raw.region,
      country: raw.country,
      ip: raw.ip,
      timezone: raw.timezone,
      isp: raw.org,
      latitude: lat,
      longitude: lng,
    });
  } catch {
    res.status(500).json({ message: "Location fetch failed" });
  }
};
