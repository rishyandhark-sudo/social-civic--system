/**
 * Converts a manually-entered address string into [longitude, latitude].
 *
 * This is a stub — it does not call any external API yet, so it always
 * returns null coordinates. Complaints will still save fine (coordinates
 * are optional), but they won't appear on the map/hotspots view until
 * this is wired to a real geocoder.
 *
 * To make it real, pick one:
 *   - Nominatim (OpenStreetMap, free, rate-limited):
 *       GET https://nominatim.openstreetmap.org/search?q=<address>&format=json
 *   - Google Geocoding API (paid, more reliable):
 *       GET https://maps.googleapis.com/maps/api/geocode/json?address=<address>&key=<key>
 *   - Mapbox Geocoding API (paid, pairs well with Mapbox GL on the frontend)
 *
 * Whichever you pick, keep the function signature the same so nothing
 * else in complaint.service.js has to change.
 */
async function geocodeAddress(address) {
  try {
    // --- Replace this block with a real provider call ---
    // Example (Nominatim):
    // const res = await fetch(
    //   `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    //   { headers: { 'User-Agent': 'social-civic-system' } }
    // );
    // const data = await res.json();
    // if (data[0]) return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    // -------------------------------------------------------
    return null;
  } catch (err) {
    console.warn('Geocoding failed, saving complaint without coordinates:', err.message);
    return null;
  }
}

module.exports = { geocodeAddress };
