# ✒️ Resonance v1 — Living Ink Messenger

> **Bringing the physical soul, hesitation, and neuromotor truth of handwritten letters back into digital text.**

🔗 **[Try the Live Interactive Web App](https://krishnad456.github.io/resonance/)**  
*(Works natively on Mobile Touchscreens & Desktop Keyboards — Zero installation required)*

---

## 📑 Table of Contents
1. [Part I: The Story & Philosophy (The Layman Guide)](#-part-i-the-story--philosophy-the-layman-guide)
   - [The Lost Soul of Handwritten Letters](#1-the-lost-soul-of-handwritten-letters)
   - [The Problem with Modern Texting](#2-the-problem-with-modern-texting)
   - [How Resonance Translates Human Behavior into "Living Ink"](#3-how-resonance-translates-human-behavior-into-living-ink)
   - [Why Deterministic Physics First? (Why Not "Just Use an LLM/AI"?)](#4-why-deterministic-physics-first-why-not-just-use-an-llmai)
2. [Part II: Technical Architecture, Math & Execution Pipeline](#-part-ii-technical-architecture-math--execution-pipeline)
   - [System Execution Order (The 6-Stage Pipeline)](#1-system-execution-order-the-6-stage-pipeline)
   - [Neuromotor Biometrics & Forensic Graphology Math](#2-neuromotor-biometrics--forensic-graphology-math)
   - [Temporal Ink Mechanics (Pauses, Pools & Chronological Ghosts)](#3-temporal-ink-mechanics-pauses-pools--chronological-ghosts)
   - [Psycholinguistic Algebra (VADER, LIWC & Sentic Vectors)](#4-psycholinguistic-algebra-vader-liwc--sentic-vectors)
   - [Multi-Clause Trajectory & Anti-Cancellation Engine](#5-multi-clause-trajectory--anti-cancellation-engine)
   - [Deterministic Routing Priority Table](#6-deterministic-routing-priority-table)
3. [Part III: Guide for Friends & Testers (How to Try It + Privacy & Safety)](#-part-iii-guide-for-friends--testers-how-to-try-it--privacy--safety)

---

# 📖 Part I: The Story & Philosophy (The Layman Guide)

### 1. The Lost Soul of Handwritten Letters
For centuries, human communication was **physical**. When you received a handwritten letter on unlined paper, you didn't just read the dictionary definitions of the words—you *saw* and *felt* the human nervous system that wrote them:

* **Joy & Excitement:** When someone wrote good news, their hand moved with a light, buoyant energy. Across the page, the entire line of handwriting naturally **climbed upward (`↗`)**.
* **Sadness, Grief & Exhaustion:** When someone was drained or heavy-hearted, psychomotor fatigue took over. Their strokes became slow, separated, and **drooped downward (`↘`)** toward the bottom corner of the page, with the ink fading as hand pressure trailed off.
* **Anger & Tension:** When someone was furious or urgent, forearm muscle tension dug the pen nib hard into the paper fibers—leaving **thick, heavy ink-bleed, sharp forward slashes, and underlined pressure marks**.
* **Hesitation & Second Thoughts:** When someone didn't know what to say, the pen tip rested still on the paper and formed a dark **ink pool**. When they paused to think, they left **wide physical gaps** between words. And when they changed their mind, they left **crossed-out words** on the page—either a **neat single line-through** when calmly fixing a word, or a **frantic, violent scribble** when they desperately wanted to hide what they almost said.

### 2. The Problem with Modern Texting
Today, we communicate faster than ever, but we amputated the physical body from our words.

Whether you type *"I'm fine"* in half a second with a smile on your face, or type *"I'm fine"* after staring at your screen for 6 seconds and frantically backspacing *"I can't do this anymore"*, the person on the other end receives the **exact same sterile, flat rectangle of Helvetica text**. 

Digital messaging strips away **how** something was said, leaving only **what** survived the backspace key. **Resonance** is an experiment built to bring the physical truth of paper letters back into digital chat.

---

### 3. How Resonance Translates Human Behavior into "Living Ink"
As you type inside Resonance, the engine watches the physical rhythm of your fingers and the structure of your words, transforming the message bubble in real time:

| Human Behavior While Typing | What Happens on Real Paper | What Resonance Does to Your Message |
| :--- | :--- | :--- |
| **Typing fast in a smooth burst** | Hand glides with wrist momentum; letters pull closer together and lean forward. | Letters compress tightly (`-0.55px`) and lean into a sleek **`-11°` forward glide**. |
| **Pressing keys hard / tapping phone forcefully** | Nib splits and dumps heavy ink into the paper fibers. | Words swell to **`900` ultra-bold weight** with a glowing ink halo, a bottom pressure underline, and a **thicker bubble border**. |
| **Pausing mid-word** | Pen tip rests on the letter and bleeds a drop of ink. | The word emboldens and drops a glowing **indigo ink pool (`•`)** at its tip. |
| **Hitting `Space` and pausing to think** | Hand moves across the page before writing the next word, leaving a wide gap. | A physical **breathing gap (`PAUSE`)** expands between the words in real time. |
| **Calmly backspacing a word** | Drawing a single neat line through a mistake (`~~word~~`). | Leaves a readable **single strike-through ghost word** before your new word. |
| **Furiously mashing Backspace** | Violently scratching out a word so nobody can read it. | Leaves a **blurred, unreadable crimson scribble redaction** and shakes the preview card. |
| **Shifting emotions mid-paragraph** | First sentence droops in sadness; second sentence climbs in relief. | Renders a **Dual-Tone Conflicted Arc (`🌗`)** where the sad clause tilts downward in indigo and the happy clause climbs upward in gold. |

---

### 4. Why Deterministic Physics First? (Why Not "Just Use an LLM/AI"?)
Whenever people see an emotion-aware app today, the immediate question is: *"Why didn't you just connect it to an LLM API or a sentiment AI model?"*

**Resonance v1 deliberately avoids black-box AI for its core engine** for three reasons:

1. **AI is the "Average of the Internet" — It Misses the Physical Moment:**  
   An LLM only sees the final string of text you submit. If you send `"hey how are you"` after pausing for 1.5 seconds between words and rewriting it three times, a text-only AI stamps it `Neutral Greeting`. It is completely blind to the hesitation, the backspace energy, the keystroke rhythm, and the physical thumb force.
2. **A Fountain Pen Doesn't Need a Cloud GPU:**  
   In the real world, ink reacts to your hand through **deterministic physics**—speed, pressure, time, and gravity. It happens at **0ms latency** on the page in front of you. Resonance replicates that exact immediacy in pure math and browser physics at 60fps.
3. **The Bottom-Up Engineering Roadmap:**  
   My philosophy with Resonance is to **exhaust deterministic math and human biomechanics first (`v1`)**. Once we establish a rock-solid physical foundation—and add personal baseline calibration (`v2`)—we can optionally layer a lightweight local ML/LLM model **on top (`v3`)** strictly as a context helper to catch complex sarcasm or multilingual idioms that pure rules cannot parse.

---

# ⚙️ Part II: Technical Architecture, Math & Execution Pipeline

Resonance is a zero-dependency, single-file client-side engine (`HTML5 + CSS3 + Vanilla ES6`). Every message is evaluated through a strict **6-Stage Deterministic Pipeline**.

### 1. System Execution Order (The 6-Stage Pipeline)
Every keystroke (`input`, `keydown`, `keyup`, `devicemotion`) and the `100ms` stare clock feed into the following evaluation order:

```text
[Stage 1: Raw Biometric Capture]
   ├── Keystroke Flight Time (ITD), Key-Hold Dwell Time (Desktop) & Z-Axis Jolt (Mobile)
   └── Space-Gated Pause Clock, Mid-Word Ink Pool Timer & Debounced Ghost Capture (55ms)
          │
          ▼
[Stage 2: Multi-Clause Segmentation]
   └── Splits text at sentence boundaries (., !, ?, ...) & contrastive pivots (but, however, then, now)
          │
          ▼
[Stage 3: Lexical, Emoji & Speech-Act Extraction]
   ├── Matches emotion roots + morphological prefix inversions (un-, dis-) + laugh regex
   └── Evaluates 10 Speech-Act Meaning Cues (directive-dismissive, urgent-request, apology, etc.)
          │
          ▼
[Stage 4: VADER Heuristics, Negation Scope & LIWC Self-Focus]
   ├── Applies CAPS scalar (1.5x), Degree Boosters (+0.293), Elongation boost, & Pivot weights (0.5x / 1.5x)
   ├── Checks 3-token backward negation + 8-token rhetorical forward negation
   └── Computes LIWC-I pronoun ratio (I, me, my, myself %)
          │
          ▼
[Stage 5: Physics Field & Forensic Graphology Synthesis]
   ├── Computes Net Vertical Vector -> Whole-Line Baseline Inclination Angle (-2.6° to +2.8°)
   ├── Separates Word Velocity (.w-fast-glide) from Word Nib Force (.w-heavy-force)
   └── Scales Bubble Border Thickness (1.5px -> 3.5px) from effective Force
          │
          ▼
[Stage 6: Priority-Locked Archetype Routing]
   └── Routes to: balloon-mixed ➔ balloon-whisper ➔ balloon-urgent ➔ balloon-warm ➔ balloon-steady
```

---

### 2. Neuromotor Biometrics & Forensic Graphology Math

#### A. Inter-Tap Duration (ITD) Quartiles & Quartile Dispersion ($QCD$)
Rather than using simple averages (which are easily skewed by a single thinking pause), Resonance sorts all valid human keystroke intervals ($28\text{ms} \le \Delta t < 1000\text{ms}$) and computes quartiles ($Q_1, Q_2, Q_3$):
* **`MED-ITD` ($Q_2$ — 50th Percentile):** Your baseline typing pace.
* **`Q1-FAST` ($Q_1$ — 25th Percentile):** Your peak burst speed.
* **Quartile Coefficient of Dispersion ($QCD$):** Measures rhythm irregularity/disfluency:
  $$QCD = \frac{Q_3 - Q_1}{Q_3 + Q_1}$$
* **Burst Detection:** Triggered when the user chains **3+ consecutive keystrokes** faster than the device burst threshold ($\Delta t < 68\text{ms}$ on Desktop; $\Delta t < 112\text{ms}$ on Mobile).

#### B. Device-Adaptive Nib Force (`FORCE`)
* **Desktop Hardware Mode:** Measures physical key-hold dwell time ($T_{\text{keyup}} - T_{\text{keydown}}$) exclusively on printable character keys (ignoring `Space`, `Enter`, `Backspace`, and modifiers), capped at `220ms` to filter out key-repeat holds. Evaluated via the **session median/mean** against a desktop heavy threshold of **`128ms`**.
* **Mobile Touchscreen Mode:** Because mobile soft keyboards (Gboard/iOS) sandbox raw touch-pressure radii, Resonance listens to the device's hardware accelerometer (`DeviceMotionEvent`) along the **Z-axis** (perpendicular to the glass). When your thumb strikes the screen or shakes the phone, the frame-to-frame shockwave $\Delta a_z = |a_{z,t} - a_{z,t-1}|$ is mapped into a dwell-equivalent force score:
  $$\text{Force}_{\text{mobile}} = \min\left(300, \max\left(55, \text{round}(62 + 45 \cdot \Delta a_z)\right)\right)$$
  Evaluated via a responsive **4-tap rolling upper-quartile ($Q_3$) window** against a mobile heavy threshold of **`112ms`**.

#### C. Forensic Graphology Separation: Speed vs. Force
Based on forensic document examination principles (Huber & Headrick), **velocity** and **axial pen pressure** produce opposite spatial geometries:
1. **High Velocity (`.w-fast-glide`):** Fast wrist-movement writing pulls letters closer together and tilts axes forward. Words typed below the burst threshold receive **`letter-spacing: -0.55px`**, tighter inter-word margins (`3.8px`), a sleek **`550` weight**, and a **`-11°` forward italic skew**.
2. **High Axial Force (`.w-heavy-force`):** Heavy nib pressure splits the fountain pen tip and dumps ink into paper fibers without necessarily tilting the letters. Words whose peak force crosses the device threshold receive **`900` ultra-bold weight**, a glowing ink-bleed halo, and a **`2px` bottom pressure underline**.
3. **Bubble Border Pressure Scaling:** High message force physically thickens the bubble's outer border from `1.5px` up to `3.5px`:
   $$\text{Border}_{\text{px}} = \min\left(3.5, 1.8 + \frac{\text{Force}_{\text{avg}} - \text{Threshold}_{\text{device}}}{70}\right)$$

---

### 3. Temporal Ink Mechanics (Pauses, Pools & Chronological Ghosts)

* **Mid-Word Ink Pooling (`.w-ink-pool`):** If you pause for **$\ge 800\text{ms}$** while your cursor is still resting on the end of a word (before hitting `Space`), the word emboldens to `800` weight and forms a glowing indigo ink drop (`::after` dot) next to the last letter.
* **Space-Gated Pause Expansion (`PAUSE`):** The between-word pause timer **only starts ticking after you press `Space`**. Once $\Delta t_{\text{space}}$ crosses the pause threshold (`600ms` Desktop / `740ms` Mobile), a visual spacer grows between the words:
  $$\text{Pause}_{\text{px}} = \min\left(60, \max\left(6, \text{round}\left(\frac{\Delta t_{\text{space}}}{100}\right)\right)\right)$$
* **Edit Churn (`CHURN`):** Ratio of total keys pressed to final surviving characters:
  $$\text{Churn} = \frac{K_{\text{total}}}{L_{\text{final}}}$$
  Values $\ge 2.2\times$ flag the delivery as `edited` (guarded self-censorship).
* **Gboard-Safe Chronological Ghost Engine (`BKSP`):**
  * **Auto-Correct Immunity:** Mobile keyboards auto-correct words (e.g., `"dont"` $\rightarrow$ `"don't"`) by firing a rapid whole-word delete followed `2ms` later by an insert. Resonance debounces deletion capture by `55ms` and checks `editDistanceAtMostOne()` so auto-correct expansions never trigger false strikethroughs.
  * **Calm vs. Frantic Classification:** Fewer than 4 backspaces within `650ms` renders a readable single line-through (`.w-cross-single`). **4+ backspaces within `650ms`** (or wiping $\ge 5$ characters at once) triggers `Frantic` mode—upgrading all erased words in the streak to blurred, double-slashed redactions (`.w-cross-scribble`) and shaking the preview card.
  * **Chronological Paper Law:** When backspacing across multiple words right-to-left, full peak word lengths are preserved in left-to-right order and anchored *before* the active cursor slot—ensuring any new text you type always appears **after** the crossed-out words, just like real paper.

---

### 4. Psycholinguistic Algebra (VADER, LIWC & Sentic Vectors)

* **Base Lexical Weights & VADER Modifiers:**
  * Standard emotion root match = **`0.74`** (`0.86` if the word has expressive character elongation like `"sooooo"` or `"happyyy"`).
  * **ALL-CAPS Scalar:** Multiplies word weight by **`1.5x`**.
  * **Degree Boosters & Dampeners:** Preceding intensifiers (`so`, `very`, `really`, `extremely`, `actually`) add **`+0.132`** (`0.293 * 0.45`); dampeners (`kinda`, `sorta`, `slightly`, `barely`) scale weight by **`0.55x`**.
  * **Morphological Prefix Inversion:** Words starting with `un-` or `dis-` attached to a warm root (e.g., `unhappy`, `ungrateful`, `unloved`) automatically invert from `warm` $\rightarrow$ `sigh`.
* **Dual-Direction Negation Scope:**
  1. *Backward Scope (3 tokens):* Checks up to 3 tokens prior for negation operators (`not`, `never`, `dont`, `cant`, `isnt`), stopping at punctuation or contrastive conjunctions. Negating a `warm` word shifts its energy into `sigh` (`+0.68`).
  2. *Rhetorical Forward Scope (8 tokens):* Catches rhetorical questions like *"am i happy? honestly no"* or *"excited? not at all"* by scanning up to 8 tokens ahead across a `?` bridge.
* **LIWC Self-Focus Index (`LIWC-I`):**
  $$\text{LIWC-I} = \text{round}\left(\frac{\text{Count}(\{\text{i, im, i'm, ive, id, ill, me, my, mine, myself}\})}{N_{\text{words}}} \times 100\right)$$
  When $\text{LIWC-I} \ge 20\%$ (`highSelfFocus`) and warmth is low, it adds **`+0.18` downward gravity** to the baseline slope.
* **Speech-Act Meaning Cues:** Evaluates 10 explicit pragmatic intents. Hostile/dismissive commands (`"get lost"`, `"go away"`, `"shut up"`, `"leave me alone"`, `"whatever"`) score `directive-dismissive` (`0.90`) and directly inject **`+0.75` tension** so they route to the urgent lightning archetype even without profanity.

---

### 5. Multi-Clause Trajectory & Anti-Cancellation Engine
In a naive sentiment tool, a sentence with one sad clause and one happy clause cancels out to zero (`-0.80 + 0.80 = 0.00 Neutral`). Resonance prevents cancellation using a **2-Tier Clause Engine**:
1. **Contrastive & Narrative Pivot Weighting:** When a sentence contains a pivot conjunction (`but`, `however`, `tho`, `yet`, `then`, `now`, `finally`, `suddenly`), tokens *before* the pivot are scaled by **`0.5x`** and tokens *after* the pivot are scaled by **`1.5x`** (Kahneman's Peak-End / Recency Rule).
2. **Per-Clause Baseline Inclination (`balloon-mixed`):** If Clause 1 is `sigh` and Clause 2 is `warm` (e.g., *"I was unhappy earlier.. then my mood became happy!"*), the bubble renders the **Dual-Tone Iridescent Arc (`🌗`)**. Inside the bubble, Clause 1 is wrapped in its own `.clause-span` tilted downward (`+2.5°`) in indigo ink, while Clause 2 is wrapped in a second `.clause-span` tilted upward (`-2.2°`) in golden ink.

---

### 6. Deterministic Routing Priority Table

Whole-line baseline inclination is computed from the net vertical affect vector:
$$\text{Tilt}_{\text{deg}} = \text{clamp}\left(-2.6^\circ, +2.8^\circ, (\text{Heaviness} - \text{Warmth} + \text{LIWC}_{\text{gravity}}) \times 2.35\right)$$

The final visual archetype is selected via a strict priority lock:

| Priority | Condition | Visual Archetype | Line Slant & Atmospheric Signature |
| :---: | :--- | :--- | :--- |
| **1** | `hasConflictingArc && clauses >= 2` | `🌗 balloon-mixed` | Per-clause split tilt (`+2.5°` ➔ `-2.2°`), indigo-to-amber gradient |
| **2** | `dominant === 'sigh'` *(or Heaviness $\ge 0.55$)* | `🌙 balloon-whisper` | **`+2.4°` downward droop**, dashed indigo mist, slow weeping ink sink |
| **3** | `dominant === 'tense'` *(or Tension $\ge 0.50$)* | `⚡ balloon-urgent` | **`-8°` forward slash**, crimson cut frame, periodic lightning bolt & snap |
| **4** | `dominant === 'warm'` *(or Warmth $\ge 0.55$)* | `☀️ balloon-warm` | **`-2.1°` upward climb**, golden radiance, `1.35s` buoyant hop & sparks |
| **5** | Default / Unresolved | `⚪ balloon-steady` | **`0.0°` level baseline**, clean indigo/slate glass frame |

---

# 🛡️ Part III: Guide for Friends & Testers (How to Try It + Privacy & Safety)

### 👋 Welcome! What is this Web App?
If someone shared this link with you, you are looking at **Resonance v1**—an experimental chat interface where **the way you type physically changes how your message looks**. 

Instead of sending flat, identical text bubbles, Resonance acts like a digital fountain pen: it reacts to your typing speed, how hard you tap, where you pause to think, and what you backspace.

### 🎮 5 Fun Things to Try Right Now (Takes 30 Seconds)
1. **Watch the Live Preview:** Start typing in the box at the bottom. You’ll see your words come alive inside the **Live Ink Preview** card before you even hit Send.
2. **Test the 3 Core Emotions:**
   * Type *"I am sooooo happy for you!! ✨"* and hit Send $\rightarrow$ Watch the line **climb upward** with floating golden sparks.
   * Type *"I feel so exhausted and sad today..."* and hit Send $\rightarrow$ Watch the line **droop downward** and slowly fade like a heavy sigh.
   * Type *"I am so angry right now"* or *"get lost"* and hit Send $\rightarrow$ Watch the bubble **strike with electric lightning**.
3. **Test the Pause & Ink Pool:** Type a word, **press `Space`**, and wait 2 seconds before typing your next word. Watch a glowing **ink drop** and a physical **breathing gap** grow between your words.
4. **Calm vs. Frantic Backspace:**
   * Type two words, slowly backspace one word, and type a new one $\rightarrow$ You get a neat, readable **single strike-through** (`~~word~~`).
   * Now type a few words and **furiously mash the Backspace key** $\rightarrow$ The word gets violently **scratched out in red** so nobody can read it! *(Tip: You can tap any crossed-out word in the preview box to remove it before sending).*
5. **Tap Any Bubble for "Ink X-Ray":** Tap on any sent message bubble in the chat feed to open its **🔍 Ink X-Ray** and see the exact speed, force, and pause stats that created it. Use the **Alex / Sam** switcher in the top-right corner to roleplay both sides of a conversation!

---

### 🔒 Privacy & Safety Promise (What You Should Know)
Because Resonance measures typing rhythm and device motion, here is the 100% transparent truth about your data and safety:

* **100% Local in Your Browser Tab (Zero Servers):** This website is hosted as a static page on GitHub Pages. There is **no backend server, no database, no analytics tracker, and no cloud API**.
* **Nothing You Type Ever Leaves Your Phone or Laptop:** Every message you type, every word you backspace, and every millisecond of typing speed is calculated **exclusively inside your own browser's temporary memory (RAM)**. Nobody—not even the creator of this repo—can see what you type.
* **Why It Uses Motion Sensors on Mobile:** On phones, the app uses standard browser motion events (`DeviceMotion`) solely to detect how firmly your thumb taps the screen so it can make the ink bolder. That sensor data is processed in a single mathematical formula and immediately discarded.
* **Instant Wipe:** Tapping the **🗑️ (Clear)** button in the top bar—or simply refreshing/closing your browser tab—permanently erases the entire chat session from your screen.
* **Diagnostic Report (`📋`) is Manual-Only:** The `📋` button in the top bar copies a text summary of the session's math to *your own clipboard* only if you explicitly click it (useful if you want to paste your test results back to the developer).
