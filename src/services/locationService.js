class LocationService {
  constructor() {
    this.currentLocation = null;
    this.locationPermission = null;
  }

  // Request location permission and get current position
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          
          this.currentLocation = location;
          this.locationPermission = 'granted';
          resolve(location);
        },
        (error) => {
          this.locationPermission = 'denied';
          let errorMessage = 'Unable to retrieve location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  // Reverse geocoding to get address from coordinates
  async reverseGeocode(latitude, longitude) {
    try {
      // Using a free geocoding service (you can replace with your preferred service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      return {
        formatted: data.locality || data.city || data.principalSubdivision || 'Unknown Location',
        city: data.city || data.locality,
        state: data.principalSubdivision,
        country: data.countryName,
        neighborhood: data.neighbourhood,
        district: data.localityInfo?.administrative?.[2]?.name,
        pincode: data.postcode,
        full: `${data.locality || data.city}, ${data.principalSubdivision}, ${data.countryName}`
      };
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return {
        formatted: 'Current Location',
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown',
        full: 'Location detected but address unavailable'
      };
    }
  }

  // Get formatted location string for OpenAI
  async getLocationForAnalysis() {
    try {
      if (!this.currentLocation) {
        await this.getCurrentLocation();
      }

      const address = await this.reverseGeocode(
        this.currentLocation.latitude,
        this.currentLocation.longitude
      );

      return {
        coordinates: {
          lat: this.currentLocation.latitude,
          lng: this.currentLocation.longitude
        },
        address: address,
        formatted: address.full,
        accuracy: this.currentLocation.accuracy,
        source: 'gps'
      };
    } catch (error) {
      console.warn('Could not get GPS location:', error.message);
      return null;
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance; // Distance in kilometers
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Find nearest NGOs based on current location
  findNearestNGOs(ngos, maxDistance = 50) {
    if (!this.currentLocation || !ngos || ngos.length === 0) {
      return ngos;
    }

    const userLat = this.currentLocation.latitude;
    const userLng = this.currentLocation.longitude;

    // Add distance to each NGO and sort by distance
    const ngosWithDistance = ngos.map(ngo => {
      // For NGOs without coordinates, estimate based on city
      let ngoLat = ngo.coordinates?.lat;
      let ngoLng = ngo.coordinates?.lng;

      // If NGO doesn't have coordinates, use city center estimates
      if (!ngoLat || !ngoLng) {
        const cityCoords = this.getCityCoordinates(ngo.city);
        ngoLat = cityCoords.lat;
        ngoLng = cityCoords.lng;
      }

      const distance = this.calculateDistance(userLat, userLng, ngoLat, ngoLng);
      
      return {
        ...ngo,
        distance: distance,
        distanceText: distance < 1 ? 
          `${Math.round(distance * 1000)}m away` : 
          `${distance.toFixed(1)}km away`
      };
    });

    // Filter by max distance and sort by distance
    return ngosWithDistance
      .filter(ngo => ngo.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }

  // Get approximate city center coordinates
  getCityCoordinates(city) {
    const cityCoords = {
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'delhi': { lat: 28.6139, lng: 77.2090 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'jaipur': { lat: 26.9124, lng: 75.7873 }
    };

    const normalizedCity = city.toLowerCase();
    return cityCoords[normalizedCity] || { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
  }

  // Check if location permission was granted
  hasLocationPermission() {
    return this.locationPermission === 'granted';
  }

  // Get current location data
  getCurrentLocationData() {
    return this.currentLocation;
  }

  // Generate location prompt for OpenAI
  generateLocationPrompt() {
    if (!this.currentLocation) {
      return "No location data available. Please ask user for location details.";
    }

    return `User's current GPS location: ${this.currentLocation.latitude}, ${this.currentLocation.longitude} (accuracy: ${this.currentLocation.accuracy}m). Use this precise location for NGO recommendations and location analysis.`;
  }

  // Watch position for continuous updates
  watchPosition(callback) {
    if (!navigator.geolocation) {
      return null;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000 // Update every minute
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        callback(this.currentLocation);
      },
      (error) => {
        console.warn('Location watch error:', error);
      },
      options
    );
  }

  // Stop watching position
  clearWatch(watchId) {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  // Format location for display
  formatLocationForDisplay(location) {
    if (!location) return 'Location unavailable';
    
    if (location.source === 'gps') {
      return `📍 ${location.address.formatted} (GPS: ${location.accuracy}m accuracy)`;
    }
    
    return `📍 ${location.formatted}`;
  }
}

// Create singleton instance
const locationService = new LocationService();
export default locationService; 