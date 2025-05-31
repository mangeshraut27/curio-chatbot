/**
 * Emergency Contacts Service
 * 
 * Provides location-based emergency contact management for animal rescue situations.
 * Features automatic GPS location detection, intelligent caching, and AI-generated
 * emergency contacts tailored to the user's location.
 * 
 * Key Features:
 * - Auto-initialization on app load with GPS location detection
 * - Smart caching system with 30-minute expiry
 * - Location change detection (5km threshold for refresh)
 * - Manual location update capability
 * - Comprehensive error handling with Sentry logging
 * 
 * @author Curio Development Team
 * @version 1.0.0
 */

import openAIService from './openai';
import locationService from './locationService';
import { logError, addBreadcrumb } from '../utils/sentry';

/**
 * EmergencyContactsService Class
 * 
 * Manages emergency contacts for animal rescue situations with location intelligence.
 * Provides caching, auto-refresh, and fallback mechanisms.
 */
class EmergencyContactsService {
  constructor() {
    /** @type {Object|null} Cached emergency contacts data */
    this.cachedContacts = null;
    
    /** @type {Object|null} Last location fetch metadata */
    this.lastLocationFetch = null;
    
    /** @type {number} Cache expiry time in milliseconds (30 minutes) */
    this.cacheExpiryTime = 30 * 60 * 1000; // 30 minutes
    
    /** @type {boolean} Service initialization status */
    this.isInitialized = false;
    
    /** @type {Promise|null} Initialization promise to prevent duplicate calls */
    this.initializationPromise = null;
  }

  /**
   * Initialize emergency contacts on app load
   * 
   * Automatically detects user location and fetches relevant emergency contacts.
   * Uses caching to avoid unnecessary API calls and provides fallback contacts
   * if location detection fails.
   * 
   * @returns {Promise<Object>} Emergency contacts data with location info
   * @throws {Error} When initialization completely fails
   * 
   * @example
   * const contactsData = await emergencyContactsService.initializeEmergencyContacts();
   * console.log(contactsData.emergencyContacts); // Array of contacts
   */
  async initializeEmergencyContacts() {
    // Prevent duplicate initialization
    if (this.isInitialized) {
      return this.cachedContacts;
    }

    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  /**
   * Internal method to perform the actual initialization
   * 
   * @private
   * @returns {Promise<Object>} Emergency contacts data
   */
  async _performInitialization() {
    try {
      addBreadcrumb(
        'Emergency Contacts: Starting initialization',
        'emergency_contacts',
        'info'
      );

      // Attempt to get user location
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

      // Fetch emergency contacts from AI service
      const emergencyData = await openAIService.fetchEmergencyContacts(locationData, {
        count: 5,
        animalType: 'all',
        urgency: 'high'
      });

      // Cache the results with metadata
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

      // Return basic fallback on complete failure
      this.cachedContacts = this._getBasicFallback();
      this.isInitialized = true;
      return this.cachedContacts;
    }
  }

  /**
   * Get current emergency contacts (cached or fresh)
   * 
   * Returns cached contacts if still valid, otherwise fetches fresh data.
   * Automatically handles cache validation and refresh logic.
   * 
   * @param {boolean} forceRefresh - Force refresh even if cache is valid
   * @returns {Promise<Object>} Emergency contacts data
   * 
   * @example
   * // Get cached contacts (default behavior)
   * const contacts = await service.getEmergencyContacts();
   * 
   * // Force refresh from API
   * const freshContacts = await service.getEmergencyContacts(true);
   */
  async getEmergencyContacts(forceRefresh = false) {
    // Initialize if not already done
    if (!this.isInitialized) {
      return await this.initializeEmergencyContacts();
    }

    // Return cached data if valid and no forced refresh
    if (!forceRefresh && this._isCacheValid()) {
      return this.cachedContacts;
    }

    // Refresh contacts with current location
    return await this.refreshEmergencyContacts();
  }

  /**
   * Refresh emergency contacts with current location
   * 
   * Fetches fresh location data and updates emergency contacts if location
   * has changed significantly (>5km) or cache has expired.
   * 
   * @returns {Promise<Object>} Refreshed emergency contacts data
   * 
   * @example
   * const refreshedContacts = await service.refreshEmergencyContacts();
   */
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
      
      // Skip refresh if location unchanged and cache valid
      if (!locationChanged && this._isCacheValid()) {
        return this.cachedContacts;
      }

      // Fetch fresh emergency contacts
      const emergencyData = await openAIService.fetchEmergencyContacts(currentLocation, {
        count: 5,
        animalType: 'all',
        urgency: 'high'
      });

      // Update cache with new data
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

  /**
   * Get emergency contacts for specific animal rescue situation
   * 
   * Fetches contacts tailored to specific animal type and urgency level.
   * Useful for situation-specific recommendations.
   * 
   * @param {string} animalType - Type of animal ('dog', 'cat', 'bird', 'wildlife', 'all')
   * @param {string} urgency - Urgency level ('low', 'medium', 'high', 'critical')
   * @returns {Promise<Object>} Filtered emergency contacts data
   * 
   * @example
   * // Get contacts for urgent dog rescue
   * const dogContacts = await service.getEmergencyContactsForSituation('dog', 'high');
   * 
   * // Get general wildlife contacts
   * const wildlifeContacts = await service.getEmergencyContactsForSituation('wildlife', 'medium');
   */
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

  /**
   * Check if cache is still valid based on expiry time
   * 
   * @private
   * @returns {boolean} True if cache is valid, false if expired
   */
  _isCacheValid() {
    if (!this.lastLocationFetch) return false;
    
    const timeSinceLastFetch = Date.now() - this.lastLocationFetch.timestamp;
    return timeSinceLastFetch < this.cacheExpiryTime;
  }

  /**
   * Check if location has changed significantly (>5km threshold)
   * 
   * Compares current location with last cached location to determine
   * if emergency contacts need to be refreshed.
   * 
   * @private
   * @param {Object} currentLocation - Current location data
   * @returns {boolean} True if location changed significantly
   */
  _hasLocationChanged(currentLocation) {
    if (!this.lastLocationFetch?.location || !currentLocation) {
      return true; // Assume changed if we can't compare
    }

    const lastCoords = this.lastLocationFetch.location.coordinates;
    const currentCoords = currentLocation.coordinates;

    if (!lastCoords || !currentCoords) {
      // Compare cities if no coordinates available
      const lastCity = this.lastLocationFetch.location.address?.city;
      const currentCity = currentLocation.address?.city;
      return lastCity !== currentCity;
    }

    // Calculate distance between locations using Haversine formula
    const distance = locationService.calculateDistance(
      lastCoords.lat,
      lastCoords.lng,
      currentCoords.lat,
      currentCoords.lng
    );

    // Consider location changed if moved more than 5km
    return distance > 5;
  }

  /**
   * Filter cached contacts based on animal type and urgency criteria
   * 
   * @private
   * @param {string} animalType - Animal type to filter by
   * @param {string} urgency - Urgency level to filter by
   * @returns {Object} Filtered contacts data
   */
  _filterCachedContacts(animalType, urgency) {
    if (!this.cachedContacts?.emergencyContacts) {
      return this._getBasicFallback();
    }

    const filtered = this.cachedContacts.emergencyContacts.filter(contact => {
      // Check animal type specialization
      const animalMatch = animalType === 'all' || 
        contact.specialization.includes(animalType) ||
        contact.specialization.includes('all animals');

      // Check urgency level compatibility
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

  /**
   * Get basic fallback contacts when all other methods fail
   * 
   * Provides essential emergency contacts that work nationwide.
   * Used as last resort when location detection and API calls fail.
   * 
   * @private
   * @returns {Object} Basic fallback emergency contacts
   */
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

  /**
   * Manual location update with user-provided location string
   * 
   * Allows users to manually specify their location when GPS is unavailable
   * or inaccurate. Extracts city information and fetches relevant contacts.
   * 
   * @param {string} manualLocation - User-provided location string
   * @returns {Promise<Object>} Emergency contacts for manual location
   * 
   * @example
   * const contacts = await service.updateLocationAndRefresh("Mumbai, Maharashtra");
   */
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
      
      // Update cache with manual location data
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

  /**
   * Extract city name from manual location text
   * 
   * Uses pattern matching to identify major Indian cities from
   * user-provided location strings.
   * 
   * @private
   * @param {string} locationText - Location text to parse
   * @returns {string|null} Extracted city name or null
   */
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

  /**
   * Get cached contacts without making API calls
   * 
   * @returns {Object|null} Currently cached contacts or null
   */
  getCachedContacts() {
    return this.cachedContacts;
  }

  /**
   * Force clear all cached data and reset service state
   * 
   * Useful for testing or when user wants to start fresh.
   * Forces re-initialization on next service call.
   */
  clearCache() {
    this.cachedContacts = null;
    this.lastLocationFetch = null;
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// Create and export singleton instance for global use
const emergencyContactsService = new EmergencyContactsService();
export default emergencyContactsService; 