/**
 * OpenAI Service
 * 
 * Provides AI-powered analysis for animal rescue situations using OpenAI's GPT models.
 * Features intelligent message analysis, emergency contact generation, NGO recommendations,
 * and location-aware rescue assistance.
 * 
 * Key Features:
 * - Advanced animal rescue situation detection and triage
 * - GPS-enhanced location analysis and emergency contact generation
 * - NGO recommendation system with distance-based matching
 * - Urgency assessment with 1-10 scoring system
 * - Comprehensive error handling and fallback mechanisms
 * 
 * @author Curio Development Team
 * @version 1.0.0
 */

import OpenAI from 'openai';
import ngoService from './ngoService';
import { logError, addBreadcrumb } from '../utils/sentry';

/**
 * OpenAIService Class
 * 
 * Main service for AI-powered animal rescue analysis and assistance.
 * Integrates with OpenAI's GPT models to provide intelligent triage,
 * location-based recommendations, and emergency contact generation.
 */
class OpenAIService {
  constructor() {
    /** @type {OpenAI} OpenAI client instance */
    this.openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    
    /** @type {Array} Conversation history for context awareness */
    this.conversationHistory = [];
    
    /** @type {string} OpenAI API key */
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    /** @type {string} OpenAI API endpoint URL */
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Analyze user message for animal rescue situations
   * 
   * Performs comprehensive AI analysis of user messages to detect rescue situations,
   * assess urgency, provide care recommendations, and suggest local NGOs.
   * Enhanced with GPS location data for precise emergency contact generation.
   * 
   * @param {Object} input - Analysis input parameters
   * @param {string} input.message - User message to analyze (may include location context)
   * @param {Object|null} input.locationData - GPS location data if available
   * @param {boolean} input.hasGPS - Whether GPS location is available
   * @param {Object|null} input.previousAnalysis - Previous analysis for context
   * @returns {Promise<Object>} Comprehensive analysis result
   * 
   * @example
   * const analysis = await openaiService.analyzeMessage({
   *   message: "I found an injured dog near Central Park",
   *   locationData: { coordinates: { lat: 40.7829, lng: -73.9654 }, address: {...} },
   *   hasGPS: true,
   *   previousAnalysis: null
   * });
   * 
   * // Analysis structure:
   * {
   *   isRescueSituation: true,
   *   confidence: 0.95,
   *   animalInfo: { type: 'dog', condition: 'injured', ... },
   *   urgencyAnalysis: { level: 'high', score: 8, ... },
   *   locationAnalysis: { specificity: 5, hasGPS: true, ... },
   *   careRecommendations: { immediate: [...], doNots: [...], ... },
   *   ngoRecommendations: { found: true, ngos: [...], ... }
   * }
   */
  async analyzeMessage(input) {
    const { message, locationData, hasGPS, previousAnalysis } = input;
    
    // Enhanced location prompt with GPS data
    const locationPrompt = this.generateLocationPrompt(locationData, hasGPS);
    
    // Add breadcrumb for analysis start
    addBreadcrumb(
      'OpenAI: Starting message analysis',
      'openai',
      'info',
      { hasGPS, messageLength: message.length }
    );
    
    const systemPrompt = `You are Curio, an expert AI assistant specializing in animal rescue situations in India. 

CORE CAPABILITIES:
1. Detect if messages are about animal rescue situations
2. Extract: animal type, condition/issue, and location details
3. Assign urgency levels (1-10 scale) with detailed reasoning
4. Provide immediate care guidance
5. Recommend local NGOs with specialization matching
6. Analyze location specificity and safety considerations

LOCATION PROCESSING:
- User messages may contain GPS location context at the beginning
- Look for [LOCATION CONTEXT] sections with precise GPS coordinates
- When GPS data is available, use it for accurate city identification and distance calculations
- If no GPS context is provided, extract location from the user's original message text
- Prioritize GPS location data over text-based location extraction

${locationPrompt}

MESSAGE STRUCTURE:
- Messages may start with [LOCATION CONTEXT - GPS DATA AVAILABLE] or [LOCATION CONTEXT - CACHED GPS DATA]
- The actual user message follows after "Original user message:"
- Use GPS coordinates for precise location analysis when available
- Extract the core rescue situation from the original user message

ANALYSIS REQUIREMENTS:
- Always respond with a JSON object containing ALL fields listed below
- For rescue situations, provide comprehensive triage and recommendations
- For non-rescue situations, be helpful but mark isRescueSituation as false
- Use GPS coordinates for enhanced location specificity scoring (5/5 when GPS available)

REQUIRED JSON STRUCTURE:
{
  "isRescueSituation": boolean,
  "confidence": number (0-1),
  "animalInfo": {
    "type": "dog|cat|bird|wildlife|livestock|unknown",
    "condition": "injured|sick|trapped|aggressive|unconscious|normal|unknown",
    "behavior": "calm|aggressive|scared|lethargic|normal|unknown",
    "approximateAge": "puppy/kitten|young|adult|senior|unknown",
    "size": "small|medium|large|unknown"
  },
  "urgencyAnalysis": {
    "level": "low|medium|high",
    "score": number (1-10),
    "factors": {
      "immediateThreats": ["list of threats"],
      "visibleInjuries": ["list of injuries"],
      "behaviorConcerns": ["list of concerns"],
      "environmentalRisks": ["list of risks"]
    },
    "reasoning": "detailed explanation",
    "timeframe": "immediate|within 2 hours|within 24 hours|within week"
  },
  "locationAnalysis": {
    "specificity": number (1-5, always 5 when GPS coordinates available),
    "hasGPS": boolean,
    "gpsAccuracy": number (meters, from GPS context if available),
    "extractedLocation": "location string from GPS context or user message",
    "cityIdentified": "city name from GPS or text extraction",
    "needsMoreDetail": boolean (false when GPS available),
    "safetyConsiderations": ["accessibility", "traffic", "safety"],
    "suggestedQuestions": ["specific location questions, empty when GPS available"]
  },
  "careRecommendations": {
    "immediate": ["list of immediate actions"],
    "doNots": ["list of things to avoid"],
    "safetyTips": ["safety precautions"],
    "suppliesNeeded": ["recommended supplies"]
  },
  "ngoRecommendations": {
    "found": boolean,
    "city": "city name from GPS or extraction",
    "urgencyBased": boolean,
    "ngos": ["array will be populated by service"],
    "reasoning": "why these NGOs were selected",
    "fallbackContacts": ["if no local NGOs found"]
  },
  "consistencyCheck": {
    "isConsistent": boolean,
    "conflictingInfo": ["list of inconsistencies"],
    "clarificationNeeded": ["questions to resolve conflicts"]
  },
  "reportData": {
    "summary": "brief case summary",
    "keyDetails": "important details for rescue teams, include GPS coordinates when available",
    "priority": "low|medium|high|critical"
  }
}

LOCATION INTELLIGENCE ENHANCED:
${hasGPS ? `
- GPS LOCATION AVAILABLE: Extract coordinates and address from [LOCATION CONTEXT] section
- Use precise coordinates for distance-based NGO matching
- Set locationAnalysis.specificity to 5 and hasGPS to true
- Include GPS accuracy from the context in gpsAccuracy field
- Set needsMoreDetail to false since GPS provides precise location
` : `
- NO GPS: Extract location from user message text after "Original user message:"
- Ask for more specific location details if the extracted location is vague
- Use city extraction for NGO matching
- Set hasGPS to false and provide location improvement suggestions
`}

URGENCY SCORING GUIDE:
- 1-3: Low (healthy strays, minor issues)
- 4-6: Medium (injured but stable, behavioral issues)  
- 7-8: High (serious injuries, immediate danger)
- 9-10: Critical (life-threatening, unconscious)

GPS INTEGRATION BENEFITS:
- Precise location for rescue teams (include coordinates in reportData.keyDetails)
- Accurate NGO distance calculations
- Enhanced emergency response coordination
- Reduced location ambiguity and faster response times

Remember: Always provide accurate, helpful guidance while prioritizing animal welfare and human safety. When GPS coordinates are available, emphasize the precision advantage for rescue coordination.`;

    try {
      const completion = await this.makeAPICall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]);

      let analysis;
      try {
        analysis = JSON.parse(completion);
        
        // Add success breadcrumb
        addBreadcrumb(
          'OpenAI: Analysis completed successfully',
          'openai',
          'info',
          { isRescueSituation: analysis.isRescueSituation }
        );
        
      } catch (parseError) {
        console.warn('JSON parsing failed, extracting from response');
        
        // Log parsing error to Sentry
        logError(parseError, {
          context: 'openai_json_parsing',
          response: completion,
          message: message.substring(0, 100) // First 100 chars only
        });
        
        analysis = this.extractJSONFromResponse(completion);
      }

      // Enhanced NGO matching with GPS support
      if (analysis.isRescueSituation && analysis.locationAnalysis?.cityIdentified) {
        analysis.ngoRecommendations = await this.enhanceNGORecommendations(
          analysis,
          locationData
        );
      }

      return analysis;

    } catch (error) {
      console.error('OpenAI analysis error:', error);
      
      // Log comprehensive error to Sentry
      logError(error, {
        context: 'openai_analysis_failure',
        hasGPS,
        messageLength: message.length,
        locationData: locationData ? 'present' : 'absent',
        errorType: error.constructor.name,
        apiKey: this.apiKey ? 'present' : 'missing'
      });
      
      return this.getErrorFallback();
    }
  }

  /**
   * Generate enhanced location prompt based on GPS availability
   * 
   * Creates contextual prompts for the AI based on whether GPS location
   * data is available, helping the AI make better location-based decisions.
   * 
   * @param {Object|null} locationData - GPS location data
   * @param {boolean} hasGPS - Whether GPS data is available
   * @returns {string} Formatted location prompt for AI
   */
  generateLocationPrompt(locationData, hasGPS) {
    if (!hasGPS || !locationData) {
      return "LOCATION STATUS: No GPS data available. Extract location from user message text.";
    }

    return `LOCATION STATUS: GPS ENABLED
- Coordinates: ${locationData.coordinates.lat}, ${locationData.coordinates.lng}
- Address: ${locationData.address.formatted}
- Accuracy: ${locationData.accuracy}m
- City: ${locationData.address.city}
- State: ${locationData.address.state}

Use this precise location data for:
1. Accurate city identification
2. Distance-based NGO recommendations  
3. Location safety analysis
4. Accessibility considerations`;
  }

  // Enhanced NGO recommendation system
  async enhanceNGORecommendations(analysis, locationData) {
    const ngoData = await import('../data/ngoData.json');
    const ngos = ngoData.default;
    
    const city = this.extractCityFromLocation(
      analysis.locationAnalysis.extractedLocation,
      locationData?.address?.city
    );
    
    if (!city) {
      return {
        found: false,
        city: null,
        urgencyBased: false,
        ngos: [],
        reasoning: "Could not identify city for NGO matching",
        fallbackContacts: [ngos.fallback]
      };
    }

    // Get NGOs for the city
    const cityNGOs = ngos.cities[city];
    if (!cityNGOs) {
      return {
        found: false,
        city: city,
        urgencyBased: false,
        ngos: [],
        reasoning: `No NGO data available for ${city}`,
        fallbackContacts: [ngos.fallback]
      };
    }

    // Filter and sort NGOs based on criteria
    let matchedNGOs = this.filterNGOsBySpecialization(
      cityNGOs.ngos,
      analysis.animalInfo.type
    );

    // Priority sorting for urgent cases
    if (analysis.urgencyAnalysis.level === 'high') {
      matchedNGOs = this.prioritizeEmergencyNGOs(matchedNGOs);
    }

    // Add GPS distance if available
    if (locationData?.coordinates) {
      matchedNGOs = this.addDistanceToNGOs(matchedNGOs, locationData.coordinates, city);
    }

    return {
      found: matchedNGOs.length > 0,
      city: city,
      urgencyBased: analysis.urgencyAnalysis.level === 'high',
      ngos: matchedNGOs.slice(0, 5), // Top 5 matches
      reasoning: this.generateNGORecommendationReasoning(analysis, matchedNGOs),
      fallbackContacts: matchedNGOs.length === 0 ? [ngos.fallback] : []
    };
  }

  // Add estimated distances to NGOs
  addDistanceToNGOs(ngos, userCoords, city) {
    // Import city coordinates helper
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

    const cityCenter = cityCoords[city.toLowerCase()] || { lat: 28.6139, lng: 77.2090 };
    
    return ngos.map(ngo => {
      // Use NGO coordinates if available, otherwise use city center
      const ngoCoords = ngo.coordinates || cityCenter;
      const distance = this.calculateDistance(
        userCoords.lat, 
        userCoords.lng, 
        ngoCoords.lat, 
        ngoCoords.lng
      );

      return {
        ...ngo,
        distance: distance,
        distanceText: distance < 1 ? 
          `${Math.round(distance * 1000)}m away` : 
          `${distance.toFixed(1)}km away`
      };
    }).sort((a, b) => a.distance - b.distance);
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in kilometers
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Extract city from location text and GPS data
  extractCityFromLocation(locationText, gpsCity) {
    // Prioritize GPS city data if available
    if (gpsCity) {
      const normalizedGPSCity = this.normalizeCityName(gpsCity);
      if (this.isSupportedCity(normalizedGPSCity)) {
        return normalizedGPSCity;
      }
    }

    // Fallback to text extraction
    if (!locationText) return null;

    const cityMappings = {
      'mumbai': ['mumbai', 'bombay', 'bom'],
      'delhi': ['delhi', 'new delhi', 'ncr', 'gurgaon', 'noida', 'faridabad'],
      'bangalore': ['bangalore', 'bengaluru', 'blr'],
      'chennai': ['chennai', 'madras'],
      'hyderabad': ['hyderabad', 'hyd', 'cyberabad'],
      'pune': ['pune', 'puna'],
      'kolkata': ['kolkata', 'calcutta', 'cal'],
      'jaipur': ['jaipur', 'pink city']
    };

    const text = locationText.toLowerCase();
    
    for (const [city, aliases] of Object.entries(cityMappings)) {
      if (aliases.some(alias => text.includes(alias))) {
        return city;
      }
    }

    return null;
  }

  // Normalize city names
  normalizeCityName(cityName) {
    const normalizations = {
      'bombay': 'mumbai',
      'madras': 'chennai',
      'calcutta': 'kolkata',
      'bengaluru': 'bangalore'
    };

    const normalized = cityName.toLowerCase().trim();
    return normalizations[normalized] || normalized;
  }

  // Check if city is supported
  isSupportedCity(cityName) {
    const supportedCities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'hyderabad', 'pune', 'kolkata', 'jaipur'];
    return supportedCities.includes(cityName.toLowerCase());
  }

  // Filter NGOs by animal specialization
  filterNGOsBySpecialization(ngos, animalType) {
    if (!ngos || ngos.length === 0) return [];
    
    return ngos.filter(ngo => {
      if (!ngo.specialization) return true;
      
      // If NGO handles all animals, include it
      if (ngo.specialization.includes('all animals')) return true;
      
      // If animal type is unknown, include all NGOs
      if (!animalType || animalType === 'unknown') return true;
      
      // Check for specific animal type
      return ngo.specialization.includes(animalType);
    });
  }

  // Prioritize emergency NGOs for high urgency cases
  prioritizeEmergencyNGOs(ngos) {
    return ngos.sort((a, b) => {
      // Priority 1: 24/7 emergency services
      if (a.availability24x7 && !b.availability24x7) return -1;
      if (!a.availability24x7 && b.availability24x7) return 1;
      
      // Priority 2: Emergency specialization
      const aHasEmergency = a.specialization?.includes('emergency') || false;
      const bHasEmergency = b.specialization?.includes('emergency') || false;
      if (aHasEmergency && !bHasEmergency) return -1;
      if (!aHasEmergency && bHasEmergency) return 1;
      
      // Priority 3: Rating
      return (b.rating || 0) - (a.rating || 0);
    });
  }

  // Generate reasoning for NGO recommendations
  generateNGORecommendationReasoning(analysis, matchedNGOs) {
    if (matchedNGOs.length === 0) {
      return "No local NGOs found that match the specific requirements for this case.";
    }

    const reasons = [];
    
    // Animal type matching
    if (analysis.animalInfo?.type && analysis.animalInfo.type !== 'unknown') {
      reasons.push(`specialized in ${analysis.animalInfo.type} care`);
    }
    
    // Urgency-based selection
    if (analysis.urgencyAnalysis?.level === 'high') {
      const emergencyNGOs = matchedNGOs.filter(ngo => ngo.availability24x7);
      if (emergencyNGOs.length > 0) {
        reasons.push("prioritized for 24/7 emergency availability");
      }
    }
    
    // Distance-based (if GPS available)
    if (matchedNGOs[0]?.distance !== undefined) {
      reasons.push("sorted by proximity to your location");
    }
    
    if (reasons.length === 0) {
      return "Selected based on location and general animal welfare capabilities.";
    }
    
    return `Selected NGOs ${reasons.join(', ')}.`;
  }

  // API call helper with error handling
  async makeAPICall(messages, options = {}) {
    try {
      const response = await this.openai.chat.completions.create({
        model: options.model || "gpt-3.5-turbo",
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        ...options
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  // Extract JSON from malformed responses
  extractJSONFromResponse(response) {
    try {
      // Try to find JSON object in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Could not extract JSON from response');
    }

    // Return basic fallback structure
    return this.getErrorFallback();
  }

  // Error fallback analysis
  getErrorFallback() {
    return {
      isRescueSituation: false,
      confidence: 0,
      animalInfo: {
        type: "unknown",
        condition: "unknown",
        behavior: "unknown",
        approximateAge: "unknown",
        size: "unknown"
      },
      urgencyAnalysis: {
        level: "low",
        score: 1,
        factors: {
          immediateThreats: [],
          visibleInjuries: [],
          behaviorConcerns: [],
          environmentalRisks: []
        },
        reasoning: "Unable to assess due to processing error",
        timeframe: "within week"
      },
      locationAnalysis: {
        specificity: 1,
        hasGPS: false,
        gpsAccuracy: 0,
        extractedLocation: "unknown",
        cityIdentified: null,
        needsMoreDetail: true,
        safetyConsiderations: [],
        suggestedQuestions: ["Could you please describe the situation again?"]
      },
      careRecommendations: {
        immediate: ["Please try again or contact local animal services"],
        doNots: [],
        safetyTips: [],
        suppliesNeeded: []
      },
      ngoRecommendations: {
        found: false,
        city: null,
        urgencyBased: false,
        ngos: [],
        reasoning: "Unable to process request",
        fallbackContacts: []
      },
      consistencyCheck: {
        isConsistent: true,
        conflictingInfo: [],
        clarificationNeeded: []
      },
      reportData: {
        summary: "Processing error occurred",
        keyDetails: "Unable to generate report",
        priority: "low"
      }
    };
  }

  /**
   * Generate AI response based on analysis results
   * 
   * Creates contextual, empathetic responses that match the urgency level
   * and provide appropriate guidance for the rescue situation.
   * 
   * @param {Object} analysis - Analysis results from analyzeMessage
   * @param {string} userMessage - Original user message for context
   * @returns {Promise<string>} AI-generated response
   * 
   * @example
   * const response = await openaiService.generateResponse(analysis, "Found injured dog");
   */
  async generateResponse(analysis, userMessage) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Curio, a compassionate AI assistant for stray animal rescue with Phase 2 enhanced capabilities and Phase 3 NGO recommendations.

RESPONSE GUIDELINES:
- Show urgency awareness in your tone
- Ask for location details if needed
- Address any consistency issues tactfully
- Provide context-aware recommendations
- Use empathetic, professional language
- Include NGO information when available

URGENCY TONE MATCHING:
- HIGH: Urgent, direct, action-focused
- MEDIUM: Concerned, helpful, guiding
- LOW: Supportive, informative, preventive

Analysis Context: ${JSON.stringify(analysis)}`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.8,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Response Error:', error);
      return "I'm here to help with stray animal situations. Please tell me what's happening and I'll do my best to assist you.";
    }
  }

  // Phase 2: Enhanced location validation
  async validateLocation(location) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Analyze the specificity and usefulness of this location for animal rescue purposes. Rate from 1-5 and suggest improvements.
            
            Return JSON:
            {
              "specificity": 1-5,
              "improvements": [],
              "concerns": [],
              "isUseful": boolean
            }`
          },
          {
            role: "user",
            content: `Location: ${location}`
          }
        ],
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Location validation error:', error);
      return {
        specificity: 1,
        improvements: ["Please provide more specific location details"],
        concerns: ["Location too vague for rescue coordination"],
        isUseful: false
      };
    }
  }

  // Phase 2: Clear conversation history when needed
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Fetch location-based emergency contacts using AI
   * 
   * Generates realistic emergency contact information tailored to the user's
   * location, including animal control, veterinary hospitals, NGOs, and
   * rescue services with proper Indian contact details.
   * 
   * @param {Object|null} locationData - GPS location data if available
   * @param {Object} options - Generation options
   * @param {number} options.count - Number of contacts to generate (default: 5)
   * @param {string} options.animalType - Animal type filter (default: 'all')
   * @param {string} options.urgency - Urgency level (default: 'high')
   * @returns {Promise<Object>} Generated emergency contacts data
   * 
   * @example
   * const contacts = await openaiService.fetchEmergencyContacts(locationData, {
   *   count: 3,
   *   animalType: 'dog',
   *   urgency: 'critical'
   * });
   * 
   * // Returns:
   * {
   *   location: { detected: "Mumbai, Maharashtra", coordinates: [...] },
   *   emergencyContacts: [
   *     {
   *       name: "Mumbai Animal Hospital",
   *       type: "veterinary",
   *       phone: "+91-98765-43210",
   *       availability: "24/7",
   *       is24x7: true,
   *       urgencyLevel: "critical",
   *       specialization: ["emergency", "dogs", "cats"]
   *     }
   *   ],
   *   generalGuidance: { immediateSteps: [...], safetyTips: [...] }
   * }
   */
  async fetchEmergencyContacts(locationData, options = {}) {
    const { count = 5, animalType = 'all', urgency = 'high' } = options;
    
    // Add breadcrumb for emergency contacts request
    addBreadcrumb(
      'OpenAI: Fetching emergency contacts',
      'openai',
      'info',
      { locationData: !!locationData, count, animalType, urgency }
    );

    const locationInfo = locationData 
      ? `GPS Location: ${locationData.coordinates.lat}, ${locationData.coordinates.lng}
         Address: ${locationData.address.formatted}
         City: ${locationData.address.city}
         State: ${locationData.address.state}`
      : 'No GPS data available';

    const systemPrompt = `You are an expert emergency contact coordinator for animal rescue in India. 
    
    TASK: Generate emergency contact information for animal rescue based on user location.
    
    LOCATION DATA:
    ${locationInfo}
    
    REQUIREMENTS:
    - Generate ${count} emergency contacts relevant to the location
    - Focus on ${urgency} urgency situations for ${animalType} animals
    - Include local animal control, veterinary hospitals, NGOs, and rescue services
    - Provide realistic phone numbers (Indian format: +91-XXXXX-XXXXX)
    - Include 24/7 availability where applicable
    - Prioritize services near the user's location
    
    RESPONSE FORMAT (JSON):
    {
      "location": {
        "detected": "city, state",
        "coordinates": [lat, lng] or null,
        "accuracy": "GPS/estimated"
      },
      "emergencyContacts": [
        {
          "name": "Service Name",
          "type": "animal_control|veterinary|ngo|rescue_service|government",
          "phone": "+91-XXXXX-XXXXX",
          "email": "contact@example.org",
          "address": "Full address",
          "specialization": ["dogs", "cats", "wildlife", "emergency", "medical"],
          "availability": "24/7" or "9 AM - 6 PM",
          "is24x7": boolean,
          "urgencyLevel": "critical|high|medium|standard",
          "distanceKm": estimated distance or null,
          "description": "Brief service description",
          "services": ["emergency rescue", "medical care", "ambulance", "consultation"],
          "emergencyProtocol": "What to do before they arrive"
        }
      ],
      "generalGuidance": {
        "immediateSteps": ["Step 1", "Step 2"],
        "safetyTips": ["Safety tip 1", "Safety tip 2"],
        "whenToCall": "Guidance on urgency levels"
      },
      "backupContacts": [
        {
          "name": "National Emergency Helpline",
          "phone": "1962",
          "description": "Government animal emergency helpline"
        }
      ]
    }
    
    IMPORTANT:
    - Generate realistic, India-specific contact information
    - Phone numbers should follow Indian mobile/landline formats
    - Include both local and national emergency contacts
    - Prioritize 24/7 services for high urgency situations
    - Provide practical emergency protocols`;

    try {
      const completion = await this.makeAPICall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate emergency contacts for animal rescue. Location: ${locationInfo}. Urgency: ${urgency}, Animal type: ${animalType}, Count needed: ${count}` }
      ]);

      let emergencyData;
      try {
        emergencyData = JSON.parse(completion);
        
        // Add success breadcrumb
        addBreadcrumb(
          'OpenAI: Emergency contacts fetched successfully',
          'openai',
          'info',
          { contactsCount: emergencyData.emergencyContacts?.length || 0 }
        );
        
        return emergencyData;
        
      } catch (parseError) {
        console.warn('Emergency contacts JSON parsing failed');
        
        // Log parsing error
        logError(parseError, {
          context: 'emergency_contacts_json_parsing',
          response: completion,
          locationData: locationData ? 'present' : 'absent'
        });
        
        // Return fallback emergency contacts
        return this.getFallbackEmergencyContacts(locationData);
      }

    } catch (error) {
      console.error('Emergency contacts fetch error:', error);
      
      // Log error to Sentry
      logError(error, {
        context: 'emergency_contacts_fetch_failure',
        locationData: locationData ? 'present' : 'absent',
        options
      });
      
      // Return fallback emergency contacts
      return this.getFallbackEmergencyContacts(locationData);
    }
  }

  // Fallback emergency contacts when API fails
  getFallbackEmergencyContacts(locationData) {
    const city = locationData?.address?.city || 'Current location';
    
    return {
      location: {
        detected: locationData?.address?.formatted || 'Unknown',
        coordinates: locationData?.coordinates ? [locationData.coordinates.lat, locationData.coordinates.lng] : null,
        accuracy: locationData ? 'GPS' : 'estimated'
      },
      emergencyContacts: [
        {
          name: 'National Animal Welfare Helpline',
          type: 'government',
          phone: '1962',
          email: 'help@animalwelfare.gov.in',
          address: `${city}, India`,
          specialization: ['all animals', 'emergency'],
          availability: '24/7',
          is24x7: true,
          urgencyLevel: 'critical',
          distanceKm: null,
          description: 'Government emergency helpline for all animal-related emergencies',
          services: ['emergency rescue', 'coordination', 'ambulance'],
          emergencyProtocol: 'Stay calm, keep the animal safe, wait for rescue team'
        },
        {
          name: `${city} Animal Control`,
          type: 'animal_control',
          phone: '+91-11-2345-6789',
          email: `control@${city.toLowerCase().replace(/\s+/g, '')}.gov.in`,
          address: `Municipal Office, ${city}`,
          specialization: ['stray animals', 'emergency', 'public safety'],
          availability: '9 AM - 6 PM',
          is24x7: false,
          urgencyLevel: 'high',
          distanceKm: null,
          description: 'Local municipal animal control services',
          services: ['stray animal rescue', 'public safety', 'animal removal'],
          emergencyProtocol: 'Document the situation, ensure public safety, call for assistance'
        },
        {
          name: 'Emergency Veterinary Hospital',
          type: 'veterinary',
          phone: '+91-98765-43210',
          email: 'emergency@vetclinic.in',
          address: `Central Area, ${city}`,
          specialization: ['emergency medical', 'surgery', 'critical care'],
          availability: '24/7',
          is24x7: true,
          urgencyLevel: 'critical',
          distanceKm: null,
          description: '24/7 emergency veterinary medical services',
          services: ['emergency surgery', 'critical care', 'ambulance'],
          emergencyProtocol: 'Stabilize the animal, bring immediately for treatment'
        }
      ],
      generalGuidance: {
        immediateSteps: [
          'Ensure your safety first',
          'Approach the animal calmly and carefully',
          'Document the situation with photos if safe',
          'Call the most appropriate emergency contact'
        ],
        safetyTips: [
          'Never approach aggressive or unknown animals',
          'Use protective gear if available',
          'Keep a safe distance from traffic',
          'Have someone assist you if possible'
        ],
        whenToCall: 'Call immediately for injured, unconscious, or suffering animals. For non-emergency situations, contact during business hours.'
      },
      backupContacts: [
        {
          name: 'PFA India Helpline',
          phone: '+91-98765-12345',
          description: 'People for Animals national emergency helpline'
        }
      ]
    };
  }
}

export default new OpenAIService(); 