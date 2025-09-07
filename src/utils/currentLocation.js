// utils/currentLocation.js
/**
 * Get the current device's geographic location using the browser's Geolocation API.
 *
 * @returns {Promise<Object>} - Returns a Promise that resolves to an object with the device's coordinates:
 *   - {number} lat - Latitude of the device.
 *   - {number} lng - Longitude of the device.
 * The Promise is rejected if:
 *   - Geolocation is not supported by the browser.
 *   - There is an error retrieving the device's location.
 */
export function getDeviceLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // console.log("📍 Device Coordinates:", coords);
        resolve(coords);
      },
      (error) => {
        console.error("❌ Geolocation error:", error.message);
        reject(error);
      }
    );
  });
}
