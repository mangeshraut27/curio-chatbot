# 🐾 Curio – Stray Animal Rescue Chatbot (AI-Powered with OpenAI GPT)

Curio is a friendly, AI-powered chatbot that helps users report and handle stray animal issues with empathy and efficiency. Built using OpenAI's GPT models and deployed on Vercel, this project is structured in clear **phases** for rapid iteration and deployment.

---

## 🚀 Tech Stack

- **Frontend**: React with Vercel Deployment
- **Backend**: OpenAI GPT-3.5 via API
- **AI Agent**: Prompt-based logic using OpenAI's Chat Completions
- **Testing**: Jest + Playwright (for UI/interaction)

---

## ✅ Phase Plan & What AI Builds in 2 Hours

### 🔹 Phase 1: MVP – Basic Chatbot

- [x] Chat UI built with React
- [x] OpenAI GPT integration (basic prompt)
- [x] Recognizes if a message is about a stray animal
- [x] Extracts: animal type, issue, and location
- [x] Suggests basic first aid tips using GPT
- [x] Generates structured rescue report
- [x] Tests written for all components

### 🔹 Phase 2: Smart Triage & Location ✅ **COMPLETED**

- [x] **Smart Triage System**: Assign urgency levels (low/med/high) using GPT with detailed reasoning
- [x] **Advanced Location Intelligence**: Ask for more precise location if missing with 1-5 specificity rating
- [x] **Prompt Consistency Validation**: Maintain conversation context and detect contradictions
- [x] **Enhanced Triage Factors**: Identify immediate threats, visible injuries, behavior concerns, environmental risks
- [x] **Priority-Based Contact Recommendations**: Emergency/urgent/standard contact priority
- [x] **Location Safety Analysis**: Assess accessibility and safety considerations
- [x] **Context-Aware Follow-ups**: Smart location requests and urgency-based alerts
- [x] **Comprehensive Test Suite**: 20+ Phase 2 tests covering all new features

### 🔹 Phase 3: NGO Recommendations ✅ **COMPLETED**

- [x] **Static NGO Database**: Comprehensive JSON file with 8 major cities coverage
- [x] **Smart Location Matching**: Advanced city extraction with aliases (Mumbai/Bombay, Delhi/NCR, etc.)
- [x] **Specialization Filtering**: Match NGOs by animal type and expertise
- [x] **Urgency-Based Prioritization**: 24/7 services prioritized for high urgency cases
- [x] **Emergency Contact System**: Quick access to priority contacts
- [x] **Fallback Support**: National helpline when local NGOs unavailable
- [x] **Contextual Recommendations**: Smart guidance based on urgency and animal type
- [x] **Integrated UI Components**: Beautiful NGO panel with contact actions
- [x] **Comprehensive Test Suite**: 25+ Phase 3 tests covering all NGO features

### 🔹 Phase 4: Community + Media ✅ **COMPLETED**

- [x] **GPS Location Detection**: Automatic browser geolocation when users send messages
- [x] **Distance-Based NGO Sorting**: Real-time distance calculation and proximity-based recommendations
- [x] **Enhanced Location Intelligence**: Reverse geocoding with address resolution and accuracy assessment
- [x] **Smart Location Prompting**: Contextual location permission requests with user education
- [x] **Precision Analytics**: GPS accuracy monitoring and location quality feedback
- [x] **Fallback Support**: Graceful handling when location access is denied
- [x] **Visual Location Indicators**: GPS accuracy badges and distance display in NGO cards
- [x] **Mobile Optimization**: Location features optimized for mobile device usage

### 🔹 Phase 5: Media + Community (Planned)

- [ ] **Recent Cases Display**: Show list of recently reported cases from local JSON storage
- [ ] **Social Media Integration**: Share button for posting to X/WhatsApp with case details
- [ ] **Image Upload Framework**: Prepare infrastructure for future GPT-4 Vision integration
- [ ] **Community Feed**: Local case sharing and community awareness
- [ ] **Case Status Tracking**: Follow-up system for reported cases
- [ ] **Export Functionality**: Generate detailed PDF reports for authorities
- [ ] **Comprehensive Test Suite**: 25+ Phase 5 tests covering all community features

---

## ✅ Test Descriptions (Per Phase)

### ✅ Phase 1 Tests
| Test Name | Description |
|-----------|-------------|
| `test-intent-detection` | Checks if GPT can identify a rescue situation from a message |
| `test-animal-extraction` | Validates correct extraction of animal type from sample prompts |
| `test-issue-extraction` | Ensures correct parsing of problem (e.g., injured, unconscious) |
| `test-location-followup` | Confirms bot asks for location when it's not provided |
| `test-care-response` | Tests whether bot returns a first-aid message |
| `test-report-format` | Ensures the final report is JSON structured and complete |

### ✅ Phase 2 Tests (**20+ Tests**)
| Test Name | Description |
|-----------|-------------|
| `test-urgency-high` | Validates HIGH urgency assignment for life-threatening situations |
| `test-urgency-medium` | Tests MEDIUM urgency for stable but injured animals |
| `test-urgency-low` | Confirms LOW urgency for healthy strays needing help |
| `test-triage-score-calculation` | Ensures appropriate 1-10 triage scoring |
| `test-location-specificity-high` | Tests high-detail location rating (5/5) |
| `test-location-specificity-low` | Validates vague location detection and improvement requests |
| `test-location-validation` | Tests enhanced location validation system |
| `test-safety-considerations` | Confirms identification of location safety factors |
| `test-consistency-detection` | Validates contradiction detection in conversations |
| `test-context-awareness` | Tests conversation history maintenance |
| `test-clarification-requests` | Ensures appropriate clarification prompts |
| `test-conversation-history` | Tests conversation reset functionality |
| `test-urgency-tone-matching` | Validates response tone matches urgency level |
| `test-location-follow-up` | Tests smart location detail requests |
| `test-immediate-actions` | Confirms specific action item generation |
| `test-api-error-handling` | Tests graceful error handling |
| `test-malformed-input` | Validates unclear message handling |
| `test-non-animal-message` | Tests non-rescue situation identification |
| `test-end-to-end-triage` | Full workflow integration test |

### ✅ Phase 3 Tests (**25+ Tests**)
| Test Name | Description |
|-----------|-------------|
| `test-city-extraction-direct` | Tests direct city name extraction (Mumbai, Delhi, etc.) |
| `test-city-extraction-detailed` | Validates extraction from complex location strings |
| `test-city-aliases` | Tests alias handling (Bombay→Mumbai, Calcutta→Kolkata) |
| `test-case-insensitive-matching` | Ensures case-insensitive city matching |
| `test-unknown-city-handling` | Tests graceful handling of unknown locations |
| `test-ngo-matching-valid-city` | Validates NGO matching for covered cities |
| `test-emergency-prioritization` | Tests emergency NGO prioritization for high urgency |
| `test-availability-sorting` | Validates 24/7 service prioritization |
| `test-fallback-unknown-city` | Tests fallback NGO for uncovered areas |
| `test-specialization-filtering` | Tests animal type specialization matching |
| `test-all-animals-specialization` | Validates "all animals" NGO handling |
| `test-emergency-contacts-high` | Tests priority contact selection for emergencies |
| `test-emergency-contacts-medium` | Validates standard contact selection |
| `test-limited-ngo-cities` | Tests cities with fewer NGO options |
| `test-non-rescue-situations` | Ensures no NGO recommendations for non-rescue cases |
| `test-rescue-recommendations` | Tests complete recommendation generation |
| `test-high-urgency-recommendations` | Validates urgent recommendation content |
| `test-medium-urgency-recommendations` | Tests medium urgency guidance |
| `test-low-urgency-recommendations` | Validates low urgency recommendations |
| `test-pet-vs-stray-guidance` | Tests pet/stray distinction recommendations |
| `test-city-coverage-complete` | Validates complete city coverage data |
| `test-ngo-count-accuracy` | Tests NGO count per city accuracy |
| `test-display-name-formatting` | Validates city name formatting |
| `test-openai-integration` | Tests OpenAI service NGO integration |
| `test-data-integrity` | Validates NGO data structure integrity |
| `test-fallback-properties` | Tests fallback NGO data completeness |
| `test-end-to-end-ngo-workflow` | Complete NGO recommendation workflow test |

### ✅ Phase 4 Tests (**NEW - 30+ Tests Added**)
| Test Name | Description |
|-----------|-------------|
| `test-gps-permission-request` | Tests automatic location permission prompting |
| `test-gps-location-detection` | Validates successful GPS coordinate capture |
| `test-gps-permission-denied` | Tests graceful fallback when location denied |
| `test-reverse-geocoding` | Validates coordinate-to-address conversion |
| `test-location-accuracy-assessment` | Tests GPS accuracy evaluation and feedback |
| `test-distance-calculation` | Validates Haversine distance formula accuracy |
| `test-ngo-distance-sorting` | Tests proximity-based NGO reordering |
| `test-distance-display-formatting` | Validates "1.2km away" / "450m away" formatting |
| `test-city-coordinate-mapping` | Tests city center coordinate accuracy |
| `test-location-caching` | Validates location data persistence (5 min cache) |
| `test-location-timeout-handling` | Tests timeout scenarios for GPS requests |
| `test-location-unavailable-handling` | Tests handling when GPS service unavailable |
| `test-location-service-integration` | Tests LocationService singleton functionality |
| `test-openai-gps-prompting` | Validates GPS data integration in AI prompts |
| `test-enhanced-ngo-matching` | Tests GPS-enhanced NGO recommendation logic |
| `test-location-specificity-gps` | Tests GPS vs text location specificity scoring |
| `test-accuracy-improvement-suggestions` | Tests suggestions for better GPS accuracy |
| `test-location-watch-functionality` | Tests continuous location monitoring |
| `test-watch-position-cleanup` | Validates proper cleanup of location watchers |
| `test-location-permission-status` | Tests permission state tracking |
| `test-multi-city-distance-calc` | Tests cross-city distance calculations |
| `test-ngo-coordinate-fallback` | Tests city center fallback for missing NGO coords |
| `test-location-ui-indicators` | Tests GPS accuracy badges and visual feedback |
| `test-mobile-location-optimization` | Tests mobile device location handling |
| `test-location-error-recovery` | Tests recovery from location service errors |
| `test-distance-radius-filtering` | Tests 50km radius NGO filtering |
| `test-location-context-awareness` | Tests location-aware conversation flow |
| `test-gps-vs-text-priority` | Tests GPS location priority over text extraction |
| `test-location-message-styling` | Tests location-specific message visual styling |
| `test-location-features-display` | Tests location benefit explanation UI |
| `test-end-to-end-gps-workflow` | Complete GPS-enhanced rescue workflow test |

### 🔜 Phase 5+ Tests (Planned)
| Test Name | Description |
|-----------|-------------|
| `test-image-upload` | Tests image upload and analysis |
| `test-recent-cases` | Validates recent cases display |
| `test-social-sharing` | Tests social media sharing functionality |

---

## 🆕 **Phase 4 New Features**

### 🌍 **GPS Location Detection**
- **Browser Geolocation API**: Automatic location access with user permission management
- **Smart Triggering**: Location requests only for meaningful messages (>10 characters)
- **Permission Handling**: Graceful fallback messaging when location access denied
- **Timeout Management**: 10-second timeout with retry logic

### 📍 **Enhanced Location Intelligence**
- **Reverse Geocoding**: GPS coordinates converted to readable addresses via BigDataCloud API
- **Accuracy Assessment**: Real-time GPS precision monitoring (meters)
- **Location Caching**: 5-minute cache to avoid repeated permission requests
- **Cross-Platform Support**: Works on desktop, mobile, and tablet devices

### 🗺️ **Distance-Based NGO Matching**
- **Haversine Calculations**: Precise distance calculation between user and NGOs
- **Proximity Sorting**: Automatic reordering by distance (nearest first)
- **Visual Distance Display**: Shows "2.3km away" or "450m away" for each NGO
- **Radius Filtering**: Filters NGOs within 50km for relevance

### 🎯 **Smart Location UX**
- **Educational Prompting**: Explains benefits of location sharing before requesting
- **Accuracy Feedback**: Shows GPS precision and suggests improvements
- **Fallback Guidance**: Helpful text when location permission denied
- **Visual Indicators**: Special styling for location-related messages

### 🚀 **Technical Architecture**
- **LocationService Singleton**: Centralized location management with state persistence
- **OpenAI Integration**: GPS data seamlessly integrated into AI analysis prompts
- **Error Handling**: Comprehensive error recovery for all location scenarios
- **Mobile Optimization**: Enhanced accuracy and battery efficiency on mobile devices

---

## 📦 Project Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-org/curio-chatbot.git
cd curio-chatbot

# 2. Install dependencies
npm install

# 3. Add your OpenAI API key to .env.local
REACT_APP_OPENAI_API_KEY=your_key_here

# 4. Run the dev server
npm start
```

---

## 🧪 Run Tests

```bash
# All tests (Phase 1 + Phase 2 + Phase 3 + Phase 4)
npm run test

# Phase 4 specific tests (GPS Location)
npm test -- --testNamePattern="Phase 4"

# Phase 3 specific tests (NGO Recommendations)
npm test -- --testNamePattern="Phase 3"

# Phase 2 specific tests (Smart Triage)
npm test -- --testNamePattern="Phase 2"

# End-to-end tests
npx playwright test
```

---

## 🧠 Built with Cursor + OpenAI Agents + Vercel 🚀

**Phase 4 Status**: ✅ **COMPLETED** - Enhanced with comprehensive GPS location detection, distance-based NGO sorting, and intelligent location management!
