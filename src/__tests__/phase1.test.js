import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatBot from '../components/ChatBot';
import { setupTestEnvironment } from '../../tests/framework/utils/testUtils';
import * as OpenAIService from '../services/openai';

// Mock the OpenAI service with proper mock functions
jest.mock('../services/openai', () => ({
  analyzeMessage: jest.fn(),
  generateResponse: jest.fn(),
  clearHistory: jest.fn()
}));

// Setup test environment before all tests
beforeAll(() => {
  setupTestEnvironment();
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Phase 1 Tests - MVP Chatbot', () => {
  test('should render chat interface correctly', () => {
    render(<ChatBot />);
    
    // Verify initial UI elements
    expect(screen.getByText(/Hello! I'm Curio/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe the animal situation/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
}); 