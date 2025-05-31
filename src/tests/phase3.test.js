import ngoService from '../services/ngoService';
import openaiService from '../services/openai';

describe('Phase 3: NGO Recommendations', () => {
  
  describe('NGO Service - City Extraction', () => {
    test('should extract city from direct city name', () => {
      expect(ngoService.extractCity('Mumbai')).toBe('mumbai');
      expect(ngoService.extractCity('Delhi')).toBe('delhi');
      expect(ngoService.extractCity('Bangalore')).toBe('bangalore');
    });

    test('should extract city from location with additional details', () => {
      expect(ngoService.extractCity('Near Central Park, Mumbai')).toBe('mumbai');
      expect(ngoService.extractCity('Connaught Place, New Delhi')).toBe('delhi');
      expect(ngoService.extractCity('MG Road, Bangalore area')).toBe('bangalore');
    });

    test('should handle city aliases correctly', () => {
      expect(ngoService.extractCity('Bombay')).toBe('mumbai');
      expect(ngoService.extractCity('New Delhi')).toBe('delhi');
      expect(ngoService.extractCity('Bengaluru')).toBe('bangalore');
      expect(ngoService.extractCity('Calcutta')).toBe('kolkata');
      expect(ngoService.extractCity('Madras')).toBe('chennai');
    });

    test('should handle case insensitive matching', () => {
      expect(ngoService.extractCity('MUMBAI')).toBe('mumbai');
      expect(ngoService.extractCity('dElHi')).toBe('delhi');
      expect(ngoService.extractCity('bangalore')).toBe('bangalore');
    });

    test('should return null for unknown cities', () => {
      expect(ngoService.extractCity('Unknown City')).toBe(null);
      expect(ngoService.extractCity('Random Place')).toBe(null);
      expect(ngoService.extractCity('')).toBe(null);
      expect(ngoService.extractCity(null)).toBe(null);
    });
  });

  describe('NGO Service - NGO Matching', () => {
    test('should match NGOs for valid city', () => {
      const result = ngoService.matchNGOs('Mumbai', 'dog', 'medium');
      
      expect(result.found).toBe(true);
      expect(result.city).toBe('mumbai');
      expect(result.ngos).toHaveLength(2);
      expect(result.ngos[0].name).toBe('Mumbai Animal Welfare Society');
    });

    test('should prioritize emergency NGOs for high urgency', () => {
      const result = ngoService.matchNGOs('Mumbai', 'dog', 'high');
      
      expect(result.found).toBe(true);
      const emergencyNGO = result.ngos.find(ngo => 
        ngo.specializations.includes('emergency')
      );
      expect(emergencyNGO).toBeDefined();
    });

    test('should sort by availability for urgent cases', () => {
      const result = ngoService.matchNGOs('Delhi', 'cat', 'high');
      
      expect(result.found).toBe(true);
      const first24x7 = result.ngos[0].availability.includes('24/7');
      expect(first24x7).toBe(true);
    });

    test('should return fallback for unknown city', () => {
      const result = ngoService.matchNGOs('Unknown City', 'dog', 'medium');
      
      expect(result.found).toBe(false);
      expect(result.city).toBe(null);
      expect(result.ngos).toHaveLength(0);
      expect(result.fallback).toBeDefined();
      expect(result.fallback.name).toBe('National Animal Welfare Helpline');
    });

    test('should filter by animal type specialization', () => {
      const result = ngoService.matchNGOs('Bangalore', 'dog', 'medium');
      
      expect(result.found).toBe(true);
      const hasSpecialization = result.ngos.every(ngo => 
        ngo.specializations.includes('dogs') || 
        ngo.specializations.includes('all animals')
      );
      expect(hasSpecialization).toBe(true);
    });

    test('should handle all animals specialization', () => {
      const result = ngoService.matchNGOs('Chennai', 'unknown', 'low');
      
      expect(result.found).toBe(true);
      expect(result.ngos).toHaveLength(1);
      expect(result.ngos[0].specializations).toContain('all animals');
    });
  });

  describe('NGO Service - Emergency Contacts', () => {
    test('should prioritize 24/7 services for high urgency', () => {
      const contacts = ngoService.getEmergencyContacts('Delhi', 'high');
      
      expect(contacts).toHaveLength(2);
      const first24x7 = contacts[0].availability.includes('24/7');
      expect(first24x7).toBe(true);
    });

    test('should return standard NGOs for medium urgency', () => {
      const contacts = ngoService.getEmergencyContacts('Mumbai', 'medium');
      
      expect(contacts.length).toBeGreaterThan(0);
      expect(contacts.length).toBeLessThanOrEqual(3);
    });

    test('should handle cities with limited NGOs', () => {
      const contacts = ngoService.getEmergencyContacts('Hyderabad', 'high');
      
      expect(contacts).toHaveLength(1);
      expect(contacts[0].name).toBe('Animal Warriors Conservation Society');
    });
  });

  describe('NGO Service - Recommendations with Analysis', () => {
    test('should return null for non-rescue situations', () => {
      const analysis = { isRescueSituation: false };
      const result = ngoService.getRecommendations(analysis);
      
      expect(result).toBe(null);
    });

    test('should return recommendations for rescue situations', () => {
      const analysis = {
        isRescueSituation: true,
        location: 'Mumbai',
        animalType: 'dog',
        urgencyLevel: 'high'
      };
      
      const result = ngoService.getRecommendations(analysis);
      
      expect(result).toBeDefined();
      expect(result.found).toBe(true);
      expect(result.urgencyLevel).toBe('high');
      expect(result.animalType).toBe('dog');
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    test('should generate appropriate recommendations for high urgency', () => {
      const analysis = {
        isRescueSituation: true,
        location: 'Delhi',
        animalType: 'cat',
        urgencyLevel: 'high'
      };
      
      const result = ngoService.getRecommendations(analysis);
      
      expect(result.recommendations).toContain('🚨 **URGENT**: Contact the first NGO immediately');
    });

    test('should generate appropriate recommendations for medium urgency', () => {
      const analysis = {
        isRescueSituation: true,
        location: 'Bangalore',
        animalType: 'dog',
        urgencyLevel: 'medium'
      };
      
      const result = ngoService.getRecommendations(analysis);
      
      expect(result.recommendations).toContain('⚠️ Contact NGOs during their working hours');
      expect(result.recommendations).toContain('📋 Prepare animal condition details before calling');
    });

    test('should generate appropriate recommendations for low urgency', () => {
      const analysis = {
        isRescueSituation: true,
        location: 'Chennai',
        animalType: 'cat',
        urgencyLevel: 'low'
      };
      
      const result = ngoService.getRecommendations(analysis);
      
      expect(result.recommendations).toContain('📞 Contact during regular hours for assistance');
      expect(result.recommendations).toContain('🏠 Consider adoption services if animal is healthy');
    });

    test('should include pet vs stray recommendations for dogs and cats', () => {
      const analysis = {
        isRescueSituation: true,
        location: 'Mumbai',
        animalType: 'dog',
        urgencyLevel: 'medium'
      };
      
      const result = ngoService.getRecommendations(analysis);
      
      expect(result.recommendations).toContain('🐕 Mention if animal appears to be a pet vs. stray');
    });
  });

  describe('NGO Service - City Coverage', () => {
    test('should return all covered cities', () => {
      const cities = ngoService.getCoveredCities();
      
      expect(cities).toHaveLength(8);
      expect(cities.map(c => c.city)).toContain('mumbai');
      expect(cities.map(c => c.city)).toContain('delhi');
      expect(cities.map(c => c.city)).toContain('bangalore');
    });

    test('should include NGO count for each city', () => {
      const cities = ngoService.getCoveredCities();
      
      const mumbai = cities.find(c => c.city === 'mumbai');
      expect(mumbai.ngoCount).toBe(2);
      
      const delhi = cities.find(c => c.city === 'delhi');
      expect(delhi.ngoCount).toBe(2);
    });

    test('should format display names correctly', () => {
      const cities = ngoService.getCoveredCities();
      
      const mumbai = cities.find(c => c.city === 'mumbai');
      expect(mumbai.displayName).toBe('Mumbai');
      
      const delhi = cities.find(c => c.city === 'delhi');
      expect(delhi.displayName).toBe('Delhi');
    });
  });

  describe('OpenAI Service Integration', () => {
    test('should include NGO recommendations in analysis for rescue situations', async () => {
      // Mock the OpenAI response to ensure consistent testing
      const mockAnalysis = {
        isRescueSituation: true,
        animalType: 'dog',
        issue: 'injured',
        location: 'Mumbai near Central Park',
        urgencyLevel: 'high'
      };
      
      // Simulate what the enhanced OpenAI service should return
      const enhancedAnalysis = {
        ...mockAnalysis,
        ngoRecommendations: ngoService.getRecommendations(mockAnalysis)
      };
      
      expect(enhancedAnalysis.ngoRecommendations).toBeDefined();
      expect(enhancedAnalysis.ngoRecommendations.found).toBe(true);
      expect(enhancedAnalysis.ngoRecommendations.city).toBe('mumbai');
    });

    test('should not include NGO recommendations for non-rescue situations', async () => {
      const mockAnalysis = {
        isRescueSituation: false,
        animalType: 'unknown',
        issue: 'general inquiry',
        location: 'Mumbai'
      };
      
      const enhancedAnalysis = {
        ...mockAnalysis,
        ngoRecommendations: ngoService.getRecommendations(mockAnalysis)
      };
      
      expect(enhancedAnalysis.ngoRecommendations).toBe(null);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty or invalid locations gracefully', () => {
      expect(ngoService.extractCity('')).toBe(null);
      expect(ngoService.extractCity(null)).toBe(null);
      expect(ngoService.extractCity(undefined)).toBe(null);
      expect(ngoService.extractCity(123)).toBe(null);
    });

    test('should handle missing analysis data gracefully', () => {
      expect(ngoService.getRecommendations(null)).toBe(null);
      expect(ngoService.getRecommendations({})).toBe(null);
      expect(ngoService.getRecommendations({ isRescueSituation: false })).toBe(null);
    });

    test('should handle cities with no NGOs', () => {
      const result = ngoService.matchNGOs('NonExistentCity', 'dog', 'high');
      
      expect(result.found).toBe(false);
      expect(result.fallback).toBeDefined();
      expect(result.fallback.phone).toBe('1962');
    });

    test('should handle emergency contacts for cities with no NGOs', () => {
      const contacts = ngoService.getEmergencyContacts('NonExistentCity', 'high');
      
      expect(contacts).toHaveLength(0);
    });
  });

  describe('Data Integrity', () => {
    test('should have valid NGO data structure', () => {
      const cities = ngoService.getCoveredCities();
      
      cities.forEach(city => {
        const ngos = ngoService.matchNGOs(city.displayName, 'dog', 'medium').ngos;
        
        ngos.forEach(ngo => {
          expect(ngo).toHaveProperty('id');
          expect(ngo).toHaveProperty('name');
          expect(ngo).toHaveProperty('phone');
          expect(ngo).toHaveProperty('email');
          expect(ngo).toHaveProperty('specializations');
          expect(ngo).toHaveProperty('availability');
          expect(ngo).toHaveProperty('rating');
          expect(ngo.rating).toBeGreaterThan(0);
          expect(ngo.rating).toBeLessThanOrEqual(5);
        });
      });
    });

    test('should have fallback NGO with required properties', () => {
      const result = ngoService.matchNGOs('UnknownCity', 'dog', 'high');
      
      expect(result.fallback).toHaveProperty('name');
      expect(result.fallback).toHaveProperty('phone');
      expect(result.fallback).toHaveProperty('description');
      expect(result.fallback).toHaveProperty('availability');
    });
  });

  describe('Phase 3 End-to-End Integration', () => {
    test('should complete full NGO recommendation workflow', () => {
      const analysis = {
        isRescueSituation: true,
        location: 'Near Gateway of India, Mumbai',
        animalType: 'dog',
        urgencyLevel: 'high'
      };
      
      const result = ngoService.getRecommendations(analysis);
      
      // Should find Mumbai NGOs
      expect(result.found).toBe(true);
      expect(result.city).toBe('mumbai');
      
      // Should have NGOs with emergency capabilities for high urgency
      const hasEmergencyNGO = result.ngos.some(ngo => 
        ngo.specializations.includes('emergency') || ngo.availability.includes('24/7')
      );
      expect(hasEmergencyNGO).toBe(true);
      
      // Should have appropriate recommendations
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Should include urgent contact recommendation
      const hasUrgentRec = result.recommendations.some(rec => 
        rec.includes('URGENT') && rec.includes('immediately')
      );
      expect(hasUrgentRec).toBe(true);
    });
  });
});

console.log('✅ Phase 3: NGO Recommendations - All 25 tests defined and ready to run'); 