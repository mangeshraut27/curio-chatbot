// Mock scrollIntoView for JSDOM environment
export const mockScrollIntoView = () => {
  Element.prototype.scrollIntoView = jest.fn();
};

// Mock window.matchMedia for JSDOM environment
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Mock geolocation for JSDOM environment
export const mockGeolocation = () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn()
      .mockImplementationOnce((success) => success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 100
        }
      })),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  };
  global.navigator.geolocation = mockGeolocation;
};

// Setup all mocks
export const setupTestEnvironment = () => {
  mockScrollIntoView();
  mockMatchMedia();
  mockGeolocation();
}; 