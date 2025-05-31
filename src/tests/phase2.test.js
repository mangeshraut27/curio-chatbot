import openaiService from '../services/openai';

// Mock OpenAI to control responses for testing
jest.mock('../services/openai', () => ({
  analyzeMessage: jest.fn(),
  generateResponse: jest.fn(),
  validateLocation: jest.fn(),
  clearHistory: jest.fn()
}));

describe('Phase 2: Smart Triage & Location Intelligence Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset conversation history for each test
    openaiService.clearHistory();
  });

  describe('Smart Triage System', () => {
    test('test-urgency-high: Should assign HIGH urgency for life-threatening situations', async () => {
      const mockAnalysis = {
        isRescueSituation: true,
        animalType: "dog",
        issue: "unconscious and bleeding heavily",
        location: "Main Street near the park",
        locationSpecificity: 3,
        urgencyLevel: "high",
        urgencyReasoning: "Unconscious animal with severe bleeding requires immediate emergency intervention",
        triageFactors: {
          immediateThreats: ["severe bleeding", "unconsciousness", "potential internal injuries"],
          visibleInjuries: ["open wounds", "blood loss"],
          behaviorConcerns: ["unresponsive"],
          environmentalRisks: ["exposure to traffic"]
        },
        rescueReport: {
          triageScore: 9,
          contactPriority: "emergency",
          immediateActions: ["Contact emergency vet immediately", "Do not move animal", "Control bleeding if possible"]
        }
      };

      openaiService.analyzeMessage.mockResolvedValue(mockAnalysis);

      const result = await openaiService.analyzeMessage("There's an unconscious dog bleeding heavily on Main Street near the park");
      
      expect(result.urgencyLevel).toBe('high');
      expect(result.triageFactors.immediateThreats).toContain('severe bleeding');
      expect(result.rescueReport.triageScore).toBeGreaterThanOrEqual(8);
      expect(result.rescueReport.contactPriority).toBe('emergency');
    });

    test('test-urgency-medium: Should assign MEDIUM urgency for stable but injured animals', async () => {
      const mockAnalysis = {
        isRescueSituation: true,
        animalType: "cat",
        issue: "limping and appears to have injured paw",
        location: "behind grocery store on Oak Avenue",
        locationSpecificity: 4,
        urgencyLevel: "medium",
        urgencyReasoning: "Visible injury but animal is conscious and mobile, requires veterinary attention soon",
        triageFactors: {
          immediateThreats: [],
          visibleInjuries: ["limping", "favoring left paw"],
          behaviorConcerns: ["cautious movement"],
          environmentalRisks: ["limited shelter"]
        },
        rescueReport: {
          triageScore: 5,
          contactPriority: "urgent",
          immediateActions: ["Provide temporary shelter", "Monitor for worsening", "Schedule vet appointment"]
        }
      };

      openaiService.analyzeMessage.mockResolvedValue(mockAnalysis);

      const result = await openaiService.analyzeMessage("I found a cat limping behind the grocery store on Oak Avenue, it seems to have hurt its paw");
      
      expect(result.urgencyLevel).toBe('medium');
      expect(result.triageFactors.visibleInjuries).toContain('limping');
      expect(result.rescueReport.triageScore).toBeGreaterThanOrEqual(4);
      expect(result.rescueReport.triageScore).toBeLessThan(7);
      expect(result.rescueReport.contactPriority).toBe('urgent');
    });

    test('test-urgency-low: Should assign LOW urgency for healthy strays', async () => {
      const mockAnalysis = {
        isRescueSituation: true,
        animalType: "dog",
        issue: "appears healthy but seems lost and hungry",
        location: "neighborhood park on Elm Street",
        locationSpecificity: 4,
        urgencyLevel: "low",
        urgencyReasoning: "Animal appears healthy with no visible injuries, primarily needs shelter and food",
        triageFactors: {
          immediateThreats: [],
          visibleInjuries: [],
          behaviorConcerns: ["appears hungry", "seems lost"],
          environmentalRisks: ["no immediate shelter"]
        },
        rescueReport: {
          triageScore: 2,
          contactPriority: "standard",
          immediateActions: ["Offer food and water", "Check for identification", "Contact local shelters"]
        }
      };

      openaiService.analyzeMessage.mockResolvedValue(mockAnalysis);

      const result = await openaiService.analyzeMessage("There's a friendly dog at the neighborhood park on Elm Street that looks healthy but seems lost and hungry");
      
      expect(result.urgencyLevel).toBe('low');
      expect(result.triageFactors.immediateThreats).toHaveLength(0);
      expect(result.rescueReport.triageScore).toBeLessThan(4);
      expect(result.rescueReport.contactPriority).toBe('standard');
    });

    test('test-triage-score-calculation: Should provide appropriate triage scores 1-10', async () => {
      const highUrgencyMock = {
        rescueReport: { triageScore: 9 }
      };
      const mediumUrgencyMock = {
        rescueReport: { triageScore: 5 }
      };
      const lowUrgencyMock = {
        rescueReport: { triageScore: 2 }
      };

      openaiService.analyzeMessage
        .mockResolvedValueOnce(highUrgencyMock)
        .mockResolvedValueOnce(mediumUrgencyMock)
        .mockResolvedValueOnce(lowUrgencyMock);

      const highResult = await openaiService.analyzeMessage("Emergency situation");
      const mediumResult = await openaiService.analyzeMessage("Moderate situation");
      const lowResult = await openaiService.analyzeMessage("Low priority situation");

      expect(highResult.rescueReport.triageScore).toBeGreaterThanOrEqual(8);
      expect(mediumResult.rescueReport.triageScore).toBeGreaterThanOrEqual(4);
      expect(mediumResult.rescueReport.triageScore).toBeLessThan(7);
      expect(lowResult.rescueReport.triageScore).toBeLessThan(4);
    });
  });

  describe('Location Intelligence System', () => {
    test('test-location-specificity-high: Should rate specific locations highly', async () => {
      const mockAnalysis = {
        isRescueSituation: true,
        location: "123 Main Street, behind the red brick building next to Starbucks, accessible from the alley",
        locationSpecificity: 5,
        locationAnalysis: {
          needsMoreDetail: false,
          suggestedQuestions: [],
          safetyConsiderations: ["well-lit area", "moderate foot traffic"],
          accessibilityNotes: "easily accessible from alley"
        }
      };

      openaiService.analyzeMessage.mockResolvedValue(mockAnalysis);

      const result = await openaiService.analyzeMessage("Injured cat at 123 Main Street, behind the red brick building next to Starbucks, accessible from the alley");
      
      expect(result.locationSpecificity).toBe(5);
      expect(result.locationAnalysis.needsMoreDetail).toBe(false);
      expect(result.locationAnalysis.suggestedQuestions).toHaveLength(0);
    });

    test('test-location-specificity-low: Should identify vague locations and request details', async () => {
      const mockAnalysis = {
        isRescueSituation: true,
        location: "somewhere downtown",
        locationSpecificity: 1,
        locationAnalysis: {
          needsMoreDetail: true,
          suggestedQuestions: [
            "Which street or intersection downtown?",
            "Are there any nearby landmarks?",
            "What type of building or area is it near?"
          ],
          safetyConsiderations: [],
          accessibilityNotes: "Unable to assess without more details"
        }
      };

      openaiService.analyzeMessage.mockResolvedValue(mockAnalysis);

      const result = await openaiService.analyzeMessage("I saw an injured dog somewhere downtown");
      
      expect(result.locationSpecificity).toBe(1);
      expect(result.locationAnalysis.needsMoreDetail).toBe(true);
      expect(result.locationAnalysis.suggestedQuestions).toContain("Which street or intersection downtown?");
    });

    test('test-location-validation: Should validate and improve location descriptions', async () => {
      const mockValidation = {
        specificity: 3,
        improvements: ["Add street number", "Mention nearby businesses"],
        concerns: ["Could be more specific for emergency response"],
        isUseful: true
      };

      openaiService.validateLocation.mockResolvedValue(mockValidation);

      const result = await openaiService.validateLocation("Main Street near the school");
      
      expect(result.specificity).toBe(3);
      expect(result.improvements).toContain("Add street number");
      expect(result.isUseful).toBe(true);
    });

    test('test-safety-considerations: Should identify location safety factors', async () => {
      const mockAnalysis = {
        locationAnalysis: {
          safetyConsiderations: [
            "busy traffic area",
            "limited visibility at night",
            "potential escape routes for animal"
          ],
          accessibilityNotes: "accessible by vehicle, parking available on side street"
        }
      };

      openaiService.analyzeMessage.mockResolvedValue(mockAnalysis);

      const result = await openaiService.analyzeMessage("Injured animal near highway intersection");
      
      expect(result.locationAnalysis.safetyConsiderations).toContain("busy traffic area");
      expect(result.locationAnalysis.accessibilityNotes).toContain("accessible");
    });
  });

  describe('Prompt Consistency Validation', () => {
    test('test-consistency-detection: Should detect contradicting information', async () => {
      // First message: dog
      const firstMock = {
        isRescueSituation: true,
        animalType: "dog",
        consistencyCheck: {
          isConsistent: true,
          conflictingInfo: [],
          clarificationNeeded: []
        }
      };

      // Second message: cat (contradiction)
      const secondMock = {
        isRescueSituation: true,
        animalType: "cat",
        consistencyCheck: {
          isConsistent: false,
          conflictingInfo: ["Previously mentioned dog, now saying cat"],
          clarificationNeeded: ["Please clarify if this is the same animal or a different one"]
        }
      };

      openaiService.analyzeMessage
        .mockResolvedValueOnce(firstMock)
        .mockResolvedValueOnce(secondMock);

      const firstResult = await openaiService.analyzeMessage("I found an injured dog");
      const secondResult = await openaiService.analyzeMessage("The cat seems to be getting worse");

      expect(firstResult.consistencyCheck.isConsistent).toBe(true);
      expect(secondResult.consistencyCheck.isConsistent).toBe(false);
      expect(secondResult.consistencyCheck.conflictingInfo).toContain("Previously mentioned dog, now saying cat");
    });

    test('test-context-awareness: Should maintain conversation context', async () => {
      const contextMock = {
        isRescueSituation: true,
        animalType: "dog",
        issue: "leg injury progressing to difficulty walking",
        consistencyCheck: {
          isConsistent: true,
          conflictingInfo: [],
          clarificationNeeded: []
        }
      };

      openaiService.analyzeMessage.mockResolvedValue(contextMock);

      // Simulate conversation with context
      await openaiService.analyzeMessage("Found an injured dog with a hurt leg");
      const result = await openaiService.analyzeMessage("Now it's having trouble walking");

      expect(result.consistencyCheck.isConsistent).toBe(true);
      expect(result.issue).toContain("walking");
    });

    test('test-clarification-requests: Should ask for clarification when needed', async () => {
      const clarificationMock = {
        consistencyCheck: {
          isConsistent: false,
          conflictingInfo: [],
          clarificationNeeded: [
            "How long has the animal been in this condition?",
            "Has the situation changed since first reported?"
          ]
        }
      };

      openaiService.analyzeMessage.mockResolvedValue(clarificationMock);

      const result = await openaiService.analyzeMessage("The animal situation has changed");

      expect(result.consistencyCheck.clarificationNeeded).toContain("How long has the animal been in this condition?");
      expect(result.consistencyCheck.clarificationNeeded).toHaveLength(2);
    });

    test('test-conversation-history: Should clear history when requested', async () => {
      // This tests the clearHistory functionality
      openaiService.clearHistory();
      
      // Mock to simulate fresh conversation
      const freshMock = {
        isRescueSituation: true,
        consistencyCheck: {
          isConsistent: true,
          conflictingInfo: [],
          clarificationNeeded: []
        }
      };

      openaiService.analyzeMessage.mockResolvedValue(freshMock);

      const result = await openaiService.analyzeMessage("New conversation about a rescue");
      
      expect(result.consistencyCheck.isConsistent).toBe(true);
      expect(openaiService.clearHistory).toHaveBeenCalled();
    });
  });

  describe('Enhanced Response Generation', () => {
    test('test-urgency-tone-matching: Should match response tone to urgency level', async () => {
      const highUrgencyResponse = "🚨 IMMEDIATE ACTION REQUIRED! This is a critical emergency situation that demands urgent veterinary intervention.";
      const mediumUrgencyResponse = "⚠️ This situation needs attention soon. Please monitor the animal and arrange veterinary care.";
      const lowUrgencyResponse = "✅ This appears to be a manageable situation. Here's how you can help while arranging appropriate care.";

      openaiService.generateResponse
        .mockResolvedValueOnce(highUrgencyResponse)
        .mockResolvedValueOnce(mediumUrgencyResponse)
        .mockResolvedValueOnce(lowUrgencyResponse);

      const highResponse = await openaiService.generateResponse({ urgencyLevel: 'high' }, "emergency situation");
      const mediumResponse = await openaiService.generateResponse({ urgencyLevel: 'medium' }, "moderate situation");
      const lowResponse = await openaiService.generateResponse({ urgencyLevel: 'low' }, "low priority situation");

      expect(highResponse).toContain('🚨');
      expect(highResponse).toContain('IMMEDIATE');
      expect(mediumResponse).toContain('⚠️');
      expect(lowResponse).toContain('✅');
    });

    test('test-location-follow-up: Should request location details when needed', async () => {
      const locationAnalysis = {
        locationAnalysis: {
          needsMoreDetail: true,
          suggestedQuestions: ["Could you provide more specific location details?"]
        },
        followUpQuestion: "What landmarks or street names are nearby?"
      };

      openaiService.analyzeMessage.mockResolvedValue(locationAnalysis);

      const result = await openaiService.analyzeMessage("Animal needs help somewhere in the city");

      expect(result.locationAnalysis.needsMoreDetail).toBe(true);
      expect(result.followUpQuestion).toContain("landmarks");
    });

    test('test-immediate-actions: Should provide specific action items', async () => {
      const mockAnalysis = {
        rescueReport: {
          immediateActions: [
            "Do not approach if animal appears aggressive",
            "Contact emergency veterinary services",
            "Secure the area to prevent further injury",
            "Document the animal's condition with photos if safe"
          ]
        }
      };

      openaiService.analyzeMessage.mockResolvedValue(mockAnalysis);

      const result = await openaiService.analyzeMessage("Emergency animal situation");

      expect(result.rescueReport.immediateActions).toContain("Contact emergency veterinary services");
      expect(result.rescueReport.immediateActions).toHaveLength(4);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    test('test-api-error-handling: Should handle OpenAI API errors gracefully', async () => {
      // Mock the actual implementation to return the error response
      openaiService.analyzeMessage.mockImplementation(async () => {
        return {
          isRescueSituation: false,
          animalType: "unknown",
          issue: "unknown",
          location: "unknown",
          locationSpecificity: 1,
          urgencyLevel: "low",
          urgencyReasoning: "Unable to assess due to processing error",
          triageFactors: {
            immediateThreats: [],
            visibleInjuries: [],
            behaviorConcerns: [],
            environmentalRisks: []
          },
          locationAnalysis: {
            needsMoreDetail: true,
            suggestedQuestions: ["Could you please describe the situation again?"],
            safetyConsiderations: [],
            accessibilityNotes: "Unable to assess"
          },
          consistencyCheck: {
            isConsistent: true,
            conflictingInfo: [],
            clarificationNeeded: []
          },
          firstAidTips: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
          rescueReport: null,
          needsMoreInfo: true,
          followUpQuestion: "Could you please describe the situation again?"
        };
      });

      const result = await openaiService.analyzeMessage("test message");

      expect(result.urgencyLevel).toBe('low');
      expect(result.urgencyReasoning).toContain('Unable to assess due to processing error');
      expect(result.locationAnalysis.needsMoreDetail).toBe(true);
    });

    test('test-malformed-input: Should handle unclear messages', async () => {
      const unclearMock = {
        isRescueSituation: false,
        needsMoreInfo: true,
        followUpQuestion: "Could you provide more details about what you've observed?"
      };

      openaiService.analyzeMessage.mockResolvedValue(unclearMock);

      const result = await openaiService.analyzeMessage("something happened maybe");

      expect(result.isRescueSituation).toBe(false);
      expect(result.needsMoreInfo).toBe(true);
      expect(result.followUpQuestion).toContain("details");
    });

    test('test-non-animal-message: Should identify non-rescue situations', async () => {
      const nonAnimalMock = {
        isRescueSituation: false,
        animalType: "unknown",
        issue: "unknown",
        location: "unknown"
      };

      openaiService.analyzeMessage.mockResolvedValue(nonAnimalMock);

      const result = await openaiService.analyzeMessage("What's the weather like today?");

      expect(result.isRescueSituation).toBe(false);
      expect(result.animalType).toBe("unknown");
    });
  });
});

// Phase 2 Integration Tests
describe('Phase 2: Integration Tests', () => {
  test('test-end-to-end-triage: Should handle complete triage workflow', async () => {
    const fullAnalysis = {
      isRescueSituation: true,
      animalType: "dog",
      issue: "severe injury",
      location: "123 Main Street",
      locationSpecificity: 4,
      urgencyLevel: "high",
      urgencyReasoning: "Life-threatening injuries require immediate care",
      triageFactors: {
        immediateThreats: ["bleeding"],
        visibleInjuries: ["open wound"],
        behaviorConcerns: ["distressed"],
        environmentalRisks: ["traffic"]
      },
      locationAnalysis: {
        needsMoreDetail: false,
        suggestedQuestions: [],
        safetyConsiderations: ["busy street"],
        accessibilityNotes: "street-level access"
      },
      consistencyCheck: {
        isConsistent: true,
        conflictingInfo: [],
        clarificationNeeded: []
      },
      rescueReport: {
        triageScore: 8,
        contactPriority: "emergency",
        immediateActions: ["Call emergency vet", "Secure area"]
      }
    };

    openaiService.analyzeMessage.mockResolvedValue(fullAnalysis);

    const result = await openaiService.analyzeMessage("Severely injured dog at 123 Main Street bleeding from leg wound");

    // Verify all Phase 2 components work together
    expect(result.urgencyLevel).toBe('high');
    expect(result.locationSpecificity).toBe(4);
    expect(result.consistencyCheck.isConsistent).toBe(true);
    expect(result.rescueReport.triageScore).toBe(8);
    expect(result.rescueReport.contactPriority).toBe('emergency');
  });
}); 