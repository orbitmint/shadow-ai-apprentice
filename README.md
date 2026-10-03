# The AI Apprentice 🎙️👁️

> **Hack-Nation 7th Global AI Hackathon**  
> **Challenge 01:** ElevenLabs: The AI Apprentice — *Accelerating the world's digital operations*

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=flat&logo=next.js)](https://nextjs.org)
[![Powered by ElevenLabs](https://img.shields.io/badge/Powered%20by-ElevenLabs%20Conversational%20AI-orange?style=flat)](https://elevenlabs.io)
[![Vision by Gemini](https://img.shields.io/badge/Vision-Gemini%202.0%20Flash-blue?style=flat)](https://ai.google.dev)

---

## 💡 The Core Mission: "An Apprentice, Not a Recorder"

**Our most experienced generation is retiring.** When Sabine (57, Senior Controller with 24 years at Stuttgart Machine Works) leaves in 18 months, her unwritten judgment goes with her:
- Why equipment over €5,000 must be capitalized to CAPEX 0400.
- Why Delta Logistik invoices must be held every December to prevent seasonal double-billing.
- The guardrails and exceptions that new hires only learn after breaking them.

**The AI Apprentice** watches experts work on their screen, stays quiet while they type, asks *why* at natural pauses, maps their decisions into an interactive **Work Map**, and acts as a **real-time voice tutor** coaching the next generation before mistakes happen.

---

## 🧩 The 3 Challenge Modules (All Implemented)

### 1. Capture (Screen-Share & Voice Apprentice)
- **Screen Observation:** Captures screen via WebRTC `getDisplayMedia` or tests interactively in the embedded Stuttgart Machine Works ERP sandbox.
- **Vision Event Extraction:** Periodically sends frames to Gemini 2.0 Flash to detect significant field modifications, approvals, or holds.
- **Natural Pause Inquiries:** AI apprentice detects pauses, remaining quiet while the expert types or talks, then asks concise spoken questions (*"I noticed you changed Invoice 4471 to 0400 CAPEX. What made you do that?"*).
- **Guardrail Probing:** Proactively inquires about limits (*"Is there a limit or guardrail where you would stop and ask the controller?"*).

### 2. Map (Spoken Debrief & Interactive Work Map)
- **Spoken Debrief Session:** At task end, the apprentice runs a spoken debrief session asking 3 edge-case follow-up questions not answered during the live task.
- **Spoken Teach-Back:** The apprentice summarizes the workflow back in its own words for the expert to confirm or correct.
- **Interactive Work Map Timeline:** A clickable visual timeline linking every step to its screen moment, decision, expert's verbatim reason quote, and guardrails.
- **Export Agent-Ready SOP:** One-click export to structured JSON for agentic execution (Stretch Goal).

### 3. Teach (Voice Tutor Coaching & Guardrail Interception)
- **New Hire Scenario:** Rook (new trainee) processes an incoming invoice (`INV-4480`, €6,850 equipment invoice).
- **Proactive Guardrail Interception:** If Rook attempts to book it to OPEX 4711 or approve without an Asset ID, the voice tutor intercepts before the decision is saved:
  > *"Hold up, Rook! Sabine wouldn't put that in 4711. It's a €6,850 spindle — anything over five grand has to go to Capex 0400. Switch the code first."*
- **Replay Sabine's Screen Moment:** Instantly displays Sabine's exact past moment and decision.
- **Mastery Scorecard:** Displays what Rook has mastered vs. what to practice next.

---

## ⚖️ The Apprentice Test (5 Evaluation Criteria)

| Criterion | Implementation in App |
| :--- | :--- |
| **1. When to ask** | Enforces a 1.2s post-interaction natural pause buffer and suppresses interruptions while user is typing or talking. |
| **2. What to ask** | Vision Brain filters out visible UI labels and targets unwritten rules and threshold guardrails. |
| **3. When it has understood** | Debrief closes 3 unobserved edge-case gaps and concludes with a spoken teach-back confirmed by the expert. |
| **4. Whether new hire learned** | Interactive case catches wrong OPEX decision and updates Rook's progress checklist. |
| **5. Trust & Privacy** | One-click **"Off the Record"** button pauses recording, and **PII Redaction Shield** masks IBANs, Tax IDs, and personal names. |

---

## 🚀 Pitch Slide: The Moonshot
Accessible via the **"Pitch Slide"** button in the app footer:
1. **The Living Company Memory:** An evolving knowledge graph that detects drift as systems change.
2. **The Always-On Ambient Apprentice:** Powered by ElevenLabs Scribe v2 Realtime, speaking only when a true anomaly arises.
3. **People First, Then Autonomous Agents:** SOP guardrails train humans first, then safely constrain software agents.
4. **The World's Operations Manual:** Anonymized Work Maps across 1,016 O*NET occupations.

---

## 🛠️ Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
You only need an **ElevenLabs API Key** for realistic neural voice synthesis!

The intelligence layer uses the **`gemini` CLI already authenticated on your machine**, meaning **no Gemini API key is required**.

Create `.env.local`:
```bash
# In .env.local
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
*(Note: If you don't enter an ElevenLabs key, the app still works completely using built-in browser speech synthesis for immediate, zero-friction testing!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 Demo Walkthrough for Judges (1-Minute Quick Run)

1. **Module 1 (Capture):** Click **"Play Sabine's Steps"** to watch the Apprentice observe Sabine's moves and ask why at natural pauses.
2. **Module 2 (Work Map):** Click **"Debrief"**. Listen to the spoken walkthrough, inspect the 3 follow-up inquiries, and click through the playbook timeline.
3. **Module 3 (Teach):** Click **"Train Rook"**. Click **"Pick Opex (Mistake)"** to see the voice tutor intercept Rook *before* saving, replay Sabine's screen moment, and award mastery points!
4. **Moonshot:** Click **"Pitch Slide"** in the footer for the closing slide.
