# TL;DR Mail — Semantic Design System (DESIGN.md)

Synthesized from **Google Stitch** (`projects/15976681699636626419`) and **Tailwind CSS v4** implementation.

---

## 🎨 Visual Identity & Civic Design DNA

TL;DR Mail is a zero-retention, camera-first public utility for Central Texas residents facing eviction notices, utility shutoffs, medical billing summons, and benefit renewals. The aesthetic philosophy is **"Calm in an Acute Panic"** — balancing official institutional authority with warmth, high legibility, and immediate de-escalation.

---

## 🏛️ Color System

| Token | Hex | Role | Real-World Application |
|---|---|---|---|
| `--color-paper` | `#f3efe6` | Global Canvas Background | Muted, warm unbleached paper tone. Reduces cognitive glare during high anxiety. |
| `--color-paper-elevated` | `#faf8f4` | Sectional Background | Subtle contrast card containers. |
| `--color-surface` | `#fffdf9` | Card / Modal Surface | Clean, crisp, high-trust document backing. |
| `--color-ink` | `#1c1917` | Primary Typography | Deep charcoal-black; high contrast without harsh digital pure-black. |
| `--color-ink-muted` | `#6b645c` | Secondary Typography | Warm stone-gray for timestamps, metadata, and subtitles. |
| `--color-line` | `#ddd5c8` | Subtle Dividers | Newspaper editorial border rule. |
| `--color-accent` | `#1a4d3e` | Primary Civic Green | Austin deep forest/cedar green. Conveys safety, action, and verified aid. |
| `--color-accent-soft` | `#e6efe9` | Positive Container Pill | Gentle sage tint for badges and completed actions. |
| `--color-primary` | `#1e3a8a` | Deep Civic Navy | Institutional authority (Stitch token) for emergency header strips and courts. |
| `--color-primary-container`| `#eff6ff` | Civic Navy Container | Soft blue container for category pills and badges. |
| `--color-emergency` | `#b91c1c` | Critical Urgency | High-contrast crimson for 72-hour eviction and disconnection alarms. |
| `--color-warning` | `#d97706` | Cautionary Amber | Amber tone for 6th-grade translation box and fee disputes. |
| `--color-calm` | `#047857` | Statutory Protection | Emerald green for tenant rights shield and charity care write-offs. |

---

## 🔤 Typography & Hierarchy

* **Headings**: `Newsreader` / Serif (`var(--font-serif)`). Editorial, trustworthy, reminiscent of traditional civic legal declarations.
* **Body**: `IBM Plex Sans` / `Inter` (`var(--font-sans)`). High legibility across screen sizes, optimized for low document literacy and ESL readability.
* **Metadata & OCR Facsimiles**: `IBM Plex Mono` (`var(--font-mono)`). Used for dates, docket numbers, extracted OCR transcripts, and legal dispute letter drafting.

### Font Scale Adjuster
* `Normal`: Default (16px base)
* `Large`: `A+` (18px base / `1.125rem`)
* `Extra Large`: `A++` (20px base / `1.25rem`) for seniors and visually impaired residents.

---

## 📐 Layout & Bento Architecture

1. **Top Emergency Bar**: Sticky alert strip providing immediate 24/7 hotline numbers (`(512) 474-1961` for Austin Tenant Council).
2. **"Calm in a Panic" Triage Card**:
   * Immediate statutory reassurance: *"You do NOT have to leave today. A Notice to Vacate is NOT an eviction order."*
   * 6th-grade translation callout banner.
3. **4-Card Metric Bento Grid**:
   * `Card 1`: **What It Demands** (Financial balance or key surrender demand).
   * `Card 2`: **Strict Legal Deadline** (Statutory window with 1-click Google Calendar / .ICS sync).
   * `Card 3`: **Financial / Late Fee Analysis** (Statutory fee violation flags under Texas Property Code § 92.019).
   * `Card 4`: **Next Escalation** (The real-world penalty if the notice is ignored).
4. **Document Spotlight**: Side-by-side or tabbed view comparing the original scanned notice against the plain-English translation with interactive click-to-decode legal jargon terms.
5. **Interactive Statutory Stepper**: Multi-stage roadmap showing current phase (Notice Phase vs. Justice Court vs. Trial vs. Resolution).
6. **Accessible Audio HUD**: Sticky floating playback bar with speed multipliers (`0.75x`, `1.0x`, `1.25x`) and karaoke-style text highlighting.
7. **Client-Side Privacy Shield**: In-browser HTML5 canvas blackout brush and 1-tap auto-scrub for sensitive PII.
