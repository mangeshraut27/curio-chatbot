import ngoData from '../data/ngos.json';

class NGOService {
  constructor() {
    this.ngos = ngoData.ngos;
    this.defaultNGO = ngoData.defaultNGO;
  }

  // Extract city from location string
  extractCity(location) {
    if (!location || typeof location !== 'string') {
      return null;
    }

    const locationLower = location.toLowerCase();
    const cities = Object.keys(this.ngos);

    // Direct city match
    for (const city of cities) {
      if (locationLower.includes(city)) {
        return city;
      }
    }

    // Check for common city aliases
    const cityAliases = {
      'bombay': 'mumbai',
      'new delhi': 'delhi',
      'ncr': 'delhi',
      'gurgaon': 'delhi',
      'noida': 'delhi',
      'bengaluru': 'bangalore',
      'mysore': 'bangalore',
      'secunderabad': 'hyderabad',
      'madras': 'chennai',
      'calcutta': 'kolkata'
    };

    for (const [alias, city] of Object.entries(cityAliases)) {
      if (locationLower.includes(alias)) {
        return city;
      }
    }

    return null;
  }

  // Match NGOs based on location and animal type
  matchNGOs(location, animalType = 'all', urgencyLevel = 'medium') {
    const city = this.extractCity(location);
    
    if (!city || !this.ngos[city]) {
      return {
        found: false,
        city: null,
        ngos: [],
        fallback: this.defaultNGO,
        message: `No local NGOs found for the location "${location}". Please contact the National Animal Welfare Helpline.`
      };
    }

    const cityNGOs = this.ngos[city];
    let matchedNGOs = [...cityNGOs]; // Create a copy of all NGOs

    // Filter NGOs based on animal type and specialization
    if (animalType && animalType !== 'unknown') {
      matchedNGOs = matchedNGOs.filter(ngo => 
        ngo.specializations.includes('all animals') || 
        ngo.specializations.includes(animalType.toLowerCase()) ||
        (urgencyLevel === 'high' && ngo.specializations.includes('emergency'))
      );
    }

    // Sort by rating and availability for urgent cases
    matchedNGOs.sort((a, b) => {
      if (urgencyLevel === 'high') {
        // Prioritize 24/7 availability for high urgency
        const aIs24x7 = a.availability.includes('24/7');
        const bIs24x7 = b.availability.includes('24/7');
        if (aIs24x7 && !bIs24x7) return -1;
        if (!aIs24x7 && bIs24x7) return 1;
      }
      // Then sort by rating
      return b.rating - a.rating;
    });

    return {
      found: true,
      city: city,
      ngos: matchedNGOs,
      fallback: matchedNGOs.length === 0 ? this.defaultNGO : null,
      message: matchedNGOs.length > 0 
        ? `Found ${matchedNGOs.length} NGO${matchedNGOs.length > 1 ? 's' : ''} in ${city.charAt(0).toUpperCase() + city.slice(1)}`
        : `No specialized NGOs found in ${city.charAt(0).toUpperCase() + city.slice(1)} for ${animalType}. Showing general options.`
    };
  }

  // Get emergency contacts based on urgency
  getEmergencyContacts(location, urgencyLevel) {
    const ngoMatch = this.matchNGOs(location, 'emergency', urgencyLevel);
    
    if (urgencyLevel === 'high') {
      // For high urgency, prioritize 24/7 services
      const emergencyNGOs = ngoMatch.ngos.filter(ngo => 
        ngo.availability.includes('24/7') && 
        ngo.specializations.includes('emergency')
      );
      
      // Return all emergency NGOs (up to 2) or fall back to regular NGOs
      return emergencyNGOs.length > 0 ? emergencyNGOs : ngoMatch.ngos.slice(0, 2);
    }

    return ngoMatch.ngos.slice(0, 3);
  }

  // Get NGO recommendations with context
  getRecommendations(analysis) {
    if (!analysis || !analysis.isRescueSituation) {
      return null;
    }

    const { location, animalType, urgencyLevel } = analysis;
    const ngoMatch = this.matchNGOs(location, animalType, urgencyLevel);

    return {
      ...ngoMatch,
      urgencyLevel,
      animalType,
      recommendations: this.generateRecommendations(ngoMatch, urgencyLevel, animalType)
    };
  }

  // Generate contextual recommendations
  generateRecommendations(ngoMatch, urgencyLevel, animalType) {
    const recommendations = [];

    if (urgencyLevel === 'high') {
      recommendations.push('🚨 **URGENT**: Contact the first NGO immediately');
      if (ngoMatch.ngos.length > 1) {
        recommendations.push('📞 Have backup contacts ready in case first NGO is unavailable');
      }
    } else if (urgencyLevel === 'medium') {
      recommendations.push('⚠️ Contact NGOs during their working hours');
      recommendations.push('📋 Prepare animal condition details before calling');
    } else {
      recommendations.push('📞 Contact during regular hours for assistance');
      recommendations.push('🏠 Consider adoption services if animal is healthy');
    }

    if (animalType === 'dog' || animalType === 'cat') {
      recommendations.push('🐕 Mention if animal appears to be a pet vs. stray');
    }

    if (ngoMatch.city) {
      recommendations.push(`📍 Specify exact location within ${ngoMatch.city.charAt(0).toUpperCase() + ngoMatch.city.slice(1)}`);
    }

    return recommendations;
  }

  // Get all cities with NGO coverage
  getCoveredCities() {
    return Object.keys(this.ngos).map(city => ({
      city: city,
      ngoCount: this.ngos[city].length,
      displayName: city.charAt(0).toUpperCase() + city.slice(1)
    }));
  }
}

export default new NGOService(); 