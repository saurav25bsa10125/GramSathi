// GramSathi Live Location Geolocation Service
// Queries device coordinates via navigator.geolocation with explicit permission

window.GramLocation = (function() {
  function isSupported() {
    return 'geolocation' in navigator;
  }

  function getCoordinates() {
    return new Promise((resolve, reject) => {
      if (!isSupported()) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude.toFixed(4),
            longitude: position.coords.longitude.toFixed(4),
            accuracyMeters: Math.round(position.coords.accuracy)
          });
        },
        (error) => {
          let message = 'Unable to retrieve location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access was denied. Please allow location permission in your browser.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is currently unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          reject(new Error(message));
        },
        options
      );
    });
  }

  return {
    isSupported,
    getCoordinates
  };
})();
