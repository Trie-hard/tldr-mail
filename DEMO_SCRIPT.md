# TL;DR Mail — WarriorHacks 2.0 Video Demo Script
**Track:** Civic Tech / Hackathon Track  
**Total Target Runtime:** 2 Minutes 30 Seconds (150 Seconds)  
**Tone:** Urgent, Empathetic, Highly Technical, Community-Driven  
**Setting:** Austin & Central Texas (Travis County) Civic Crisis  

---

## Production & Filming Setup Checklist
- **Display Resolution:** 1920x1080 (16:9), 60 FPS
- **Browser:** Chrome / Brave in clean profile, 100% zoom, light mode, bookmark bar hidden
- **Microphone:** Clean directional vocal mic with pop filter
- **Audio Output:** System audio captured for the Web Speech API voice synthesis
- **Test State:** App loaded at `http://localhost:3000` (or production deployment)
- **Props (Optional for Opening):** Real official envelope with a red warning stamp or Travis County emblem

---

## Timeline Overview
| Timestamp | Segment | Focus & Action |
|---|---|---|
| **0:00 – 0:25** | **The Hook** | Real Austin housing story + Travis County eviction statistics |
| **0:25 – 1:15** | **Live Demo Part 1** | 3-Day Notice scan -> 6th-grade breakdown -> Spanish -> Voice Read-Aloud |
| **1:15 – 1:55** | **Live Demo Part 2** | Privacy Shield Redaction -> Google Calendar -> TRLA -> Dispute Letter |
| **1:55 – 2:30** | **Tech & Impact** | Gemini Multimodal architecture, zero-storage privacy, community roadmap |

---

## Detailed Script & Step-by-Step Recording Guide

### Segment 1: The Hook (0:00 – 0:25 | 25 Seconds)
**Camera/Screen:**  
*0:00 - 0:08:* Front-facing camera or b-roll: Presenter holding a thick, dense legal letter with fine print.  
*0:08 - 0:25:* Cut to screen share showing TL;DR Mail landing page (`localhost:3000`), zooming briefly onto the "Why TL;DR Mail Exists" Community Impact Modal.

**Visual Actions:**
1. Camera shows presenter holding a certified mail envelope.
2. Cut to screen: User clicks the **"Why This Matters"** button in top header.
3. The Community Impact modal animates in with 4 bold statistics:
   - **32,000+** Eviction Filings / Year in Travis & Williamson Counties.
   - **1 in 5** Central Texas adults struggling with functional literacy.
   - **$180 Million+** lost in Texas Medicaid/SNAP due to paperwork confusion.
   - **3 Days** standard Texas Notice to Vacate window under Texas Property Code §24.005.

**Voiceover (Presenter):**
> *(0:00 - 0:10)*  
> "Meet Carlos. He's an Austin carpenter who arrived home to find this terrifying, certified notice taped to his door. Four pages of dense legal jargon, citing Texas Property Code Section 24.005."
> 
> *(0:10 - 0:18)*  
> "Like more than 32,000 families in Travis County this year alone, Carlos faced an eviction countdown. In Texas, landlords only have to give **72 hours** before filing an eviction lawsuit."
> 
> *(0:18 - 0:25)*  
> "Over 54% of Americans read below a 6th-grade level. When intimidating official mail arrives, fear causes paralysis. Deadlines pass. Homes are lost. **This is TL;DR Mail.**"

---

### Segment 2: Live Demo Part 1 (0:25 – 1:15 | 50 Seconds)
**Camera/Screen:**  
Full screen recording of TL;DR Mail web application. Crisp cursor movements, highlighted clicks.

**Visual Actions:**
1. *(0:25 - 0:32)* Close the stats modal. Move cursor down to **"Try a Real Sample Letter (1-Click Demo)"**. Click on the card:  
   👉 **`🏠 3-Day Notice to Vacate`** *(Travis County eviction notice)*.
2. *(0:32 - 0:38)* The screen smoothly transitions to the **Analyzing Letter** pulsing spinner with the badge:  
   *`Simplifying to 6th-grade reading level (English)`*.  
   Within 1.5 seconds, the full analysis appears with an animated entry.
3. *(0:38 - 0:48)* Hover over and highlight the prominent UI blocks:
   - **High Stakes Banner:** `⚠️ High Stakes Notice Detected — Immediate Action Required`.
   - **Triage Urgency Bar:** `CRITICAL — URGENT — Action Required Immediately`.
   - **Plain Language TL;DR:**  
     *"You must pay $1,625 in rent and late fees within 3 days, or your landlord will file an eviction lawsuit against you in Travis County JP Court Precinct 3."*
   - **The 4 Quick-Insight Grid Cards:**
     - *What It Wants From You:* Pay $1,625.00 in certified funds or move out.
     - *Strict Deadline:* October 1, 2026 (3 days from notice date).
     - *Amount Owed:* $1,625.00.
     - *If You Do Nothing:* Forcible detainer lawsuit filed in Justice of the Peace Court.
4. *(0:48 - 0:58)* Move cursor to the language selector in the top navbar. Click the dropdown and select **`Español`**.
   - Show how the entire analysis instantly re-renders in fluent, natural Spanish.
   - The headline updates: *"Debe pagar $1,625 en alquiler y cargos por mora en un plazo de 3 días..."*
5. *(0:58 - 1:15)* Click the **`Read Aloud (Español)`** button with the volume speaker icon.
   - Web Speech API voice begins speaking aloud in Spanish:  
     *“Debe pagar $1,625 en alquiler y cargos por mora en un plazo de 3 días o su arrendador presentará una demanda de desalojo...”*
   - Let the audio play cleanly for 4 seconds, then click **`Stop Audio`** and switch back to English.

**Voiceover (Presenter):**
> *(0:25 - 0:35)*  
> "A user snaps a picture or taps one of our pre-loaded Travis County case letters. Instantly, TL;DR Mail ingests the document using Gemini 2.5 Flash with strict multimodal schema extraction."
> 
> *(0:35 - 0:47)*  
> "Boom. No legalese. At a 6th-grade reading level, Carlos immediately sees the bottom line: he owes $1,625, he has exactly three days, and if he doesn't act, a lawsuit will be filed in Travis County Precinct 3."
> 
> *(0:47 - 0:58)*  
> "Over 33% of Austin residents speak a language other than English at home. With one tap, we switch to Spanish, Vietnamese, Chinese, or Arabic — completely recalibrated in plain language."
> 
> *(0:58 - 1:15)*  
> "And for residents with vision impairment or limited literacy, TL;DR Mail reads the entire emergency action plan aloud via the native browser Web Speech API. No expensive cloud text-to-speech lag, zero friction."

---

### Segment 3: Live Demo Part 2 (1:15 – 1:55 | 40 Seconds)
**Camera/Screen:**  
Full screen recording.

**Visual Actions:**
1. *(1:15 - 1:26)* Click **"Scan Another"** to return to home.  
   - Drag or select an image file to trigger the **Privacy Shield Canvas**.
   - Show the canvas view: `Privacy Shield: Redact Sensitive Info (Client-Side Only)`.
   - Take cursor and drag a black marker rectangle over a Social Security Number or account number directly on the canvas.
   - Point out that this is executed 100% in the client browser canvas before any bytes reach the AI API.
   - Click **`Analyze Letter Now`**.
2. *(1:26 - 1:35)* On the results page, move cursor to the Action Bar:
   - Click **`Google Calendar`**.
   - A new tab opens showing Google Calendar pre-filled with:
     - Title: `⚠️ DEADLINE: 3-Day Notice to Vacate`
     - Auto-calculated date: October 1, 2026.
     - Description: All action items and amount due.
     - Note the `.ics` download button right beside it for Apple iCal and Outlook users.
3. *(1:35 - 1:45)* Scroll down to **"Matched Free Local Help"**:
   - Highlight **Texas RioGrande Legal Aid (TRLA)** (`1-888-988-9996`) with the green `FREE` tag.
   - Show the one-click `Call 1-888-988-9996` button and website link.
   - Also show **Austin Tenants Council** (`(512) 474-1961`) and **Texas 2-1-1**.
4. *(1:45 - 1:55)* Scroll down to **"Auto-Drafted Response & Dispute Letter"**:
   - Click **`Generate Official Response / Dispute Letter`**.
   - In 2 seconds, Gemini drafts a formal tenant dispute letter citing Texas Property Code §24.005, requesting an itemized ledger and proposing an installment plan.
   - Click **`Copy Letter`** (shows green checkmark "Copied to Clipboard!").
   - Click **`Print 1-Page Summary`** to show the browser print dialog cleanly formatted for a community casework binder.

**Voiceover (Presenter):**
> *(1:15 - 1:25)*  
> "Privacy is our highest civic priority. When residents photograph sensitive documents, our client-side **Privacy Shield** lets them blackout SSNs or account numbers directly on their device canvas before a single pixel leaves their phone."
> 
> *(1:25 - 1:35)*  
> "Next: action. Carlos clicks 'Google Calendar' — and the 72-hour countdown is instantly locked into his schedule with automatic 3-day, 1-day, and 2-hour phone alarms."
> 
> *(1:35 - 1:45)*  
> "Even better, TL;DR Mail understands Central Texas jurisprudence. Because this is an eviction, it automatically matches Carlos with **Texas RioGrande Legal Aid** and the **Austin Tenants Council** for free legal representation, with direct 1-tap phone dialers."
> 
> *(1:45 - 1:55)*  
> "And if Carlos needs to respond immediately, our auto-response engine generates a formal dispute letter citing Texas tenant protections, ready to copy, sign, and hand to the property manager."

---

### Segment 4: Architecture, Privacy, & Impact (1:55 – 2:30 | 35 Seconds)
**Camera/Screen:**  
*1:55 - 2:15:* Full-screen slide or split-screen graphic showcasing the Technical Architecture diagram.  
*2:15 - 2:30:* Return to presenter on camera with app floating alongside, strong closing delivery.

**Visual Graphic / On-Screen Elements:**
- Architecture diagram showing:
  - Frontend: Next.js 15 App Router + React 19 + Tailwind CSS + Lucide Icons + Framer Motion
  - Client-Side Privacy Shield: HTML5 Canvas 2D in-memory redaction
  - AI Engine: Google Gemini 2.5 Flash via `@google/genai` SDK
  - Type-Safe Contract: `ANALYSIS_SCHEMA` (Strict JSON Schema enforcing zero date hallucination)
  - Accessibility: Browser Web Speech API (`SpeechSynthesisUtterance`)
  - Zero-Knowledge Storage: Zero SQL/NoSQL database; zero server disk storage

**Voiceover (Presenter):**
> *(1:55 - 2:10)*  
> "Under the hood, TL;DR Mail is built on Next.js 15, TypeScript, and Google's Gemini 2.5 Flash model. By utilizing strict JSON Schema output enforcement, we eliminate LLM hallucinations on critical court dates and dollar balances."
> 
> *(2:10 - 2:20)*  
> "Crucially, our architecture is **Zero-Storage by Design**. We do not persist scans, letters, or names in any database. There is zero data to breach, zero tracking, and zero subpoena risk for undocumented or vulnerable community members."
> 
> *(2:20 - 2:30)*  
> "Our roadmap includes SMS Twilio integration for flip-phone users and kiosk deployments across Austin Public Library branches.  
> TL;DR Mail transforms paralyzing bureaucratic fear into informed, timely community action. Thank you, WarriorHacks!"

---

## Technical Cheatsheet for the Presenter

### Exact Keys to Hit During Screen Recording:
| Action | Element | What Happens |
|---|---|---|
| Open Stats | Header `Why This Matters` button | Modal displays 32,000+ evictions, Travis County context |
| Demo Letter 1 | Click `🏠 3-Day Notice to Vacate` | Runs Gemini analysis or instant fallback with all fields |
| Change Language | Dropdown in header -> select `Español` | Re-analyzes text in Spanish with 6th-grade reading level |
| Speech Audio | Click `Read Aloud` | Voice starts via `SpeechSynthesisUtterance` |
| Stop Speech | Click `Stop Audio` | Stops speech immediately |
| Redaction | Drag image -> draw black box on canvas | Redacts pixels client-side before submission |
| Add to Calendar | Click `Google Calendar` | Opens Google Calendar event creator with date & details |
| Appeal Letter | Click `Generate Official Response Letter` | Calls `/api/appeal` and returns ready-to-sign template |
| Print Mode | Click `Print 1-Page Summary` | Triggers `@media print` cleanly stripping nav and buttons |
