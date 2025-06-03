# 🐾 Curio - Phase-wise User Stories

Curio is a compassionate AI chatbot designed to assist citizens in reporting and responding to injured or distressed stray animals. Below are the phase-wise user stories to guide the MVP development and future expansions.

---

## 🟢 Phase 1: MVP - Core Chatbot & Rescue Report Generator

### 🎯 Goal
Enable users to chat with Curio and generate a structured rescue report using OpenAI’s LLM.

### 🧑‍💻 User Stories

- **US-1**: As a concerned citizen, I want to report an injured stray animal by chatting with Curio so I can get help quickly.
- **US-2**: As a user, I want Curio to ask me guided questions (location, animal type, injury) so I don’t miss critical details.
- **US-3**: As a user, I want Curio to summarize the conversation into a formatted rescue report so I can share it with an NGO or shelter.
- **US-4**: As a rescuer, I want to receive structured data (name, contact, animal info) so I can assess urgency and respond faster.
- **US-5**: As a tester, I want to validate that Curio generates relevant, grammatically correct summaries for at least 5 example scenarios.

### 🛠️ Tools
- OpenAI GPT-4 / GPT-3.5
- React + Tailwind
- Deployed on Vercel

### ✅ Testing Considerations
- Snapshot tests for report accuracy
- Prompt injection test cases
- Validation for blank/invalid inputs

---

## 🟡 Phase 2: Visual + Geolocation Integration

### 🎯 Goal
Improve the context and precision of rescue reports using uploaded images and geolocation.

### 🧑‍💻 User Stories

- **US-6**: As a user, I want to allow location access so Curio can suggest nearby shelters and rescue centers.
- **US-7**: As a user, I want to upload a photo of the animal so Curio can better understand its condition.
- **US-8**: As Curio, I want to describe the image using AI to detect possible injury or animal type.
- **US-9**: As a rescuer, I want reports to include maps or nearby NGOs to act quickly.

### 🛠️ Tools
- Browser Geolocation API
- OpenAI GPT-4 Vision / CLIP (open model)
- Upload UI and image preview

---

## 🟠 Phase 3: Voice Interaction + First Aid Guidance

### 🎯 Goal
Enable users to speak with Curio and receive immediate first-aid instructions.

### 🧑‍💻 User Stories

- **US-10**: As a user, I want to speak to Curio instead of typing so I can report incidents hands-free.
- **US-11**: As Curio, I want to convert voice to text using Whisper so I can process audio messages.
- **US-12**: As a user, I want to receive basic first aid instructions based on injury type so I can help immediately.

### 🛠️ Tools
- Whisper (voice-to-text)
- Audio input via browser
- GPT-generated dynamic first-aid steps

---

## 🔵 Phase 4: NGO Notification & Reporting Dashboard

### 🎯 Goal
Enable integration with NGOs and rescue teams via automated reports and dashboards.

### 🧑‍💻 User Stories

- **US-13**: As an NGO member, I want to receive real-time reports on WhatsApp or email so I can dispatch rescuers faster.
- **US-14**: As a community admin, I want to view recent reports and their status via a dashboard.
- **US-15**: As a rescuer, I want a summary view of nearby cases sorted by urgency.

### 🛠️ Tools
- Node.js API integration (email, WhatsApp)
- MongoDB or Firebase for report storage
- React Dashboard components

---

## 🟣 Phase 5: Compassion Points + Community Rewards (Gamification)

### 🎯 Goal
Encourage citizen participation through reward points and leaderboards.

### 🧑‍💻 User Stories

- **US-16**: As a user, I want to earn “Compassion Points” every time I submit a rescue case.
- **US-17**: As a school or local community, I want to see a leaderboard to encourage responsible action.
- **US-18**: As an admin, I want to monitor abuse or spam attempts to keep the platform safe.

### 🛠️ Tools
- Points counter via backend
- Leaderboard UI
- Rate limiting & abuse detection

---

## 📝 Notes

Each user story is aligned with:
- Real-world pain points
- Fast prototyping capability using OpenAI tools
- A balance of emotional empathy and technical feasibility

This file serves as a base roadmap to guide development and testing during the hackathon and beyond.

