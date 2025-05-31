import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatBot from '../components/ChatBot';
import OpenAIService from '../services/openai';

// Mock the OpenAI service
jest.mock('../services/openai');

describe('Phase 1 Tests - MVP Chatbot', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Intent Detection
  test('test-intent-detection: should identify rescue situations', async () => {
    const mockAnalysis = {
      isRescueSituation: true,
      animalType: 'dog',
      issue: 'injured',
      location: 'park',
      firstAidTips: 'Keep the animal calm and call for help',
      rescueReport: {
        timestamp: new Date().toISOString(),
        animalType: 'dog',
        issue: 'injured',
        location: 'park',
        urgency: 'high',
        recommendations: 'Contact local animal rescue immediately'
      },
      needsMoreInfo: false,
      followUpQuestion: null
    };

    OpenAIService.analyzeMessage.mockResolvedValue(mockAnalysis);
    OpenAIService.generateResponse.mockResolvedValue('I understand there is an injured dog at the park. Let me help you with this situation.');

    render(<ChatBot />);
    
    const input = screen.getByPlaceholderText('Describe the stray animal situation...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'There is an injured dog in the park' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(OpenAIService.analyzeMessage).toHaveBeenCalledWith('There is an injured dog in the park');
    });

    expect(mockAnalysis.isRescueSituation).toBe(true);
  });

  // Test 2: Animal Extraction
  test('test-animal-extraction: should correctly extract animal type', async () => {
    const testCases = [
      { input: 'I found a stray cat', expected: 'cat' },
      { input: 'There is an injured dog here', expected: 'dog' },
      { input: 'A bird fell from its nest', expected: 'bird' }
    ];

    for (const testCase of testCases) {
      const mockAnalysis = {
        isRescueSituation: true,
        animalType: testCase.expected,
        issue: 'unknown',
        location: 'unknown',
        firstAidTips: 'Test response',
        rescueReport: null,
        needsMoreInfo: false,
        followUpQuestion: null
      };

      OpenAIService.analyzeMessage.mockResolvedValue(mockAnalysis);
      OpenAIService.generateResponse.mockResolvedValue('Test response');

      const result = await OpenAIService.analyzeMessage(testCase.input);
      expect(result.animalType).toBe(testCase.expected);
    }
  });

  // Test 3: Issue Extraction
  test('test-issue-extraction: should correctly parse problems', async () => {
    const testCases = [
      { input: 'The dog is injured and bleeding', expected: 'injured' },
      { input: 'Cat appears to be sick and weak', expected: 'sick' },
      { input: 'Found an abandoned puppy', expected: 'abandoned' }
    ];

    for (const testCase of testCases) {
      const mockAnalysis = {
        isRescueSituation: true,
        animalType: 'unknown',
        issue: testCase.expected,
        location: 'unknown',
        firstAidTips: 'Test response',
        rescueReport: null,
        needsMoreInfo: false,
        followUpQuestion: null
      };

      OpenAIService.analyzeMessage.mockResolvedValue(mockAnalysis);
      
      const result = await OpenAIService.analyzeMessage(testCase.input);
      expect(result.issue).toBe(testCase.expected);
    }
  });

  // Test 4: Location Follow-up
  test('test-location-followup: should ask for location when missing', async () => {
    const mockAnalysis = {
      isRescueSituation: true,
      animalType: 'dog',
      issue: 'injured',
      location: 'unknown',
      firstAidTips: 'Keep the animal calm',
      rescueReport: null,
      needsMoreInfo: true,
      followUpQuestion: 'Where exactly did you find this injured dog?'
    };

    OpenAIService.analyzeMessage.mockResolvedValue(mockAnalysis);
    OpenAIService.generateResponse.mockResolvedValue('I need to know the location. Where exactly did you find this injured dog?');

    const result = await OpenAIService.analyzeMessage('There is an injured dog');
    
    expect(result.needsMoreInfo).toBe(true);
    expect(result.location).toBe('unknown');
    expect(result.followUpQuestion).toContain('Where');
  });

  // Test 5: Care Response
  test('test-care-response: should return first-aid message', async () => {
    const mockAnalysis = {
      isRescueSituation: true,
      animalType: 'cat',
      issue: 'injured',
      location: 'street',
      firstAidTips: 'Do not touch the cat directly. Use a towel or blanket to gently wrap the animal. Keep it warm and quiet while seeking help.',
      rescueReport: null,
      needsMoreInfo: false,
      followUpQuestion: null
    };

    OpenAIService.analyzeMessage.mockResolvedValue(mockAnalysis);
    
    const result = await OpenAIService.analyzeMessage('Injured cat on the street');
    
    expect(result.firstAidTips).toBeTruthy();
    expect(result.firstAidTips.length).toBeGreaterThan(10);
    expect(result.firstAidTips).toContain('towel');
  });

  // Test 6: Report Format
  test('test-report-format: should generate structured JSON report', async () => {
    const mockAnalysis = {
      isRescueSituation: true,
      animalType: 'dog',
      issue: 'injured',
      location: 'central park',
      firstAidTips: 'Keep calm and call for help',
      rescueReport: {
        timestamp: '2023-12-07T10:30:00.000Z',
        animalType: 'dog',
        issue: 'injured',
        location: 'central park',
        urgency: 'high',
        recommendations: 'Contact emergency animal services immediately'
      },
      needsMoreInfo: false,
      followUpQuestion: null
    };

    OpenAIService.analyzeMessage.mockResolvedValue(mockAnalysis);
    
    const result = await OpenAIService.analyzeMessage('Injured dog in central park');
    
    expect(result.rescueReport).toBeTruthy();
    expect(result.rescueReport).toHaveProperty('timestamp');
    expect(result.rescueReport).toHaveProperty('animalType');
    expect(result.rescueReport).toHaveProperty('issue');
    expect(result.rescueReport).toHaveProperty('location');
    expect(result.rescueReport).toHaveProperty('urgency');
    expect(result.rescueReport).toHaveProperty('recommendations');
    
    expect(['low', 'medium', 'high']).toContain(result.rescueReport.urgency);
  });

  // Integration Test: UI Components
  test('should render chat interface correctly', () => {
    render(<ChatBot />);
    
    expect(screen.getByText('🐾 Chat with Curio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe the stray animal situation...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText(/Hi there! I'm Curio/)).toBeInTheDocument();
  });

  // Test: Error Handling
  test('should handle API errors gracefully', async () => {
    OpenAIService.analyzeMessage.mockRejectedValue(new Error('API Error'));
    
    render(<ChatBot />);
    
    const input = screen.getByPlaceholderText('Describe the stray animal situation...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/I'm sorry, I encountered an error/)).toBeInTheDocument();
    });
  });
}); 