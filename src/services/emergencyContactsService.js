import openAIService from './openai';
import locationService from './locationService';
import { logError, addBreadcrumb } from '../utils/sentry';

class EmergencyContactsService {
  constructor() {
    this.cachedContacts = null;
    this.lastLocationFetch = null;
    this.cacheExpiryTime = 30 * 60 * 1000; // 30 minutes
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  // Initialize emergency contacts on app load
  async initializeEmergencyContacts() {
    if (this.isInitialized) {
      return this.cachedContacts;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  async _performInitialization() {
    try {
      addBreadcrumb(
        'Emergency Contacts: Starting initialization',
        'emergency_contacts',
        'info'
      );

      // Try to get user location
      let locationData = null;
      try {
        locationData = await locationService.getLocationForAnalysis();
        addBreadcrumb(
          'Emergency Contacts: Location acquired',
          'emergency_contacts',
          'info',
          { 
            hasLocation: !!locationData,
            city: locationData?.address?.city 
          }
        );
      } catch (locationError) {
        console.warn('Could not get location for emergency contacts:', locationError.message);
        addBreadcrumb(
          'Emergency Contacts: Location failed, using fallback',
          'emergency_contacts',
          'warning',
          { error: locationError.message }
        );
      }

      // Fetch emergency contacts from OpenAI
      const emergencyData = await openAIService.fetchEmergencyContacts(locationData, {
        count: 5,
        animalType: 'all',
        urgency: 'high'
      });

      // Cache the results
      this.cachedContacts = emergencyData;
      this.lastLocationFetch = {
        timestamp: Date.now(),
        location: locationData
      };
      this.isInitialized = true;

      addBreadcrumb(
        'Emergency Contacts: Initialization completed',
        'emergency_contacts',
        'info',
        { 
          contactsCount: emergencyData?.emergencyContacts?.length || 0,
          location: emergencyData?.location?.detected 
        }
      );

      return emergencyData;

    } catch (error) {
      console.error('Emergency contacts initialization failed:', error);
      
      logError(error, {
        context: 'emergency_contacts_initialization_failure',
        stage: 'initialization'
      });

      // Return basic fallback
      this.cachedContacts = this._getBasicFallback();
      this.isInitialized = true;
      return this.cachedContacts;
    }
  }

  // Get current emergency contacts (cached or fresh)
  async getEmergencyContacts(forceRefresh = false) {
    // If not initialized, initialize first
    if (!this.isInitialized) {
      return await this.initializeEmergencyContacts();
    }

    // Check if cache is still valid and not forced refresh
    if (!forceRefresh && this._isCacheValid()) {
      return this.cachedContacts;
    }

    // Refresh contacts
    return await this.refreshEmergencyContacts();
  }

  // Refresh emergency contacts with current location
  async refreshEmergencyContacts() {
    try {
      addBreadcrumb(
        'Emergency Contacts: Refreshing contacts',
        'emergency_contacts',
        'info'
      );

      // Get current location
      const currentLocation = await locationService.getLocationForAnalysis();
      
      // Check if location has changed significantly
      const locationChanged = this._hasLocationChanged(currentLocation);
      
      if (!locationChanged && this._isCacheValid()) {
        // Location hasn't changed much and cache is still valid
        return this.cachedContacts;
      }

      // Fetch fresh emergency contacts
      const emergencyData = await openAIService.fetchEmergencyContacts(currentLocation, {
        count: 5,
        animalType: 'all',
        urgency: 'high'
      });

      // Update cache
      this.cachedContacts = emergencyData;
      this.lastLocationFetch = {
        timestamp: Date.now(),
        location: currentLocation
      };

      addBreadcrumb(
        'Emergency Contacts: Refresh completed',
        'emergency_contacts',
        'info',
        { 
          contactsCount: emergencyData?.emergencyContacts?.length || 0,
          locationChanged 
        }
      );

      return emergencyData;

    } catch (error) {
      console.error('Emergency contacts refresh failed:', error);
      
      logError(error, {
        context: 'emergency_contacts_refresh_failure'
      });

      // Return cached data if available, otherwise fallback
      return this.cachedContacts || this._getBasicFallback();
    }
  }

  // Get emergency contacts for specific urgency/animal type
  async getEmergencyContactsForSituation(animalType = 'all', urgency = 'high') {
    try {
      const locationData = await locationService.getLocationForAnalysis();
      
      return await openAIService.fetchEmergencyContacts(locationData, {
        count: 3,
        animalType,
        urgency
      });

    } catch (error) {
      console.error('Situation-specific contacts fetch failed:', error);
      
      logError(error, {
        context: 'emergency_contacts_situation_fetch',
        animalType,
        urgency
      });

      // Filter cached contacts based on criteria
      return this._filterCachedContacts(animalType, urgency);
    }
  }

  // Check if cache is still valid
  _isCacheValid() {
    if (!this.lastLocationFetch) return false;
    
    const timeSinceLastFetch = Date.now() - this.lastLocationFetch.timestamp;
    return timeSinceLastFetch < this.cacheExpiryTime;
  }

  // Check if location has changed significantly
  _hasLocationChanged(currentLocation) {
    if (!this.lastLocationFetch?.location || !currentLocation) {
      return true; // Assume changed if we can't compare
    }

    const lastCoords = this.lastLocationFetch.location.coordinates;
    const currentCoords = currentLocation.coordinates;

    if (!lastCoords || !currentCoords) {
      // Compare cities if no coordinates
      const lastCity = this.lastLocationFetch.location.address?.city;
      const currentCity = currentLocation.address?.city;
      return lastCity !== currentCity;
    }

    // Calculate distance between locations
    const distance = locationService.calculateDistance(
      lastCoords.lat,
      lastCoords.lng,
      currentCoords.lat,
      currentCoords.lng
    );

    // Consider location changed if moved more than 5km
    return distance > 5;
  }

  // Filter cached contacts based on criteria
  _filterCachedContacts(animalType, urgency) {
    if (!this.cachedContacts?.emergencyContacts) {
      return this._getBasicFallback();
    }

    const filtered = this.cachedContacts.emergencyContacts.filter(contact => {
      // Check animal type specialization
      const animalMatch = animalType === 'all' || 
        contact.specialization.includes(animalType) ||
        contact.specialization.includes('all animals');

      // Check urgency level
      const urgencyLevels = {
        'low': ['standard', 'medium', 'high', 'critical'],
        'medium': ['medium', 'high', 'critical'],
        'high': ['high', 'critical'],
        'critical': ['critical']
      };
      
      const urgencyMatch = urgencyLevels[urgency]?.includes(contact.urgencyLevel);

      return animalMatch && urgencyMatch;
    });

    return {
      ...this.cachedContacts,
      emergencyContacts: filtered.slice(0, 3) // Limit to 3 most relevant
    };
  }

  // Get basic fallback contacts
  _getBasicFallback() {
    return {
      location: {
        detected: 'India',
        coordinates: null,
        accuracy: 'country'
      },
      emergencyContacts: [
        {
          name: 'National Animal Welfare Helpline',
          type: 'government',
          phone: '1962',
          email: 'help@animalwelfare.gov.in',
          address: 'India',
          specialization: ['all animals', 'emergency'],
          availability: '24/7',
          is24x7: true,
          urgencyLevel: 'critical',
          distanceKm: null,
          description: 'Government emergency helpline for all animal emergencies',
          services: ['emergency rescue', 'coordination'],
          emergencyProtocol: 'Stay calm, keep animal safe, describe situation clearly'
        },
        {
          name: 'Local Animal Control',
          type: 'animal_control',
          phone: '+91-11-2345-6789',
          email: 'control@local.gov.in',
          address: 'Municipal Office',
          specialization: ['stray animals', 'public safety'],
          availability: '9 AM - 6 PM',
          is24x7: false,
          urgencyLevel: 'high',
          distanceKm: null,
          description: 'Local municipal animal control services',
          services: ['stray animal rescue', 'public safety'],
          emergencyProtocol: 'Document situation, ensure public safety first'
        }
      ],
      generalGuidance: {
        immediateSteps: [
          'Ensure your safety first',
          'Call appropriate emergency contact',
          'Follow their instructions'
        ],
        safetyTips: [
          'Keep safe distance from unknown animals',
          'Have emergency numbers ready'
        ],
        whenToCall: 'Call immediately for emergency situations'
      },
      backupContacts: []
    };
  }

  // Manual location update (when user provides location)
  async updateLocationAndRefresh(manualLocation) {
    try {
      // Create location data from manual input
      const locationData = {
        address: {
          formatted: manualLocation,
          city: this._extractCityFromText(manualLocation)
        },
        coordinates: null,
        source: 'manual'
      };

      // Fetch contacts for manual location
      const emergencyData = await openAIService.fetchEmergencyContacts(locationData);
      
      // Update cache
      this.cachedContacts = emergencyData;
      this.lastLocationFetch = {
        timestamp: Date.now(),
        location: locationData
      };

      return emergencyData;

    } catch (error) {
      console.error('Manual location update failed:', error);
      logError(error, { context: 'emergency_contacts_manual_update', manualLocation });
      return this.cachedContacts || this._getBasicFallback();
    }
  }

  // Extract city from manual location text
  _extractCityFromText(locationText) {
    const cityMappings = {
      'mumbai': ['mumbai', 'bombay'],
      'delhi': ['delhi', 'new delhi'],
      'bangalore': ['bangalore', 'bengaluru'],
      'chennai': ['chennai', 'madras'],
      'hyderabad': ['hyderabad'],
      'pune': ['pune'],
      'kolkata': ['kolkata', 'calcutta'],
      'jaipur': ['jaipur']
    };

    const text = locationText.toLowerCase();
    
    for (const [city, aliases] of Object.entries(cityMappings)) {
      if (aliases.some(alias => text.includes(alias))) {
        return city;
      }
    }

    return null;
  }

  // Get cached contacts without API call
  getCachedContacts() {
    return this.cachedContacts;
  }

  // Force clear cache
  clearCache() {
    this.cachedContacts = null;
    this.lastLocationFetch = null;
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// Create singleton instance
const emergencyContactsService = new EmergencyContactsService();
export default emergencyContactsService; 