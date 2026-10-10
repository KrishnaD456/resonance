# 📐 Resonance — Engineering Guidelines & Architectural Vision

> **Living Forensic & Biometric Ink Messenger**  
> *Core engineering practices, architectural invariants, code quality standards, and collaboration protocols for developers and AI agents.*

---

## 1. Architectural Vision & Product Philosophy

1. **Deterministic Physics Over Black-Box AI:**
   * Resonance replicates the physical truth of paper, ink, and muscle tension at **0ms latency** at 60fps.
   * All biometric and psycholinguistic modeling is deterministic, inspectable, and mathematical. Never introduce non-deterministic or remote cloud LLM calls for core rendering.
2. **Local-First & Zero-Network Runtime:**
   * The app must function entirely offline once loaded. Zero external CDNs (no Google Fonts, unpkg, or third-party stylesheets) are permitted in production paths.
   * Assets must be bundled locally and preloaded to prevent visual layout shifts (CLS) and flashes of unstyled content (FOIT/FOUT).
3. **Continuous Modulation Over Discrete States:**
   * Ink in the real world behaves as an analog continuum.
   * Favor continuous variable font axes (`wght`, `slnt`, `CASL`), fluid CSS custom properties, and fine-grained math over coarse stepped states or binary CSS classes.

---

## 2. Platform & Hardware Principles: Mobile-First

Resonance is engineered **Mobile Android First**. Desktop is an ancillary testing harness.

1. **Touch-First Ergonomics:**
   * Touchscreens lack mouse hover. Never design critical feedback or diagnostics that rely on hover states, tooltips, or cursor interactions.
   * All states, timers, and alerts must be visibly present in the DOM layout.
2. **Virtual Keyboard & Viewport Resilience:**
   * Mobile screen real estate is dynamic. Design layouts to handle on-screen keyboard animations, interactive-widget resizing, and mobile gesture navigation smoothly without layout thrashing.
3. **Screen Density & Text Wrapping Defense:**
   * Account for small viewports ($360\text{--}390\text{px}$ width). Word tokens, line tilts, and dynamic spaces must remain legible and never cause accidental empty line-wrapping.

---

## 3. Code Quality & Engineering Best Practices

1. **DOM Performance & Layout Reflow Minimization:**
   * Mutate CSS custom properties directly on element style objects (`element.style.setProperty(...)`) during live keystrokes.
   * Avoid rebuilding entire DOM subtrees on high-frequency events (`input`, `keyup`, 60fps RAF loops).
   * Use hardware-accelerated transforms (`transform`, `opacity`, `font-variation-settings`) rather than triggering geometry reflow (`top`, `left`, `width`).
2. **Immutable Forensic Biometrics:**
   * Raw hardware timestamps (`keyTimes`, `dwellTimes`, `flightTimes`, pressure) are immutable forensic truth. Never mutate or falsify biometric samples.
   * Derived metrics (moving averages, quartiles, churn ratios) must be computed cleanly from the raw arrays.
3. **Defensive Fallbacks:**
   * Always provide robust fallback stacks (e.g. system sans-serif fallback if variable font fails to load).
   * Ensure non-alphabetic glyphs (emojis, mathematical symbols, punctuation) are isolated and protected from unnatural slant or weight distortions.

---

## 4. Developer & AI Collaboration Protocol

1. **Explicit Plan Approval Before Editing Code:**
   * **Never modify code files (`.js`, `.css`, `.html`) directly without proposing a plan and receiving explicit confirmation from the user.**
   * Present the architectural tradeoffs, mathematical formulas, and edge cases first.
2. **Pure Copy-Paste Markdown Format:**
   * All GitHub User Stories, Epics, PR descriptions, and issue bodies must be output as pure, copy-paste ready Markdown without conversational filler or chat wrappers.
3. **Story Traceability Tags:**
   * Tag every new function, CSS selector, or key logic block with the active story tag:
     ```javascript
     // [Story #XX]: Description of intent and rationale
     ```
4. **Append-Only Development Log (`DEVELOPMENT_LOG.md`):**
   * Keep `DEVELOPMENT_LOG.md` updated as stories are completed.
   * Maintain the two-tier structure:
     1. **Executive Index Table** at the top for fast scanning.
     2. **Deep Architectural Record** below for complete context retention.
   * Only document completed, merged work. Do not include future backlogs or roadmaps.
