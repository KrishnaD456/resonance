# 🪵 Resonance — Development Log & Architectural History

> **Living Forensic & Biometric Ink Messenger**  
> *Append-only architectural chronicle of executed stories and engineering decisions.*

---

## 📑 Index & Executive Summary

| Story | Title | Primary Focus & Deliverables | Core Files Touched |
| :--- | :--- | :--- | :--- |
| **[#13](#story-13-android-virtual-keyboard-lifecycle--pen-down-engine)** | **Android Virtual Keyboard Lifecycle & "Pen Down" Engine** | Viewport height observer (`visualViewport`), persistent biometric accumulators (`accumulatedSpacePauseMs`, `accumulatedWordHoldMs`), "Hybrid Lingering Ink Pool" for sent messages, streamlined `#modeBadge` pen-down status, zero hover-dependent UI on touchscreens. | `script.js` |
| **[#14](#story-14-self-hosted-variable-ink-typography--css-axis-binding)** | **Self-Hosted Variable Ink Typography & CSS Axis Binding** | Zero-latency local Recursive Variable Font (`recursive-var.woff2`), continuous `wght`/`slnt`/`CASL` axis binding, Dual Tactile Paper Themes (`📜 Stationery` light paper vs. `📓 Midnight Journal` dark vellum), Literary Serif masthead typography, visible living ink wave (`livingInkWave`), feed resting ink lifecycle, and tactile tap wake. | `index.html`, `style.css`, `script.js`, `fonts/` |
| **[Comic Contours](#9-comic-emotion-speech-balloon-silhouettes--dynamic-contours)** | **Comic Emotion Speech Balloon Silhouettes & Dynamic Contours** | Expressive comic speech balloon silhouettes per archetype: buoyant warm cloud bloom (`balloon-warm`), sheared jagged shout box (`balloon-urgent`), drooping dashed whisper contour (`balloon-whisper`), asymmetric split arc (`balloon-mixed`), and classic dialogue oval (`balloon-steady`). Dynamic live preview morphing and cross-theme consistency. | `style.css`, `index.html` |
| **[Feed Lifecycle](#10-living-ink-feed-lifecycle-send-settling-flow--zero-shift-tap-wake-up)** | **Living Ink Feed Lifecycle & Zero-Shift Tap Wake-Up** | Zero-twitch bubble stability (removed active transform scale and box jump), stationary ink glow aura on tap (`inkGlowRipple`), 1.5s wet ink settling flow and warm pigment bloom on Send (`feedInkSettleWave`, `feedWarmBloom`), and 1.4s living ink wake-up wave inside bubble on tap (`feedInkWakeWave`). | `style.css`, `script.js` |

---

## [Story #13] Android Virtual Keyboard Lifecycle & "Pen Down" Engine

### 1. Context & User Story
* **Statement:** As a mobile texter on Android, I want my pause gaps, ink pools, and hesitation timers to freeze in place when I dismiss Gboard or click away, so that putting my "pen down" preserves living ink dynamics without snapping back to zero or running unbounded timers.
* **GitHub Issue:** #13

### 2. Root Cause Analysis & Problems Solved
* **Android Back-Gesture Focus Retention:** Tapping the Android system Back button dismisses the virtual keyboard (Gboard), but `<textarea>` retains browser focus (`document.activeElement === inputBox`). Standard `blur` listeners fail to detect keyboard closing on mobile devices.
* **Trailing Pause Collapse Bug:** Previously, blurring or closing the keyboard reset `spacePauseAnchorTime = null`. In `buildDraftMessage(false)`, calculating `liveBoundaryMs = (state.spacePauseAnchorTime != null) ? ... : 0` caused the trailing space gap to snap back to `0px` on blur or dismissal, erasing user-generated pause gaps.
* **Touchscreen Tooltip Invisibility:** Mobile touchscreens have no cursor hover. Assigning `stareEl.title = 'Pen down...'` was completely invisible to Android users.
* **Accidental Mobile Line-Wraps:** Leaving a raw $40\text{--}60\text{px}$ whitespace spacer at the end of a sent message caused accidental empty line-wrapping on narrow ($360\text{--}390\text{px}$) Android screens.

### 3. Architectural & Biometric Implementation Details
* **Dynamic Viewport Baseline Tracking:**
  * Implemented `maxObservedViewportHeight` tracking inside `evaluateKeyboardState()`.
  * Virtual keyboard detection evaluates both `isVirtualKeyboardOpen()` (`visualViewport.height < maxObservedViewportHeight * 0.80`) and active input focus, cleanly detecting Gboard show/hide gestures.
* **Persistent Biometric State Accumulators (`state`):**
  * Added `accumulatedStareMs`, `accumulatedSpacePauseMs`, `accumulatedWordHoldMs`, `lastActiveKeyboardTime`, and `keyboardDismissals`.
  * **On Keyboard Dismissal ("Pen Down"):**
    * Active stare delta commits to `accumulatedStareMs`; `lastActiveKeyboardTime` clears to `null`.
    * Space pause delta commits to `accumulatedSpacePauseMs`; `spacePauseAnchorTime` clears to `null`.
    * Word hold delta commits to `accumulatedWordHoldMs`; `lastNonSpaceInputTime` clears to `null`.
    * Increments `state.keyboardDismissals`.
  * **On Keyboard Resumption ("Pen Resumed"):**
    * Anchors re-arm to `performance.now()` without resetting existing accumulated duration, resuming smoothly with zero time skips.
  * **On Input Blur / Keyboard Down:**
    * In `buildDraftMessage()`, live boundary and hold calculations read `state.accumulatedSpacePauseMs` and `state.accumulatedWordHoldMs`, freezing the exact grown pause gap and ink pool on screen.
* **The "Hybrid Lingering Ink Pool":**
  * In sent message mode (`sendNow()`), trailing pause gaps are clamped to a mobile-safe $6\text{--}10\text{px}$ to prevent broken line wrapping, but the physical ink pool bead (`.w-ink-pool`) on the final word is permanently preserved.
  * The full elapsed pause duration is credited directly to the `STARE` hesitation metric in the X-Ray telemetry.
* **Single Source of Truth UI State (`updateHUD`):**
  * `#modeBadge` above the preview card serves as the explicit status banner: displays `PEN DOWN (PAUSED)` in warm amber (`#fbbf24`) when keyboard is down or input is blurred, and `KEYBOARD ACTIVE` (`#38bdf8`) when active.
  * `mStare` renders clean `2.0s ⏸` in dim slate gray (`#94a3b8`) when frozen, returning to bright cyan `2.0s` when typing resumes.
* **Telemetry & Report Integration:**
  * `sendNow()` stores `netActiveStareMs` and `keyboardDismissals` in `state.reportSnapshot` and `state.reportHistory`.
  * `formatReportEntry()` formats `- **Post-Type Stare Hesitation:** X.Xs (N pen-down pauses)`.
  * `makeReport()` strictly reports committed conversation history, ensuring uncommitted drafts remain private.

### 4. Files Touched
* **`script.js`**:
  * `state` definition: Persistent pause and keyboard accumulators.
  * `evaluateKeyboardState()` & `isVirtualKeyboardOpen()`: Android viewport dynamics.
  * `buildDraftMessage()`: Frozen pause and word-hold preservation.
  * `updateHUD()`: Status indicators (`#modeBadge`, `mStare`).
  * `sendNow()`: Finalizing net stare, snapshot telemetry.
  * `makeReport()` & `formatReportEntry()`: Committed conversation diagnostic report.

---

## [Story #14] Self-Hosted Variable Ink Typography & CSS Axis Binding

### 1. Context & User Story
* **Statement:** As a mobile texter on Android, I want my physical typing force and velocity to continuously morph typography weight and slant along a fluid vector axis, so that my messages express living ink dynamics organically without visual lag, abrupt font-weight jumps, or reliance on static system Roboto.
* **GitHub Issue:** #14

### 2. Root Cause Analysis & Problems Solved
* **Static Roboto Discrete Stepping:** On Android, default system Roboto only supports coarse discrete weights (`400`, `700`, `900`). The typography looked digital, rigid, and stepped rather than organic living ink.
* **Box Matrix Distortion vs. Native Glyph Slant:** Velocity was previously simulated via CSS `transform: skewX(-11deg)`. This artificially distorted the rectangular CSS bounding box of letters, leading to clipped glyph terminals and layout jitter.
* **External CDN Latency & FOIT:** External font CDNs introduce $150\text{--}350\text{ms}$ network latency, causing layout shifts (CLS) and invisible text flashes (FOIT) on mobile networks.
* **DOM Thrash on High-Frequency Keystrokes:** Swapping discrete CSS classes (`.w-heavy-force`, `.w-fast-glide`) forced browser style recalculations and layout reflow on every keystroke.

### 3. Architectural & Biometric Implementation Details
* **Zero-Latency Local Variable Asset Delivery:**
  * Bundled Latin-subsetted Recursive Variable Font (`recursive-var.woff2`, ~38 KB) in `fonts/`.
  * Preloaded in `<head>` of `index.html` via `<link rel="preload" as="font" type="font/woff2" crossorigin>` to guarantee 0ms local network availability.
* **Variable Axis Typography (`style.css`):**
  * Declared `@font-face` for `LivingInk` with `font-weight: 300 1000` and `font-style: normal` (and `italic`) so it matches base browser text without silent fallback to system fonts.
  * Bound `.w-token` to continuous CSS custom properties:
    `font-variation-settings: 'wght' var(--ink-weight, 450), 'slnt' var(--ink-slant, 0), 'CASL' var(--ink-casual, 0), 'CRSV' var(--ink-cursive, 0); transition: font-variation-settings 0.08s ease-out;`.
  * Set `font-family: var(--font-living-ink);` globally across the application.
  * Eliminated CSS box skew (`transform: skewX(-11deg)`) in favor of native font glyph slant (`--ink-slant: -12`).
  * Added `.emoji-char` orientation guard (`font-style: normal !important; font-variation-settings: normal !important;`) to protect emojis and system symbols from unintended slant.
* **Continuous Biometric Axis Engine (`script.js`):**
  * Implemented `computeDynamicFontAxes(wordMeta, isBurst, tone)`:
    * **`wght` Axis (300 to 950):** Continuous mapping: $\text{dwell} \in [35\text{ms}, 180\text{ms}] \implies \text{wght} \in [350, 950]$. Firm presses and heavy dwell smoothly push weight up to `850`–`950`.
    * **`slnt` Axis (0° to -14°):** Burst velocity runs dynamically lean glyphs forward to `-12°` (fast glide: `-8°`), Deliberate typing rests at `0°`.
    * **`CASL` & `CRSV` Cursive Axis (0.0 to 1.0):** When tone is `warm` or has stretches, sets `CASL: 1.0` and `CRSV: 1`, physically substituting standard roman letters with handwritten single-story looped `"a"`, looped cursive `"g"`, and calligraphic brush terminals.
  * Implemented `applyWordAxes(element, axes)` for zero-thrash injection directly via `element.style.setProperty(...)`.
* **Continuous Baseline Alignment & Jitter Elimination:**
  * **Zero-Thrash In-Place DOM Mutation (`script.js`):** `renderPreview(true)` now mutates existing live spacers and lingering pool indicators in-place during 100ms clock ticks when text and archetype haven't changed, preventing continuous DOM recreation that previously reset CSS animation timelines at 10Hz.
  * **Typographic Baseline Locking (`style.css`):** Removed vertical `translateY` jumping and character-level vertical offsets from `@keyframes warmJoySpring` and `@keyframes warmLetterBloom`. All words and characters now remain locked to the continuous line baseline, expressing emotional warmth through cursive glyph substitution (`CASL: 1.0`, `CRSV: 1`), whole-line clause tilt (`rotate(-1.74deg)`), and luminous amber-gold breathing bloom without vertical hopping.
* **Tactile Vellum Archetypes & Organic Pigment Diffusion (`style.css`):**
  * **Neon Taming**: Replaced harsh cyberpunk `box-shadow` laser glows with soft, grounded ambient drop shadows (`0 8px 24px -5px rgba(0,0,0,0.65)`) and mineral pigment washes (warm amber-terracotta, deep crimson sumi ink, and watercolor indigo).
  * **Retirement of Cartoon SVGs (`script.js` & `style.css`):** Permanently eliminated cartoon vector stickers (`lightning-svg`, `spark-svg`) and strobe flashing keyframes. Emotion is now expressed purely through graphological truth: heavy pen nib weight (`wght: 900`), compressed tracking, native slant (`--ink-slant: -10`), and calligraphic cursive letterforms (`CASL: 1.0`, `CRSV: 1`).
* **Feed Lifecycle & Resting Ink Architecture (`script.js` & `style.css`):**
  * **Composer vs. Feed State Separation**: Live Composer Preview retains continuous organic living wave animations (`#previewStage`). Sent messages committed to the feed receive `.balloon-settled` and play an arrival settling wave (`feedInkSettleWave 1.5s`) and warm pigment bloom (`feedWarmBloom 1.5s`), settling into permanent resting ink to eliminate infinite animation carnival fatigue in chat history.
  * **Tactile Re-activation on Tap**: Clicking any sent bubble in `#chatFeed` to open the X-Ray drawer wakes the ink with a stationary luminous ink aura (`.ink-pulse` / `inkGlowRipple 1.4s`) and text wake-up wave (`feedInkWakeWave 1.4s`) without moving or jumping the bubble container.

* **Dual Tactile Paper Theme Engine (`index.html`, `style.css`, `script.js`):**
  * **Theme Architecture & 0ms Latency**: Built zero-overhead CSS custom property theme switcher (`body[data-theme="stationery"]` vs. `body[data-theme="journal"]`) persisted in `localStorage`.
  * **📜 Stationery Paper (Light Mode)**: Authentic handmade ivory/cream stationery canvas (`#fbf8f2` / `#f4eee3`), writing card composer with walnut-ink borders, embossed terracotta wax seal send button, and fountain pen ink bubble palettes (midnight sumi, golden amber, botanical indigo).
  * **📓 Midnight Journal (Dark Mode)**: Deep espresso bookbinder cloth & aged leather desk (`#14110f` / `#1a1613`) with antique brass borders and warm vellum writing slate, eliminating all cold pitch-black hacker voids and electric neon halos.
* **Literary Editorial Typography for App Frame (`style.css`):**
  * Pre-installed zero-network literary serif (`"Charter", "Georgia", "Palatino", serif`) for brand masthead ("Resonance v1").
  * Fountain pen gauge styling for HUD telemetry (`font-feature-settings: 'tnum' 1;`) with small-caps graphite labels.
* **Visible Living Wave & Tactile Tap Pulse (`style.css`, `script.js`):**
  * **Living Ink Wave**: In `#previewStage`, `.sentence-line` flows with a continuous, visible sinusoidal wave (`livingInkWave 2.4s`, `translateY(-4.5px)` along the `-1.5°` line tilt), ensuring every word floats together on a single unbroken baseline.
  * **Tactile Tap Wake**: Tapping any sent bubble in `#chatFeed` triggers a zero-movement luminous ink aura (`inkGlowRipple 1.4s`) while the text inside stirs awake with a fluid ripple (`feedInkWakeWave 1.4s`), keeping the bubble box 100% stable without physical shifting or jumping.

### 5. Theme Typography Pairings, High-Contrast Light Paper Ink, and UI Text Trimming

* **Dedicated Non-Bubble UI Typography Pairings (`style.css`):**
  * **📜 Stationery Paper**:
    * Brand Masthead & Modals: Classic letterpress editorial serif (`var(--font-stationery-serif)` = `"Baskerville", "Garamond", "Georgia", "Times New Roman", serif`).
    * App Controls, Buttons, HUD & Metadata: Humanist letterpress sans (`var(--font-stationery-sans)` = `"Optima", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
  * **📓 Midnight Journal**:
    * Brand Masthead & Modals: Antique archival leather-bound book serif (`var(--font-journal-serif)` = `"Book Antiqua", "Palatino Linotype", "Palatino", "Georgia", serif`) in antique gold leaf (`#fef3c7`).
    * App Controls, Buttons, HUD & Metadata: Aged bookbinder engraved serif (`var(--font-journal-label)` = `"Palatino", "Book Antiqua", "Georgia", serif`) in warm brass & ochre tones (`#d4a373` / `#a89f91`).
  * **Living Ink Protection**: Bubble messages, live preview text, and graphological axes strictly retain `'LivingInk'` (`Recursive` variable font) for pure forensic graphology and continuous axis modulation.

* **Light Paper Ink Contrast & Invisibility Fix (`style.css`):**
  * **Root Cause Identified**: `#previewStage .w-token.tone-warm .ink-char` had high ID specificity and executed `@keyframes warmLetterBloom` animating to `#fffbeb` (pure white text), making emotional words (e.g. `"love"`, `"happy"`) invisible on light cream cards (`#fbf7ee`).
  * **Theme-Separated Preview Keyframes**:
    * Created `@keyframes warmLetterBloomPaper` animating between `#92400e` (rich burnt amber) and `#b45309` (deep golden amber ink), guaranteeing crisp 7:1+ contrast on light rag paper.
    * Created `@keyframes warmLetterBloomJournal` animating between `#fde68a` and `#fffbeb` on dark leather vellum.
  * **Full Token Palette Contrast in Stationery Light Mode**:
    * Bound `.w-punch` to deep iron gall fountain pen ink (`#1c1917 !important`).
    * Bound `.w-stretch-warm`, `.w-stretch-tense`, `.w-stretch-sigh`, `.w-stretch-unresolved` to rich pigment inks (`#92400e`, `#9f1239`, `#312e81`, `#292524`).
    * Replaced neon pink deletion scribbles and glowing blue pool dots with authentic iron-gall strike-throughs and sepia ink wells (`#78350f`).

* **Total Cyberpunk Elimination in Midnight Journal (`style.css` & `script.js`):**
  * Replaced glowing electric-blue/purple sent bubbles with antique espresso bookbinder cloth (`linear-gradient(135deg, #2a1f18 0%, #1c140f 100%)`) with hand-rubbed gold leaf borders (`rgba(217, 119, 6, 0.45)`).
  * Replaced cyan LED dots and neon hazard scribbles with antique brass ink drops (`#f59e0b`) and carmine/walnut scratch cross-outs.
  * Replaced hardcoded `#38bdf8` / `#fb7185` neon HUD colors in `script.js` with semantic CSS variables (`var(--hud-text-metric)`, `var(--hud-text-label)`, `var(--hud-accent)`, `var(--hud-alert)`).

* **UI String Trimming across App (`index.html`, `script.js`):**
  * Maintained brand version strictly: `Resonance v1`.
  * Sub-brand trimmed from `Living Ink Messenger · Tap Any Bubble for X-Ray` $\to$ `Living Ink`.
  * Preview title trimmed from `Live Ink Preview` $\to$ `Preview`.
  * Textarea placeholder trimmed to `Write here...`.
  * Empty preview placeholder trimmed to `Ink flows as you write...`.
  * Empty chat feed state trimmed to `No messages yet.`.
  * Telemetry panel sub-titles trimmed to `Edits & Stare` & `Pace & Force`.
  * Telemetry status badges trimmed to clean concise states (`READY`, `TOUCH`, `TYPING`, `PAUSED`).
  * X-Ray pill string trimmed to `🔍 X-Ray: Pace ... · Force ... (wght ..., slnt ...)`.

### 6. Sent Bubble Color Continuity & Universal Contrast Fix

* **Root Cause of Sent Bubble Inversion & Black-on-Black Clash:**
  * **Preview vs. Feed Selector Asymmetry**: In `#previewStage`, bubbles were rendered with base `.balloon-steady` (a light cream `#f7f3ec` card). When sent to `#chatFeed`, messages were wrapped in `.msg-wrap.mine`. The CSS rule `body[data-theme="stationery"] .msg-wrap.mine .balloon-steady` had a legacy override with a jet-black background (`linear-gradient(135deg, #26221f 0%, #171412 100%)`).
  * **The Black-on-Black Clash**: All stationery font colors (including `.sentence-line`, `.w-token.tone-unresolved`, `.w-stretch-unresolved`, and `.w-stretch-warm`) were correctly styled as dark fountain pen inks (`#1c1917`, `#92400e`, `#292524`). Sitting directly atop a `#26221f` jet-black bubble, dark ink text became nearly invisible and completely illegible.
  * **Punctuation Token Glomming**: A phrase typed with ellipses/dots without spaces (e.g. `happppyy..wowww`) previously stayed as a single concatenated token `happppyy..wowww`, failing word normalization and falling back to `.balloon-steady`.

* **The Fixes Applied (`style.css` & `script.js`):**
  * **1. Purged Black Bubbles from Stationery Paper Mode (`style.css`)**:
    * Unified `#previewStage .balloon-steady` and `.msg-wrap.mine .balloon-steady` to the exact same light handmade stationery card with refined warm terracotta deckle border (`background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 55%, #f7f1e4 100%)`, `border: 1.5px solid rgba(194, 65, 12, 0.35)`).
    * Hitting "Send" now produces **zero color jump**; the bubble in the feed looks identical to the bubble in the preview.
    * Every bubble in Stationery Paper is now a light rag surface ($L^* \ge 90\%$) with dark fountain pen ink ($L^* \le 25\%$), ensuring rock-solid $> 10:1$ WCAG AAA contrast.
  * **2. Unified Preview & Feed Contrast in Midnight Journal (`style.css`)**:
    * Unified `#previewStage .balloon-steady` and `.msg-wrap.mine .balloon-steady` to identical dark leather vellum (`linear-gradient(135deg, #2a1f18 0%, #1c140f 100%)`) with hand-rubbed gold leaf borders.
    * Bound all word tokens and sentence lines across feed and preview to luminous gold leaf and ivory inks (`#fef3c7`, `#fde68a`, `#c7d2fe`, `#fecdd3`).
  * **3. Clause & Multi-Dot Tokenizer Defense (`script.js`)**:
    * Updated `tokenize(str)` to split cleanly on multi-dot punctuation boundaries (`replace(/(\.{2,}|[,;:—–]+)/g, '$1 ')`), parsing `happppyy..wowww` into `happppyy..` (warm stretched emotion) and `wowww` (warm stretched expression).
### 7. Tactile Paper Snippets & Micro-Tilt Editorial Architecture (Option A)

* **Design Vision & Zero-Overhead Implementation:**
  * Replaced generic rounded digital pill bubbles (`border-radius: 20px`) with **physical hand-cut paper snippets** without using heavy photorealistic images or degrading 60fps performance (0 KB assets, 0ms latency).
* **Asymmetric Hand-Cut Paper Silhouettes (`style.css`):**
  * **User Slips (`.msg-wrap.mine` & `#previewStage`)**: `border-radius: 4px 16px 2px 14px;` (clean cut top-left, soft folded corner top-right, clean cut bottom-right, gentle bevel bottom-left).
  * **Counterpart Slips (`.msg-wrap.theirs`)**: `border-radius: 16px 4px 14px 2px;` (soft folded corner top-left, clean cut top-right).
  * Preview and feed maintain identical silhouettes, eliminating all visual shape jumping on send.
* **Casual Slip Placement (Micro-Tilt) (`style.css`):**
  * Applied natural, organic slip angles to simulate paper memo placement on a desk:
    * `.msg-wrap.mine`: `transform: rotate(-0.35deg); transform-origin: right bottom;`
    * `.msg-wrap.theirs`: `transform: rotate(0.3deg); transform-origin: left bottom;`
    * `#previewStage .balloon-*`: `transform: rotate(-0.35deg); transform-origin: right bottom;`
* **Cotton Rag Paper & Vellum Surface Depth (300gsm Intaglio Bevels) (`style.css`):**
  * **📜 Stationery Paper**:
    * Warm milled ivory cardstock gradient: `linear-gradient(135deg, #fdfbf7 0%, #f9f5ea 55%, #f1e9d7 100%)`.
    * 300gsm bevel highlight: `inset 0 1px 1px rgba(255, 255, 255, 0.95), inset 0 -1px 1px rgba(120, 53, 15, 0.05)`.
    * Hand-cut deckle border: `1.5px solid rgba(180, 83, 9, 0.28)`.
    * Floating ambient shadow: `0 1px 3px rgba(67, 34, 10, 0.05), 0 6px 18px -4px rgba(67, 34, 10, 0.12)`.
  * **📓 Midnight Journal**:
    * Dark antique calfskin vellum slip: `linear-gradient(135deg, #2c1f17 0%, #1f150f 60%, #150d09 100%)`.
    * Hand-burnished gold foil bevel: `inset 0 1px 1px rgba(254, 243, 199, 0.2), inset 0 -1px 1px rgba(0, 0, 0, 0.5)`.
    * Hand-rubbed gold leaf border: `1.5px solid rgba(217, 119, 6, 0.45)`.
    * Deep archival shadow: `0 2px 6px rgba(0, 0, 0, 0.7), 0 10px 28px -5px rgba(0, 0, 0, 0.88)`.

### 8. Multiline & Android / Desktop Newline Support (and Retired Corner Lift Trial)

* **Retired Corner Lift Trial**: An experimental paper-lift corner curl effect (using a rotated `::before` pseudo-element with angled shadow) was evaluated and completely removed per user feedback due to patchy visual blending. The codebase relies solely on clean, integrated material box-shadows without pseudo-element artifacts.

* **Multiline & Android / Desktop Newline Support (`script.js`, `style.css`):**
  * **Root Cause of Swallowed Newlines**:
    * `tokenize(str)` was splitting on `\s+`, which stripped out all newline characters (`\n`, `\r\n`).
    * On desktop, `onKeydown` was calling `sendNow()` on `Enter && !e.shiftKey`. On Android keyboards, tapping the virtual Enter/Return key sent `e.key === 'Enter'`, triggering an immediate send rather than creating a new line.
    * The balloon DOM appended all tokens into a single horizontal block without line break elements.
  * **The Fixes Applied**:
    * **1. Tokenizer Newline Gap Detection (`extractTokenNewlines` in `script.js`)**: Scans `rawInput` to count exact line breaks (`\n` counts) preceding each word token and trailing newlines at the end of drafts.
    * **2. Multiline DOM Architecture (`createBalloonDOM` in `script.js` & `style.css`)**: Injects `.ink-line-break` elements (`display: block; width: 100%; height: 0; clear: both`) before line-starting words, plus `.ink-empty-line` (`height: 1.15em`) for multiple paragraph enters (`\n\n`).
    * **3. Mobile / Android Keyboard Enter Support (`script.js`)**: Updated `onKeydown` so that when `state.isMobileMode` or mobile/Android user agent is detected, pressing Enter permits native textarea newline insertion without prematurely sending. Sending on mobile is done via the Send button.
    * **4. Desktop Shift+Enter Preservation (`script.js`)**: Desktop users pressing `Shift+Enter` insert a newline into the textarea, accurately previewed in real-time and preserved when sent via `Enter`.
    * **5. Auto-Expanding Textarea Composer (`style.css` & `script.js`)**: The input box dynamically resizes from `38px` up to `115px` (`line-height: 1.42`) as lines are added, resetting back to `38px` on send.

### 9. Comic Emotion Speech Balloon Silhouettes & Dynamic Contours

* **Context & Motivation**:
  * As the user noted: *"and now all bubbls are os same shape bro..not so nice... maybe can u make like how comics use difft bubble shapes for difft emotions..something liek that?"*
  * Previously, every balloon archetype shared an identical static geometry (`border-radius: 4px 14px 2px 10px;`), stripping away visual distinction across emotions.
  * In classic comic book storytelling (Marvel, DC, manga), speech balloons communicate tone through distinctive silhouettes before the reader even reads the text.

* **Comic Archetype Grammar Implemented (`style.css`)**:
  * **1. Comic Joy / Warmth (`.balloon-warm`)**:
    * **Silhouette**: Buoyant, puffy cloud bloom with pillowy curves.
    * **Geometry**: `border-radius: 26px 28px 8px 24px;` (`mine` & preview) / `28px 26px 24px 8px;` (`theirs`).
    * **Kinetic Stance**: Buoyant upward float with `transform: rotate(-0.8deg);` (`mine`) / `rotate(0.8deg);` (`theirs`).
  * **2. Comic Shout / Anger / Tension (`.balloon-urgent`)**:
    * **Silhouette**: Jagged, angular, sheared shout burst box with sharp high-tension bevels.
    * **Geometry**: `border-radius: 2px 24px 2px 22px;` (`mine` & preview) / `24px 2px 22px 2px;` (`theirs`).
    * **Kinetic Stance**: Dynamic forward shear with `transform: skewX(-3.5deg) rotate(0.4deg);` (`mine`) / `skewX(3.5deg) rotate(-0.4deg);` (`theirs`).
  * **3. Comic Whisper / Sadness / Sigh (`.balloon-whisper`)**:
    * **Silhouette**: Drooping dashed whisper balloon sagging downward under emotional gravity.
    * **Geometry**: `border-radius: 20px 20px 6px 32px;` (`mine` & preview) / `20px 20px 32px 6px;` (`theirs`), with `border-style: dashed !important;`.
    * **Kinetic Stance**: Heavy downward sink with `transform: rotate(1.2deg) translateY(1.5px);` (`mine`) / `rotate(-1.2deg) translateY(1.5px);` (`theirs`).
  * **4. Comic Conflict / Mixed Clauses (`.balloon-mixed`)**:
    * **Silhouette**: Split-personality hybrid arc (one side rounded/calm, opposing side sharp/tense).
    * **Geometry**: `border-radius: 28px 3px 6px 24px;` (`mine` & preview) / `3px 28px 24px 6px;` (`theirs`).
    * **Kinetic Stance**: Tilted transitional pause with `transform: rotate(-0.4deg);` (`mine`) / `rotate(0.4deg);` (`theirs`).
  * **5. Comic Steady Dialogue (`.balloon-steady`)**:
    * **Silhouette**: Canonical Golden-Age / Modern-Age comic dialogue oval with directional speech tail anchor.
    * **Geometry**: `border-radius: 18px 18px 4px 18px;` (`mine` & preview) / `18px 18px 18px 4px;` (`theirs`).
    * **Kinetic Stance**: Standard conversational posture with `transform: rotate(-0.35deg);` (`mine`) / `rotate(0.35deg);` (`theirs`).


* **Cross-Theme & Live Preview Preservation**:
  * Removed hardcoded uniform `border-radius` overrides from `body[data-theme="stationery"]` and `body[data-theme="journal"]`, allowing comic silhouettes to apply organically across both themes without losing authentic paper and vellum materials.
  * Cleared uniform overrides from `#previewStage`, enabling the live composer preview card to dynamically morph its silhouette and shear in real-time as the user types.
  * Directional tail anchors point towards bottom-right for the user (`.mine` & `#previewStage`) and bottom-left for conversation counterparts (`.theirs`).

---

### 10. Living Ink Engine: Emotion-Differentiated Wake-Up & Settling Lifecycle
* **Problem & Root Cause**: 
  1. **Uniform Emotion Defect**: Every emotion bubble was triggering the exact same wave animation instead of preserving their distinctive psychological kinetics (e.g. angry electric thunder tremor vs. sad gloomy teardrop sink vs. warm sunlight bloom).
  2. **Last-Message Reanimation Bug**: Clicking the last message in the feed failed to reanimate because `.chat-feed .msg-wrap:last-child ...` had higher CSS specificity (`0-5-0` vs `0-3-0`) and retained `animation-fill-mode: forwards`. The browser permanently froze the last element at its terminal frame, completely overriding `.balloon-settled.ink-pulse`. Clicking the 2nd-to-last message worked only because it was no longer `:last-child`.
  3. **Settled Feed vs. Active Pulse**: After delivery, feed messages must settle to static rest after 1.5s and only stir awake when tapped/clicked.
* **Fix & Architecture Implementation**:
  1. **Elimination of Blocking `:last-child` Specificity**:
     - Completely removed hardcoded `.chat-feed .msg-wrap:last-child` CSS blocks across default, stationery, and journal themes.
     - Unified send arrival and tap-wake lifecycles under `.balloon-settled.ink-pulse`.
     - In `sendNow()`, calls `renderFeed(true)`, which triggers `triggerInkPulse()` on the newly delivered message for 1.45s before settling.
     - Every message in the feed (including the very last one) now reawakens cleanly and immediately whenever tapped, with zero CSS specificity conflicts.
  2. **Distinct Emotion Ink Kinetics (`style.css`)**:
     - **⚡ Angry / Tense / Urgent (`.balloon-urgent`)**:
       - Bubble Aura: Electric high-voltage crimson shockwave (`inkGlowTense`, `inkGlowRipplePaperTense`, `inkGlowRippleJournalTense`).
       - Whole Line: Thunder stress tremor `@keyframes feedTenseThunder` (high-frequency jagged lateral vibration `±3.5px` and dynamic angular shear).
       - Characters: Electric lightning crackle `@keyframes feedTenseCrackle` (staggered high-voltage letter vibration + white/crimson flash).
     - **💧 Sad / Sigh / Gloomy (`.balloon-whisper`)**:
       - Bubble Aura: Melancholic periwinkle/indigo teardrop mist ring (`inkGlowSigh`, `inkGlowRipplePaperSigh`, `inkGlowRippleJournalSigh`).
       - Whole Line: Heavy drooping teardrop sink `@keyframes feedSighGloomySink` (slow downward melt `+5.5px` and softening blur under emotional gravity).
       - Characters: Teardrop weeping condensation `@keyframes feedSighTearWeep` (progressive letter blur, drip, and soft indigo weep).
     - **☀️ Joy / Warmth (`.balloon-warm`)**:
       - Bubble Aura: Glowing honey amber deckle halo (`inkGlowWarm`, `inkGlowRipplePaperWarm`, `inkGlowRippleJournalWarm`).
       - Whole Line: Buoyant floating wave `@keyframes feedWarmWakeWave` (`-5.5px` upward lift).
       - Characters: Liquid sunlight bloom `@keyframes feedWarmWake` (golden amber illumination and radiant text shadow).
     - **🖋️ Steady / Neutral Dialogue (`.balloon-steady`, `.balloon-mixed`)**:
       - Bubble Aura: Refined slate/indigo fountain pen aura (`inkGlowSteady`).
       - Whole Line: Clean fluid undulation `@keyframes feedInkWakeWave`.
       - Characters: Crisp droplet ripple `@keyframes inkCharWave` (`--char-i` progressive delay).
  3. **Strict Separation: Normal Text vs. Emotional Kinetics (`script.js`, `style.css`)**:
     - **Normal / Steady Text (`.balloon-steady`, `tone-unresolved`)**:
       - On Send: Receives `.msg-send-simple` executing `@keyframes simpleMsgSend` (a clean, crisp 0.22s entrance: `translateY(8px)` -> `0`, `opacity: 0` -> `1`).
       - Zero swinging text: `.balloon-steady .sentence-line` and `.balloon-steady .ink-char` have `animation: none !important;` to ensure plain messages remain completely calm and static without unwanted letter undulation.
       - On Tap/Click: Displays a calm, subtle 0.5s focus highlight (`inkGlowSteady`) without disturbing typography.
     - **Emotional Messages (`.balloon-warm`, `.balloon-urgent`, `.balloon-whisper`, `.balloon-mixed`)**:
       - Living ink kinetics and swinging text (thunder tremor, teardrop sink, buoyant bloom) are strictly reserved for messages with verified emotional charge.
       - Executes 1.45s emotional landing kinetics on Send, then settles permanently to rest until tapped.
  4. **Zero Bubble Displacement**:
     - Outer balloon silhouettes stay 100% stationary without jumping or twitching, preserving comic shapes.


