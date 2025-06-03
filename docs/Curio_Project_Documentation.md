
# 🐾 Curio – Stray Animal Rescue Chatbot (AI-Powered with ChatGPT)

Curio is an intelligent and empathetic chatbot designed to assist citizens in reporting and managing stray animal rescue situations. It leverages the power of OpenAI's ChatGPT to provide immediate, friendly, and structured support for helping animals in distress.

---

## 🧩 MVP Features (Phase 1 – Hackathon Ready)

These are the features that will be implemented within 2 hours using OpenAI GPT models and deployed via Vercel using a React-based frontend.

### ✅ 1. Chat-based Interface (React + Tailwind)
- Simple and intuitive chat UI for desktop/mobile.
- Stateless design with history window.

### ✅ 2. GPT-Powered Intent & Entity Recognition
- Detects if the user is reporting a stray animal or casually chatting.
- Extracts relevant info from chat:
  - **Animal Type** (dog, cat, cow, etc.)
  - **Problem** (injured, unconscious, etc.)
  - **Location** (from text or prompt)
  - **Urgency Level** (low, medium, high)

### ✅ 3. First Aid & Guidance Suggestions
- GPT provides real-time, empathetic first-aid advice based on the issue.
- Example: “Try to keep the dog warm and avoid touching any open wounds.”

### ✅ 4. Report Summary
- GPT formats a structured report including all user-provided data.
- Displayed to user and available for copy/share.

---

## 🔮 Future Phase Features

These will be implemented in post-MVP phases after the hackathon:

### 🟡 Phase 2: Enhanced Intelligence
- GPT calculates urgency score and tags it to the report.
- More granular location prompting (e.g., "Near which landmark?")

### 🟡 Phase 3: NGO Contact Suggestions
- Static NGO JSON directory per city.
- Match user location to nearby rescue groups with contact info.

### 🟡 Phase 4: Media & Community Engagement
- Allow image uploads for visual context (future GPT vision support).
- Enable case sharing on WhatsApp or social platforms.
- Show recently reported local cases from JSON store.

---

## 🧠 How AI Tools Accelerated Development

| Tool | Role | Impact |
|------|------|--------|
| **ChatGPT (GPT-3.5)** | Extracts intent, animal type, issue, location, and urgency | Eliminated manual NLP and regex-based parsing |
| **Prompt Engineering** | Designed system instructions for GPT agent | Enabled agent to behave empathetically and reliably |
| **Cursor IDE** | AI-native coding & debugging | Rapid iteration and scaffolding of code & tests |
| **Vercel** | Deployment platform | Instant preview & production deployment |
| **Jest + React Testing Library** | Testing framework | Easily validate GPT parsing and UI states |

---

## 🧪 Testing Strategy

| Test Area | Description |
|-----------|-------------|
| `Intent Detection` | Check if GPT correctly identifies stray-related messages |
| `Entity Extraction` | Test for correct animal type, issue, and location parsing |
| `Response Quality` | Ensure GPT maintains empathy and helpfulness |
| `Report Format` | Verify JSON format accuracy and completeness |
| `UI Components` | Validate input rendering, button states, message history |

---

## 🚀 Getting Started

1. **Frontend**: ReactJS (Tailwind + Vite/CRA)
2. **Backend (if needed)**: Serverless functions or simple node service for OpenAI calls
3. **API**: OpenAI GPT-3.5 via `openai` SDK
4. **Deploy**: One-click to Vercel

---

## 📌 Summary

Curio is a real-time, lightweight AI assistant for animal lovers. It empowers citizens to take initiative during animal emergencies, without needing to install apps or call hotlines. With OpenAI's ChatGPT, it becomes empathetic, structured, and ready to grow into a full rescue platform.
