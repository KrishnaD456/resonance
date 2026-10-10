'use strict';

                                                                    /**
 * DEVELOPMENT & STORY HISTORY:
 * See DEVELOPMENT_LOG.md for architectural decision records.
 * Active Story Traceability:
 *  - [Story #13]: Android Virtual Keyboard Lifecycle & "Pen Down" Engine
 *  - [Story #14]: Self-Hosted Variable Ink Typography & CSS Axis Binding
 */

/**
 * ============================================================================
 * RESONANCE v1 - LIVING INK MESSENGER
 * Architecture: High-Performance Single-Bundle Modular Engine
 *
 * TABLE OF CONTENTS & DOMAIN HELPER NAMESPACES:
 *  1. CONFIGURATION & LEXICONS
 *  2. DOM ELEMENTS & RUNTIME STATE
 *  3. HARDWARE & BIOMETRIC THRESHOLDS       -> DeviceHelper
 *  4. TEXT PROCESSING & TOKEN UTILITIES      -> TextHelper
 *  5. NLP & EMOTION SCORING ENGINE           -> SentimentHelper
 *  6. PHYSICAL BIOMETRICS & TELEMETRY ENGINE -> BiometricsHelper
 *  7. INK VISUALIZATION & BUBBLE RENDERING   -> (Rendering primitives)
 *  8. FEED RENDERING & DELETION TRACES       -> UIHelper
 *  9. HARDWARE SENSORS & INPUT EVENT LISTENERS
 * 10. UI CONTROLS, DIAGNOSTICS & INIT        -> DiagnosticHelper / Helper
 *
 * CALLING CONVENTION:
 * You can call methods directly, via domain helpers (e.g. TextHelper.tokenize),
 * or via the master registry (e.g. Helper.text.tokenize, Helper.device.triggerHaptic).
 *
 * TIP: In VS Code, press Ctrl + K, then Ctrl + 0 to collapse all regions,
 * or click the fold arrows in the gutter to navigate each module.
 * ============================================================================
 */

// ============================================================================
//#region 1. CONFIGURATION & LEXICONS
// ============================================================================

const CONFIG = Object.freeze({
  churnThreshold: 2.2,
  stareThresholdMs: 3000,
  desktopBurstMs: 68,
  mobileBurstMs: 112,
  burstRunLength: 3,
  desktopPauseMs: 600,
  mobilePauseMs: 740,
  minHumanTapDeltaMs: 28,
  franticBackspaceWindowMs: 650,
  franticBackspaceMinCount: 4,
  poolDelayMs: 800,
  scopeTokens: 3,
  rhetoricalScopeTokens: 8,
  vaderCapsScalar: 1.5,
  vaderBoosterDelta: 0.293,
  vaderExclamDelta: 0.292,
  vaderBeforeButWeight: 0.5,
  vaderAfterButWeight: 1.5,
  desktopHeavyDwellMs: 128,
  mobileHeavyDwellMs: 112,
  lightDwellMs: 74,
  desktopFastFlightMs: 78,
  mobileFastFlightMs: 120,
  desktopSlowFlightMs: 165,
  mobileSlowFlightMs: 220
});

const NEGATION_SET = new Set([
  'not','no','never','none','without','cant','wont','dont','isnt','arent','wasnt','werent','nah','nope','aint','neither','nor','wouldnt','couldnt','shouldnt'
]);
const INTENSIFIER_SET = new Set(['soo','so','very','really','too','way','super','extremely','totally','completely','hella','crazy','crazily','actually','truly','deeply']);
const DAMPENER_SET = new Set(['kinda','kindof','sorta','barely','hardly','slightly','little','bit']);
const CONTRASTIVE_CONJUNCTIONS = new Set(['but','however','except','although','though','tho','yet','still','then','now','suddenly','finally','eventually','luckily','thankfully','instead']);
const FIRST_PERSON_PRONOUNS = new Set(['i','im',"i'm",'ive',"i've",'id',"i'd",'ill',"i'll",'me','my','mine','myself']);
const PRONOUN_OBJECT_SET = new Set(['you','u','ya','me','him','her','them','us','this','that','it','everyone','everybody']);

const NEUTRAL_COLLISION_GUARD = new Set([
  'think','thinking','thinks','thing','things','than','thin','thick',
  'happen','happens','happened','happening','happyness',
  'live','lives','lived','living','move','moved','gave','save','saved','have','wave',
  'same','came','name','game','tame','frame',
  'hear','near','dear','year','clear','wear','bear','tear','gear','pear',
  'part','parts','cart','dart','start','smart','chart',
  'word','words','work','works','worked','world','worm','worn',
  'food','mood','wood','hood','stood',
  'head','read','lead','dead','bead',
  'hand','land','sand','band','stand',
  'last','fast','past','cast','vast','mast',
  'lost','most','post','cost','host',
  'fall','falls','falling','fell','fallen','call','called','calling','wall','tall','hall','ball','mall',
  'watt','what','wait','want','went','sent','bent','rent','tent',
  'hat','hats','mat','rat','bat','cat','fat','sat','pat','vat',
  'had','has','his','her','him','how','who','why','now','new','tes','do','doo','dooo','became','become'
]);

const NATURAL_DOUBLE_ENDINGS = new Set([
  'all','ball','call','fall','hall','mall','tall','wall','small','stall','shall',
  'bell','cell','fell','hell','sell','tell','well','yell','spell','smell','shell','dwell','swell',
  'bill','fill','hill','kill','mill','pill','still','will','chill','drill','grill','skill','spill','thrill',
  'doll','roll','toll','poll','scroll','stroll',
  'bull','full','pull','dull','hull','skull','null',
  'off','cuff','buff','puff','stuff','bluff','fluff','scuff','stiff','cliff','sniff','whiff',
  'add','odd','egg','inn','err','purr','blur',
  'ass','bass','class','glass','grass','mass','pass','brass',
  'less','mess','bless','chess','dress','guess','press','stress','confess','express','impress','depress','obsess','possess','princess','success','unless',
  'his','kiss','miss','bliss','swiss','dismiss',
  'boss','cross','loss','moss','toss','floss','gloss','across',
  'bus','fuss','plus','thus','discuss',
  'bee','fee','free','knee','see','tree','three','agree','degree','flee','glee',
  'too','zoo','boo','goo','moo','woo','shoo','tattoo','igloo','bamboo','shampoo','kangaroo',
  'butt','mutt','putt','buzz','fuzz','jazz','fizz','quiz'
]);

const EMOTION_ROOTS = Object.freeze({
  warm: new Set([
    'happy','happier','happiest','glad','love','loved','loving','lovely','loveliest','yay','excited','exciting','joy','joyful',
    'good','great','awesome','nice','sweet','fun','thank','thanks','wow','woah',
    'grateful','proud','relieved','relief','haha','lol','hehe','lmao','aha','blessed','thrilled','smooth','smoothly','wonderful','amazing'
  ]),
  tense: new Set([
    'angry','anger','mad','furious','annoy','annoyed','annoying','hate',
    'hated','frustrat','frustrated','frustrating','ugh','wtf','wth','serious','seriously',
    'worst','upset','rage','raging','hostile','fuming','livid','ridiculous','outrageous','terrible','pissed'
  ]),
  sigh: new Set([
    'sad','sadder','saddest','unhappy','miserable','gloomy','heartbroken','devastated','down','low',
    'sorrow','hurt','hurting','lonely','alone','miss','missing','tired','exhaust',
    'exhausted','drained','drain','overwhelm','overwhelmed','rough','hard',
    'bad','awful','horrible','cry','crying','tears','depressed',
    'worry','worried','worrying','worreid','anxious','anxiety','scared','afraid',
    'fail','failed','failing','lost','broken','hopeless','helpless','stressed','stress',
    'pain','pained','regret','ashamed','guilty','disappointed','disappoint','unloved','ungrateful'
  ])
});
//#endregion 1. CONFIGURATION & LEXICONS

// ============================================================================
//#region 2. DOM ELEMENTS & RUNTIME STATE
// ============================================================================

function byId(id) {
  return document.getElementById(id);
}

const chatFeed = byId('chatFeed');
const inputBox = byId('inputBox');
const previewStage = byId('previewStage');
const previewTitle = byId('previewTitle');
const previewCard = byId('previewCard');
const pulseFill = byId('pulseFill');
const toast = byId('toast');

// ============================================================
// TEST ENVIRONMENT BADGE
// ============================================================
if (window.location.pathname.includes('/test')) {
  const topBar = document.querySelector('.top-bar');
  const brand = document.querySelector('.brand');
  
  if (brand) brand.textContent = 'Resonance v1 [Test]';
  if (topBar) topBar.style.borderBottomColor = '#fbbf24'; // Gold / var(--amber)
}
// ============================================================

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

const state = {
  isMobileMode: isTouchDevice,
  hudCollapsed: false,
  totalKeys: 0,
  keyTimes: [],
  dwellTimes: [],
  flightTimes: [],
  activeKeyDowns: {},
  lastKeyUpTime: null,
  lastZAccel: null,
  recentMotionJolt: 0,
  lastHapticTime: 0,
  backspaceTimes: [],
  lastBackspaceActionTime: null,
  franticStreakActive: false,
  hapticPoolFiredForSlot: {},
  deletionCheckTimer: null,
  lastInputTime: null,
  lastKeyTime: null,
  firstKeyTime: null,
  lastNonSpaceInputTime: null,
  spacePauseAnchorTime: null,
  accumulatedSpacePauseMs: 0,
  accumulatedWordHoldMs: 0,
  lastInputLength: 0,
  sendPressTime: null,
  sendPressure: 0,
  stareMs: 0,
  isKeyboardOpen: false,
  accumulatedStareMs: 0,
  lastActiveKeyboardTime: null,
  keyboardDismissals: 0,
  maxBurstMs: Infinity,
  prevTokenCount: 0,
  peakWordsBySlot: [],
  ghostsAtSlot: {},
  wordMeta: {},
  pauseGapsBySlot: {},
  lockedPauseBySlot: {},
  livePendingPauseMs: 0,
  lastPreviewRenderedText: null,
  lastPreviewArchetype: null,
  pauseTimer: null,
  stareTimer: null,
  reportSnapshot: null,
  reportHistory: []
};
//#endregion 2. DOM ELEMENTS & RUNTIME STATE

// ============================================================================
//#region 3. HARDWARE & BIOMETRIC THRESHOLDS
// ============================================================================

function triggerHaptic(pattern, forceImmediate) {
  try {
    if (!navigator.vibrate) return;
    const now = performance.now();
    if (!forceImmediate && (now - state.lastHapticTime) < 45) return;
    state.lastHapticTime = now;
    navigator.vibrate(pattern);
  } catch (e) {}
}

function triggerPreviewCardShake() {
  if (!previewCard) return;
  previewCard.classList.remove('preview-shake');
  void previewCard.offsetWidth;
  previewCard.classList.add('preview-shake');
}

function activeBurstThreshold() {
  return state.isMobileMode ? CONFIG.mobileBurstMs : CONFIG.desktopBurstMs;
}

function activePauseThreshold() {
  return state.isMobileMode ? CONFIG.mobilePauseMs : CONFIG.desktopPauseMs;
}

function activeFastFlightThreshold() {
  return state.isMobileMode ? CONFIG.mobileFastFlightMs : CONFIG.desktopFastFlightMs;
}

function activeSlowFlightThreshold() {
  return state.isMobileMode ? CONFIG.mobileSlowFlightMs : CONFIG.desktopSlowFlightMs;
}

/*
 * Device-Specific Heavy Force Threshold:
 * - Mobile (112ms): sensitive to thumb-strike & phone accelerometer jolts.
 * - Desktop (128ms): prevents normal 85ms-115ms mechanical key-holds from false-triggering Heavy Force.
 */
function activeHeavyDwellThreshold() {
  return state.isMobileMode ? CONFIG.mobileHeavyDwellMs : CONFIG.desktopHeavyDwellMs;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
}

const DeviceHelper = Object.freeze({
  triggerHaptic,
  triggerPreviewCardShake,
  activeBurstThreshold,
  activePauseThreshold,
  activeFastFlightThreshold,
  activeSlowFlightThreshold,
  activeHeavyDwellThreshold,
  clamp01
});
//#endregion 3. HARDWARE & BIOMETRIC THRESHOLDS

// ============================================================================
//#region 4. TEXT PROCESSING & TOKEN UTILITIES
// ============================================================================

function splitGraphemes(str) {
  const s = String(str || '');
  if (!s) return [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(seg.segment(s), function(x) { return x.segment; });
  }
  return Array.from(s);
}

function tokenize(str) {
  const t = String(str || '').trim();
  if (!t) return [];
  return t.replace(/(\.{2,}|[,;:—–]+)/g, '$1 ').split(/\s+/).filter(Boolean);
}

function extractTokenNewlines(rawInput, tokens) {
  const raw = String(rawInput || '');
  const newlinesBefore = [];
  let searchIdx = 0;
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const foundIdx = raw.indexOf(tok, searchIdx);
    if (foundIdx === -1) {
      newlinesBefore.push(0);
      continue;
    }
    const gap = raw.slice(searchIdx, foundIdx);
    const nlCount = (gap.match(/\n/g) || []).length;
    newlinesBefore.push(nlCount);
    searchIdx = foundIdx + tok.length;
  }
  const trailingGap = raw.slice(searchIdx);
  const trailingNewlines = (trailingGap.match(/\n/g) || []).length;
  return { newlinesBefore: newlinesBefore, trailingNewlines: trailingNewlines };
}

function expandSubTokens(rawStr) {
  const spaced = String(rawStr || '')
    .replace(/([?!]+)/g, ' $1 ')
    .replace(/\.{2,}|[,;:—–\-/\\]+/g, ' ')
    .trim();
  return spaced ? spaced.split(/\s+/) : [];
}

function normalizeToken(token) {
  return String(token || '').toLowerCase().replace(/[^a-z]/g, '');
}

function normalizeSentence(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\.{2,}|[,;:—–\-/\\]+/g, ' ')
    .replace(/[^a-z0-9'?!\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collapseRepeatedLetters(token) {
  return normalizeToken(token).replace(/(.)\1+/g, function(m, ch) { return ch; });
}

function semanticRootCandidates(token) {
  const norm = normalizeToken(token);
  if (!norm) return [];

  function trimExpressiveTail(s) {
    if (s.length >= 3 && !NATURAL_DOUBLE_ENDINGS.has(s)) {
      const last = s.charAt(s.length - 1);
      const prev = s.charAt(s.length - 2);
      if (last === prev && 'yuiadhnrmog'.indexOf(last) !== -1) {
        return s.slice(0, -1);
      }
    }
    return s;
  }

  const singleCollapse = trimExpressiveTail(norm.replace(/(.)\1{2,}/g, function(m, ch) { return ch; }));
  const doubleCollapse = trimExpressiveTail(norm.replace(/(.)\1{2,}/g, function(m, ch) { return ch + ch; }));
  const fullSingle = norm.replace(/(.)\1+/g, function(m, ch) { return ch; });

  const list = [singleCollapse];
  if (doubleCollapse !== singleCollapse) list.push(doubleCollapse);
  if (fullSingle !== singleCollapse && fullSingle !== doubleCollapse) list.push(fullSingle);

  // [Story #14]: Adverb/adjective suffix stripping (-ly) to prevent Levenshtein typo collision
  if (singleCollapse.endsWith('ly') && singleCollapse.length >= 5) {
    const stem = singleCollapse.slice(0, -2);
    if (list.indexOf(stem) === -1) list.push(stem);
    const eStem = stem + 'e';
    if (list.indexOf(eStem) === -1) list.push(eStem);
  }
  return list;
}

function semanticSemanticRoot(token) {
  const cands = semanticRootCandidates(token);
  return cands.length ? cands[0] : '';
}

function endsWithSpace(str) {
  return str.length > 0 && /\s/.test(str.charAt(str.length - 1));
}

function endsWithSentencePunct(str) {
  const s = String(str || '');
  if (!s) return false;
  const last = s.charAt(s.length - 1);
  return last === '.' || last === '!' || last === '?';
}

function isWordAllCaps(rawToken) {
  const letters = String(rawToken || '').match(/[A-Za-z]/g) || [];
  if (letters.length < 2) return false;
  const upper = String(rawToken || '').match(/[A-Z]/g) || [];
  return upper.length === letters.length;
}

function editDistanceAtMostOne(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  if (i < a.length || j < b.length) edits++;
  return edits <= 1;
}

function isAutocorrectExpansion(newWord, oldWord) {
  const normNew = normalizeToken(newWord);
  const normOld = normalizeToken(oldWord);
  if (!normNew || !normOld) return false;
  if (normNew === normOld) return true;
  if (newWord.length >= oldWord.length && normNew.length >= 3 && normOld.length >= 3 && editDistanceAtMostOne(normNew, normOld)) {
    return true;
  }
  return false;
}

const EMOJI_FAMILIES = Object.freeze({
  warm: ['😊','😄','😁','🥰','😍','❤️','❤','💕','💖','💗','💛','💞','😂','🤣','😆','🥳','✨','🙌','😌','😘','😚','🫶'],
  tense: ['😡','🤬','😠','😤','💢','👿','🙄'],
  sigh: ['😔','😞','😢','😭','🥺','😥','😓','💔','😩','😫','😪','😮‍💨','🫠']
});

function findEmojiSignals(rawText) {
  const hits = [];
  for (const [family, emojis] of Object.entries(EMOJI_FAMILIES)) {
    for (const emoji of emojis) {
      if (rawText.includes(emoji)) hits.push({ family: family, token: emoji, emoji: true, negated: false });
    }
  }
  return hits;
}

function isNegationOperator(token) {
  const n = normalizeToken(token);
  if (NEGATION_SET.has(n)) return true;
  return n.length >= 3 && (n.endsWith('nt') || n.endsWith('not'));
}

function isIntensifierOperator(token) {
  return INTENSIFIER_SET.has(collapseRepeatedLetters(token)) || INTENSIFIER_SET.has(semanticSemanticRoot(token));
}

function isDampenerOperator(token) {
  return DAMPENER_SET.has(collapseRepeatedLetters(token));
}

function computeLiwcMetrics(rawOrTokens) {
  const rawStr = Array.isArray(rawOrTokens) ? rawOrTokens.join(' ') : String(rawOrTokens || '');
  const subTokens = expandSubTokens(rawStr).filter(function(t) { return /[a-zA-Z]/.test(t); });
  if (!subTokens.length) return { firstPersonCount: 0, ratio: 0, pct: 0, highSelfFocus: false };
  let count = 0;
  subTokens.forEach(function(t) {
    const clean = String(t || '').toLowerCase().replace(/[^a-z']/g, '');
    const norm = normalizeToken(t);
    if (FIRST_PERSON_PRONOUNS.has(clean) || FIRST_PERSON_PRONOUNS.has(norm)) {
      count++;
    }
  });
  const ratio = count / subTokens.length;
  return {
    firstPersonCount: count,
    ratio: ratio,
    pct: Math.round(ratio * 100),
    highSelfFocus: ratio >= 0.20 && count >= 1
  };
}

const TextHelper = Object.freeze({
  splitGraphemes,
  tokenize,
  extractTokenNewlines,
  expandSubTokens,
  normalizeToken,
  normalizeSentence,
  collapseRepeatedLetters,
  semanticRootCandidates,
  semanticSemanticRoot,
  endsWithSpace,
  endsWithSentencePunct,
  isWordAllCaps,
  editDistanceAtMostOne,
  isAutocorrectExpansion,
  findEmojiSignals,
  isNegationOperator,
  isIntensifierOperator,
  isDampenerOperator,
  computeLiwcMetrics
});
//#endregion 4. TEXT PROCESSING & TOKEN UTILITIES

// ============================================================================
//#region 5. NLP & EMOTION SCORING ENGINE
// ============================================================================

function isTokenNegated(subTokens, index, fullSentenceLower) {
  if (/\b(nothing|nthng|nobody|no one)\b.*\b(wouldnt|woulndnt|would not|wont|cant)\b/.test(fullSentenceLower)) {
    return false;
  }

  const scopeStart = Math.max(0, index - CONFIG.scopeTokens);
  for (let b = index - 1; b >= scopeStart; b--) {
    const bt = subTokens[b];
    if (/[?!]/.test(bt)) break;
    if (CONTRASTIVE_CONJUNCTIONS.has(normalizeToken(bt))) break;
    if (isNegationOperator(bt) && !isIntensifierOperator(bt)) return true;
  }

  const forwardSlice = subTokens.slice(index + 1, index + 1 + CONFIG.rhetoricalScopeTokens);
  const forwardNorm = forwardSlice.map(normalizeToken).filter(Boolean);
  if (!forwardNorm.length) return false;

  const forwardJoined = forwardNorm.join(' ');
  if (/\b(not at all|at all no|not really|not even|of course not|definitely not|absolutely not)\b/.test(forwardJoined)) {
    return true;
  }

  const hasQuestionBridge = subTokens.slice(index, index + 4).some(function(t) { return t.indexOf('?') !== -1; });
  if (hasQuestionBridge && forwardNorm.some(function(w) { return NEGATION_SET.has(w) || isNegationOperator(w); })) {
    return true;
  }
  return false;
}

function isLaughExpression(norm) {
  if (!norm || norm.length < 3) return false;
  if (/^(h+a+)+h*$/.test(norm) && norm.indexOf('h') !== -1 && norm.indexOf('a') !== -1) return true;
  if (/^(h+e+)+h*$/.test(norm) && norm !== 'he' && norm !== 'hee') return true;
  if (/^(l+o+l+)+o*$/.test(norm)) return true;
  return false;
}

function matchEmotionFamily(rawToken, nextTokenNorm) {
  const tokenEmojis = findEmojiSignals(rawToken);
  if (tokenEmojis.length) return tokenEmojis[0].family;

  const exactNorm = normalizeToken(rawToken);
  if (!exactNorm) return null;

  if (isLaughExpression(exactNorm)) return 'warm';

  if (exactNorm === 'hat' && nextTokenNorm && PRONOUN_OBJECT_SET.has(nextTokenNorm)) {
    return 'tense';
  }

  if (NEUTRAL_COLLISION_GUARD.has(exactNorm)) return null;

  const candidates = semanticRootCandidates(rawToken);

  for (let c = 0; c < candidates.length; c++) {
    const cand = candidates[c];
    if (NEUTRAL_COLLISION_GUARD.has(cand)) return null;
    if (cand.length >= 5 && (cand.indexOf('un') === 0 || cand.indexOf('dis') === 0)) {
      const stripped = cand.indexOf('un') === 0 ? cand.slice(2) : cand.slice(3);
      if (EMOTION_ROOTS.warm.has(stripped)) return 'sigh';
    }
  }

  for (let c = 0; c < candidates.length; c++) {
    const root = candidates[c];
    if (!root || NEUTRAL_COLLISION_GUARD.has(root)) continue;

    for (const [candidate, roots] of Object.entries(EMOTION_ROOTS)) {
      if (roots.has(exactNorm) || roots.has(root)) return candidate;
      for (const r of roots) {
        if (root.length >= 5 && r.length >= 5 && root.length <= r.length + 2 && root.startsWith(r)) {
          return candidate;
        }
      }
    }

    if (root.length >= 5) {
      for (const [candidate, roots] of Object.entries(EMOTION_ROOTS)) {
        for (const r of roots) {
          if (r.length >= 5 && root.charAt(0) === r.charAt(0) && editDistanceAtMostOne(root, r)) {
            return candidate;
          }
        }
      }
    }
  }

  return null;
}

function analyzeClauses(tokens, rawText) {
  const fullLower = normalizeSentence(rawText);
  const clauses = [];
  let currentIndices = [];

  tokens.forEach(function(tok, idx) {
    const subParts = expandSubTokens(tok);
    const hasInternalPivot = subParts.length > 1 && subParts.slice(1).some(function(sp) {
      return CONTRASTIVE_CONJUNCTIONS.has(normalizeToken(sp));
    });
    const startsWithPivot = subParts.length > 0 && CONTRASTIVE_CONJUNCTIONS.has(normalizeToken(subParts[0]));

    if (startsWithPivot && currentIndices.length > 0) {
      clauses.push({ indices: currentIndices.slice(), isPostPivot: true });
      currentIndices = [idx];
    } else if (hasInternalPivot) {
      currentIndices.push(idx);
      clauses.push({ indices: currentIndices.slice(), isPostPivot: false });
      currentIndices = [];
    } else {
      currentIndices.push(idx);
      if ((endsWithSentencePunct(tok) || /\.{2,}/.test(tok)) && idx < tokens.length - 1) {
        clauses.push({ indices: currentIndices.slice(), isPostPivot: false });
        currentIndices = [];
      }
    }
  });
  if (currentIndices.length > 0) {
    clauses.push({ indices: currentIndices.slice(), isPostPivot: clauses.length > 0 });
  }

  const wordClauseMap = {};
  const clauseSummaries = [];

  clauses.forEach(function(cl, cIdx) {
    const clauseTokens = cl.indices.map(function(i) { return tokens[i]; });
    const clauseRaw = clauseTokens.join(' ');
    const subTokens = expandSubTokens(clauseRaw);
    const scores = { warm: 0, tense: 0, sigh: 0 };

    subTokens.forEach(function(st, sIdx) {
      const nextNorm = normalizeToken(subTokens[sIdx + 1] || '');
      const fam = matchEmotionFamily(st, nextNorm);
      if (!fam) return;
      const neg = isTokenNegated(subTokens, sIdx, fullLower);
      const w = hasLetterStretch(st) ? 0.86 : 0.74;
      if (neg) {
        if (fam === 'warm') scores.sigh = clamp01(scores.sigh + 0.68);
      } else {
        scores[fam] = clamp01(scores[fam] + w);
      }
    });

    const clauseEmojis = findEmojiSignals(clauseRaw);
    clauseEmojis.forEach(function(e) {
      scores[e.family] = clamp01(scores[e.family] + 0.72);
    });

    const sorted = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
    const topFam = sorted[0][1] >= 0.50 ? sorted[0][0] : 'unresolved';

    let localPhysics = null;
    if (topFam === 'warm') {
      localPhysics = { lineTiltDeg: -2.2, waveAmp: 0.75, jitterPx: 0, slantDeg: 0, fadeRate: 0 };
    } else if (topFam === 'sigh') {
      localPhysics = { lineTiltDeg: 2.5, waveAmp: 0, jitterPx: 0, slantDeg: 0, fadeRate: 0.05 };
    } else if (topFam === 'tense') {
      localPhysics = { lineTiltDeg: 0, waveAmp: 0, jitterPx: 2.0, slantDeg: -8, fadeRate: 0 };
    }

    clauseSummaries.push({ index: cIdx, tone: topFam, scores: scores, localPhysics: localPhysics });
    cl.indices.forEach(function(tokenIdx, localPos) {
      wordClauseMap[tokenIdx] = {
        clauseIndex: cIdx,
        localWordIndex: localPos,
        localTone: topFam,
        localPhysics: localPhysics
      };
    });
  });

  const distinctTones = [];
  clauseSummaries.forEach(function(cs) {
    if (cs.tone !== 'unresolved' && distinctTones.indexOf(cs.tone) === -1) {
      distinctTones.push(cs.tone);
    }
  });

  return {
    clauseCount: clauses.length,
    clauseSummaries: clauseSummaries,
    wordClauseMap: wordClauseMap,
    distinctTones: distinctTones,
    hasConflictingArc: distinctTones.length >= 2
  };
}

function semanticAnalysis(tokens, rawText) {
  const safeRaw = String(rawText || '');
  const fullLower = normalizeSentence(safeRaw);
  const subTokens = expandSubTokens(safeRaw);
  const lexicalHits = [];
  const scores = { warm: 0, tense: 0, sigh: 0 };

  let pivotIndex = -1;
  subTokens.forEach(function(t, idx) {
    if (CONTRASTIVE_CONJUNCTIONS.has(normalizeToken(t))) {
      pivotIndex = idx;
    }
  });

  const exclamCount = Math.min(4, (safeRaw.match(/!/g) || []).length);
  const vaderExclamBoost = exclamCount * CONFIG.vaderExclamDelta * 0.25;
  const totalSub = Math.max(1, subTokens.length);

  subTokens.forEach(function(token, index) {
    const nextNorm = normalizeToken(subTokens[index + 1] || '');
    const family = matchEmotionFamily(token, nextNorm);
    if (!family) return;

    const negated = isTokenNegated(subTokens, index, fullLower);
    const stretched = hasLetterStretch(token);
    let weight = stretched ? 0.86 : 0.74;

    if (isWordAllCaps(token)) {
      weight *= CONFIG.vaderCapsScalar;
    }

    const prev1 = subTokens[index - 1] || '';
    const prev2 = subTokens[index - 2] || '';
    if (isIntensifierOperator(prev1) || isIntensifierOperator(prev2)) {
      weight += CONFIG.vaderBoosterDelta * 0.45;
    } else if (isDampenerOperator(prev1)) {
      weight *= 0.55;
    }

    let butMultiplier = 1.0;
    if (pivotIndex !== -1) {
      butMultiplier = index < pivotIndex ? CONFIG.vaderBeforeButWeight : CONFIG.vaderAfterButWeight;
    } else if (totalSub > 8) {
      const progress = index / totalSub;
      butMultiplier = 0.82 + (progress * 0.36);
    }
    weight = weight * butMultiplier + vaderExclamBoost;

    if (negated) {
      if (family === 'warm') {
        scores.sigh = clamp01(scores.sigh + (0.68 * butMultiplier));
        scores.warm = Math.max(0, scores.warm - 0.6);
      } else {
        scores[family] = Math.max(0, scores[family] - 0.78);
      }
    } else {
      scores[family] = clamp01(scores[family] + weight);
    }

    lexicalHits.push({
      index: index,
      family: family,
      negated: negated,
      butWeight: Number(butMultiplier.toFixed(2)),
      token: token,
      emoji: false,
      evidence: 'semantic'
    });
  });

  subTokens.forEach(function(token) {
    const norm = normalizeToken(token);
    const root = collapseRepeatedLetters(token);
    if (norm.length >= 4 && hasLetterStretch(token)) {
      if (root === 'yes' || root === 'yea' || root === 'yeah' || root === 'yep') {
        scores.warm = clamp01(scores.warm + 0.68);
        lexicalHits.push({ index: 0, family: 'warm', negated: false, token: token, emoji: false, evidence: 'semantic' });
      } else if (root === 'no' || root === 'nah' || root === 'nope') {
        scores.sigh = clamp01(scores.sigh + 0.64);
        lexicalHits.push({ index: 0, family: 'sigh', negated: false, token: token, emoji: false, evidence: 'semantic' });
      }
    }
  });

  const emojiHits = findEmojiSignals(safeRaw).map(function(h) {
    return Object.assign({}, h, { evidence: 'emoji' });
  });
  emojiHits.forEach(function(h) {
    scores[h.family] = clamp01(scores[h.family] + (lexicalHits.length ? 0.32 : 0.75));
  });

  const hits = lexicalHits.concat(
    emojiHits.map(function(h) { return Object.assign({}, h, { secondary: lexicalHits.length > 0 }); })
  );

  const entries = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
  const topFamily = entries[0][0];
  const topScore = entries[0][1];
  const dominant = topScore >= 0.55 ? topFamily : 'unresolved';
  const confidence = clamp01(topScore);

  const senticValence = Number((scores.warm - (scores.sigh + scores.tense * 0.85)).toFixed(2));
  const clauseArc = analyzeClauses(tokens, safeRaw);

  const activeDirections = entries
    .filter(function(pair) { return pair[1] >= 0.35; })
    .map(function(pair) { return pair[0] + ':' + pair[1].toFixed(2); });

  return {
    family: dominant,
    dominant: dominant,
    confidence: confidence,
    senticValence: senticValence,
    hasContrastivePivot: pivotIndex !== -1,
    clauseArc: clauseArc,
    vectors: {
      warmth: scores.warm,
      tension: scores.tense,
      heaviness: scores.sigh
    },
    hits: hits,
    lexicalHits: lexicalHits,
    emojiHits: emojiHits,
    evidence: {
      semantic: activeDirections.length ? activeDirections.join(', ') : 'none',
      emoji: emojiHits.length ? emojiHits.map(function(h) { return h.token; }).join(' ') : 'none',
      ambiguity: lexicalHits.length ? 'low' : (emojiHits.length ? 'medium' : 'high')
    }
  };
}

function hasFuzzyAwayDirective(words) {
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    if (w1 === 'get' || w1 === 'go' || w1 === 'stay' || w1 === 'walk') {
      if (w2 === 'away' || (w2.length >= 4 && w2.indexOf('aw') === 0) || editDistanceAtMostOne(w2, 'away')) {
        return true;
      }
    }
  }
  return false;
}

function meaningAnalysis(tokens, raw) {
  const safeRaw = String(raw || '');
  const lower = normalizeSentence(safeRaw);
  const wordList = lower.split(' ').filter(Boolean);
  const collapsedWords = wordList.map(function(w) { return semanticSemanticRoot(w) || w; });
  const collapsed = collapsedWords.join(' ');
  const trimmed = safeRaw.trim();
  const hasQuestion = trimmed.endsWith('?');

  const isNegatedApology = /\b(not|never|aint|isnt|arent)\s+(even\s+|really\s+|so\s+)?(sorry|sory|apolog\w*)\b/.test(collapsed);
  const hasApologyWord = /\b(sorry|sory|apolog\w*|my bad|forgive|forgiv|forgove)\b/.test(collapsed);

  const isDismissiveIdiom = /\b(get lost|go away|get away|stay away|walk away|leave me|leave me alone|back off|shut up|i don't care|i dont care|dont care|do not care|couldnt care less|couldn't care less|who cares|whatever)\b/.test(collapsed)
    || hasFuzzyAwayDirective(collapsedWords);

  const hasReaction = !isDismissiveIdiom && (
    /\b(woah+|whoa+|wow+|omg+|oh my god|huh+|what{2,}|wht+|a+h+\s+ha+|aha+)\b/.test(lower)
    || /\bwhat\s*[?!]{2,}/i.test(safeRaw)
  );

  const hasUrgency = /\b(asap|urgent|urgently|emergency|hurry|immediately)\b/.test(collapsed);
  const isRefusal = !hasQuestion && /\b(no way|nah+|nope|never)\b/.test(collapsed);
  const isAffirmation = !hasQuestion && (/\b(lets go+|yess+|yeahh+)\b/.test(lower) || (wordList.length >= 2 && wordList.every(function(w) { return w === 'yes'; })));

  const cues = {
    directiveDismissive: (isNegatedApology || isDismissiveIdiom) ? 0.90 : 0,
    directive: (!isDismissiveIdiom && /\b(please stop|stop it|stop|wait|hold on|listen to me|listen)\b/.test(collapsed)) ? 0.84 : 0,
    apology: (!isNegatedApology && hasApologyWord) ? 0.86 : 0,
    gratitude: /\b(thanks|thank you|thx)\b/.test(collapsed) ? 0.84 : 0,
    urgentRequest: (hasUrgency && /\b(pls|please|call|help|need|can|could|send|reply|text)\b/.test(collapsed)) ? 0.88 : (hasUrgency ? 0.80 : 0),
    reaction: hasReaction ? 0.82 : 0,
    refusal: (!isDismissiveIdiom && isRefusal) ? 0.80 : 0,
    affirmation: isAffirmation ? 0.80 : 0,
    request: /\b(please|pls|can you|can u|could you|could u|would you|help me)\b/.test(collapsed) ? 0.74 : 0,
    question: hasQuestion ? 0.78 : 0
  };

  const labelMap = {
    directiveDismissive: 'directive-dismissive',
    directive: 'directive',
    apology: 'apology',
    gratitude: 'gratitude',
    urgentRequest: 'urgent-request',
    reaction: 'reaction',
    refusal: 'refusal',
    affirmation: 'affirmation',
    request: 'request',
    question: 'question'
  };

  const activeCues = Object.entries(cues)
    .filter(function(pair) { return pair[1] > 0; })
    .sort(function(a, b) { return b[1] - a[1]; });

  let type = 'statement';
  let confidence = 0.34;
  if (!tokens.length) {
    type = 'empty';
    confidence = 1;
  } else if (activeCues.length) {
    type = labelMap[activeCues[0][0]];
    confidence = activeCues[0][1];
  }

  return {
    type: type,
    confidence: confidence,
    cues: cues,
    hasUrgency: hasUrgency,
    isNegatedApology: isNegatedApology,
    activeList: activeCues.map(function(pair) { return labelMap[pair[0]]; }),
    hasQuestion: hasQuestion,
    explicit: type !== 'statement' && type !== 'empty'
  };
}

function countRepeatedWords(tokens) {
  if (tokens.length < 2) return 0;
  let repeats = 0;
  for (let i = 1; i < tokens.length; i++) {
    const a = normalizeToken(tokens[i - 1]);
    const b = normalizeToken(tokens[i]);
    if (a && a === b) repeats++;
  }
  return repeats;
}

function expressionAnalysis(tokens, raw, structural, semantic) {
  const stretchCount = structural.stretches.length;
  const elongated = stretchCount > 0;
  const uppercase = structural.uppercasePunch;
  const punctMatches = String(raw || '').match(/[!?]+/g) || [];
  const punctJoined = punctMatches.join('');
  const punctuation = punctJoined || 'none';
  const emphaticPunct = punctJoined.length >= 2;
  const repeatCount = countRepeatedWords(tokens);
  const repeated = repeatCount >= 1;
  const emojiCount = (semantic.emojiHits && semantic.emojiHits.length) ? semantic.emojiHits.length : 0;
  const emoji = emojiCount ? semantic.emojiHits.map(function(h) { return h.token; }).join(' ') : 'none';

  const vectors = {
    elongation: clamp01(stretchCount * 0.65),
    uppercase: uppercase ? clamp01(structural.uppercaseRatio * CONFIG.vaderCapsScalar) : 0,
    punctuation: clamp01(punctJoined.length * CONFIG.vaderExclamDelta),
    repetition: clamp01(repeatCount * 0.45),
    emoji: clamp01(emojiCount * 0.5)
  };

  let style = 'plain';
  if (uppercase && elongated) style = 'elongated-uppercase';
  else if (uppercase) style = 'uppercase-punch';
  else if (elongated && emphaticPunct) style = 'elongated-emphatic';
  else if (elongated) style = 'elongated';
  else if (repeated) style = 'repeated-emphasis';
  else if (emphaticPunct) style = 'emphatic-punctuation';

  return { style: style, elongated: elongated, uppercase: uppercase, repeated: repeated, emphaticPunct: emphaticPunct, punctuation: punctuation, emoji: emoji, vectors: vectors };
}

const SentimentHelper = Object.freeze({
  isTokenNegated,
  isLaughExpression,
  matchEmotionFamily,
  analyzeClauses,
  semanticAnalysis,
  meaningAnalysis,
  expressionAnalysis,
  countRepeatedWords
});
//#endregion 5. NLP & EMOTION SCORING ENGINE

// ============================================================================
//#region 6. PHYSICAL BIOMETRICS & TELEMETRY ENGINE
// ============================================================================

function deliveryAnalysis(physical, hasGhosts, pools) {
  const pThresh = activePauseThreshold();
  const cues = [];
  if (physical.guarded || hasGhosts) cues.push('edited');
  if (physical.stare || physical.longestPauseMs >= pThresh) cues.push('hesitant');
  if (physical.burst) cues.push('rapid');
  if (!cues.length) cues.push('direct');

  const vectors = {
    rapidity: physical.burst
      ? clamp01(0.65 + Math.min(0.35, (physical.rapidRun - CONFIG.burstRunLength) * 0.08))
      : (Number.isFinite(physical.q1ItdMs) && physical.q1ItdMs < activeFastFlightThreshold() ? 0.38 : 0.08),
    hesitation: clamp01(Math.max(
      physical.longestPauseMs / 2600,
      state.stareMs / 4000
    )),
    editing: clamp01(Math.max(
      Math.max(0, physical.churn - 1) / 1.8,
      hasGhosts ? 0.65 : 0
    )),
    pressure: clamp01((physical.avgDwellMs || 75) / 180),
    disfluency: clamp01(physical.qcd || 0),
    pooling: pools ? 1 : 0
  };

  return {
    style: cues.join('-'),
    cues: cues,
    vectors: vectors,
    rapid: physical.burst,
    hesitant: physical.stare || physical.longestPauseMs >= pThresh,
    edited: physical.guarded || hasGhosts,
    pooling: Boolean(pools)
  };
}

/*
 * v1 Production Physics Field:
 * - Hostile/Dismissive commands ("get lost", "go away", "shut up") inject +0.75 tension.
 * - Neutral greetings ("hey how are you") NEVER hallucinate anger from normal key-holds;
 *   heavy force emboldens ink and thickens the bubble border without changing neutral affect to angry!
 */
function computePhysicsField(semantic, meaning, expression, delivery, structural, liwc, physical) {
  let warmth = semantic.vectors.warmth;
  let tension = semantic.vectors.tension;
  let heaviness = semantic.vectors.heaviness;

  if (meaning.cues.affirmation > 0 && heaviness < 0.3) {
    warmth = clamp01(Math.max(warmth, 0.65));
  }
  if (meaning.cues.directiveDismissive > 0 && warmth < 0.4) {
    tension = clamp01(Math.max(tension, 0.75));
  }
  if (meaning.hasUrgency && warmth < 0.4) {
    tension = clamp01(tension + 0.58);
  }
  if (meaning.cues.apology > 0 && !meaning.isNegatedApology && warmth < 0.35) {
    const liwcBoost = liwc.highSelfFocus ? 0.08 : 0;
    heaviness = clamp01(heaviness + 0.58 + liwcBoost);
  }
  if (structural.valences.some(function(v) { return v < 0; }) && semantic.dominant === 'unresolved') {
    heaviness = clamp01(heaviness + 0.65);
  }

  const avgDwell = physical.avgDwellMs || 0;
  const peakDwell = physical.peakDwellMs || avgDwell;
  const medItd = physical.medianItdMs || physical.avgFlightMs || 0;
  const hThresh = activeHeavyDwellThreshold();
  let neuromotorState = 'baseline';

  if (semantic.dominant === 'unresolved' && !meaning.explicit) {
    if (medItd > 0 && medItd <= activeFastFlightThreshold() && avgDwell > 0 && avgDwell <= CONFIG.lightDwellMs && !delivery.edited && !delivery.hesitant) {
      warmth = clamp01(warmth + 0.42);
      neuromotorState = 'buoyant-flow';
    } else if (avgDwell >= hThresh && (physical.burst || (state.isMobileMode && peakDwell >= 145))) {
      neuromotorState = 'high-pressure-strike';
    } else if ((medItd >= activeSlowFlightThreshold() || delivery.hesitant) && liwc.highSelfFocus) {
      heaviness = clamp01(heaviness + 0.45);
      neuromotorState = 'fatigued-self-focus';
    }
  }

  const exprBoost = 1 + (expression.vectors.elongation * 0.32) + (expression.vectors.uppercase * 0.25) + (expression.vectors.punctuation * 0.12) + ((expression.vectors.repetition || 0) * 0.18);
  const delivBoost = 1 + (delivery.vectors.rapidity * 0.25) + (delivery.vectors.hesitation * 0.22) + (delivery.vectors.editing * 0.2);
  const intensity = Math.max(1, Math.min(2.2, exprBoost * delivBoost));

  let netVertical = heaviness - warmth;
  if (warmth >= 0.48 && heaviness >= 0.35) {
    netVertical = semantic.dominant === 'warm' ? -warmth * 0.85 : heaviness * 0.85;
  } else {
    const liwcGravity = (liwc.highSelfFocus && warmth < 0.3 && (heaviness > 0 || delivery.hesitant)) ? 0.18 : 0;
    netVertical += liwcGravity + (semantic.dominant === 'unresolved' && delivery.hesitant && !meaning.hasUrgency && tension < 0.4 ? 0.22 : 0);
  }

  const lineTiltDeg = Math.max(-2.6, Math.min(2.8, netVertical * 2.35));
  const waveAmp = warmth >= 0.35 ? (0.55 + warmth * 0.35) : 0;
  const jitterPx = tension >= 0.45 ? (1.8 + tension * 0.75) : 0;
  const slantDeg = tension >= 0.45 ? -8 : (delivery.rapid ? -4 : 0);
  const fadeRate = (heaviness >= 0.45 || (delivery.hesitant && warmth < 0.3)) ? 0.055 : 0;

  const isHeavyForce = state.isMobileMode
    ? (avgDwell >= hThresh || peakDwell >= hThresh + 20)
    : (avgDwell >= hThresh);

  const borderPx = isHeavyForce
    ? Math.min(3.5, Number((1.8 + ((avgDwell - hThresh) / 70)).toFixed(2)))
    : 1.5;

  return {
    intensity: intensity,
    lineTiltDeg: lineTiltDeg,
    waveAmp: waveAmp,
    jitterPx: jitterPx,
    slantDeg: slantDeg,
    fadeRate: fadeRate,
    borderPx: borderPx,
    isHeavyForce: isHeavyForce,
    effectiveForceMs: Math.round(avgDwell || 0),
    neuromotorState: neuromotorState,
    effectiveWarmth: warmth,
    effectiveHeaviness: heaviness,
    effectiveTension: tension
  };
}

function pauseToPx(pauseMs) {
  const pThresh = activePauseThreshold();
  if (!Number.isFinite(pauseMs) || pauseMs < pThresh) return 0;
  return Math.min(60, Math.max(6, Math.round(pauseMs / 100)));
}

function familyPresentation(dominant, physics, semantic, meaning, expression, delivery, liwc, physical) {
  const traces = [];
  const hasArc = semantic.clauseArc && semantic.clauseArc.hasConflictingArc;

  if (hasArc) {
    const arcLabels = semantic.clauseArc.distinctTones.map(function(t) {
      if (t === 'warm') return 'Warmth ↗';
      if (t === 'sigh') return 'Heavy ↘';
      if (t === 'tense') return 'Tension ⚡';
      return t;
    });
    traces.push('Arc: ' + arcLabels.join(' → '));
  } else {
    if (dominant === 'warm' || (!dominant && physics.effectiveWarmth >= 0.55)) traces.push('Warmth ↗');
    if (dominant === 'tense' || physics.effectiveTension >= 0.5) traces.push('Tension ⚡');
    if (dominant === 'sigh' || physics.effectiveHeaviness >= 0.55) traces.push('Heavy Droop ↘');
  }

  const meaningLabels = {
    'apology': 'Apology',
    'gratitude': 'Gratitude',
    'directive-dismissive': meaning.isNegatedApology ? 'Defiant / Not Sorry' : 'Dismissive Cue',
    'directive': 'Directive',
    'urgent-request': 'Urgent Request',
    'reaction': 'Reaction',
    'refusal': 'Refusal',
    'affirmation': 'Affirmation',
    'request': 'Request',
    'question': 'Question'
  };
  if (meaning && meaning.explicit && meaningLabels[meaning.type]) {
    const mLabel = meaningLabels[meaning.type];
    if (traces.indexOf(mLabel) === -1) traces.push(mLabel);
  }

  if (!traces.length) {
    if (physics.neuromotorState !== 'baseline') traces.push('Neuromotor: ' + physics.neuromotorState);
    else traces.push('Unresolved Affect');
  }

  if (physics.isHeavyForce) {
    const displayForce = state.isMobileMode
      ? Math.round(Math.max(physical.avgDwellMs || 0, physical.peakDwellMs || 0))
      : Math.round(physical.avgDwellMs || 0);
    traces.push('Heavy Force (' + displayForce + 'ms)');
  }

  if (semantic.hasContrastivePivot && !hasArc) traces.push("VADER 'but' pivot");
  if (liwc && liwc.highSelfFocus && traces.length < 4) traces.push('LIWC Self-Focus (' + liwc.pct + '%)');

  if (expression && expression.style && expression.style !== 'plain') {
    traces.push(expression.style);
  }
  if (delivery && delivery.style && delivery.style !== 'direct') {
    traces.push(delivery.style + ' delivery');
  }

  let style = 'balloon-steady';
  let tone = 'unresolved';
  let icon = '⚪';

  if (hasArc && semantic.clauseArc.clauseCount >= 2) {
    style = 'balloon-mixed';
    tone = dominant !== 'unresolved' ? dominant : 'warm';
    icon = '🌗';
  } else if (dominant === 'sigh') {
    style = 'balloon-whisper';
    tone = 'sigh';
    icon = '🌙';
  } else if (dominant === 'tense') {
    style = 'balloon-urgent';
    tone = 'tense';
    icon = '⚡';
  } else if (dominant === 'warm') {
    style = 'balloon-warm';
    tone = 'warm';
    icon = '☀️';
  } else if (physics.effectiveTension >= 0.5) {
    style = 'balloon-urgent';
    tone = 'tense';
    icon = '⚡';
  } else if (physics.effectiveHeaviness >= 0.55) {
    style = 'balloon-whisper';
    tone = 'sigh';
    icon = '🌙';
  } else if (physics.effectiveWarmth >= 0.55) {
    style = 'balloon-warm';
    tone = 'warm';
    icon = '☀️';
  }

  return {
    tone: tone,
    vibeTone: tone,
    style: style,
    caption: icon + ' ' + traces.join(' · ')
  };
}

let activeSender = 'Alex';
let messages = [
  {
    sender: 'Alex',
    style: 'balloon-warm',
    tone: 'warm',
    vibeTone: 'warm',
    intensity: 1.3,
    caption: '☀️ Warmth ↗ · elongated · rapid delivery',
    delivery: { style: 'rapid', cues: ['rapid'] },
    physics: { lineTiltDeg: -2.1, waveAmp: 0.75, jitterPx: 0, slantDeg: 0, fadeRate: 0, borderPx: 1.5 },
    xrayText: '🔍 Ink X-Ray: Pace 84ms · Force 72ms avg · Pause 0px · Edits 1.0x · Line Slant -2.1°',
    words: [
      { text: "The", weight: 500, fastGlide: true, heavyForce: false, punch: false, poolAfter: false, ghostType: null, isStretch: false },
      { text: "new", weight: 500, fastGlide: true, heavyForce: false, punch: false, poolAfter: false, ghostType: null, isStretch: false },
      { text: "build", weight: 550, fastGlide: false, heavyForce: false, punch: false, poolAfter: false, ghostType: null, isStretch: false },
      { text: "is", weight: 500, fastGlide: false, heavyForce: false, punch: false, poolAfter: false, ghostType: null, isStretch: false },
      { text: "working", weight: 600, fastGlide: true, heavyForce: false, punch: false, poolAfter: false, ghostType: null, isStretch: false },
      { text: "soooo", weight: 700, fastGlide: false, heavyForce: false, punch: false, poolAfter: false, ghostType: null, isStretch: true },
      { text: "great! ✨", weight: 700, fastGlide: true, heavyForce: false, punch: true, poolAfter: false, ghostType: null, isStretch: false }
    ]
  },
  {
    sender: 'Sam',
    style: 'balloon-mixed',
    tone: 'warm',
    vibeTone: 'warm',
    intensity: 1.35,
    caption: '🌗 Arc: Heavy ↘ → Warmth ↗ · hesitant delivery',
    delivery: { style: 'hesitant', cues: ['hesitant'] },
    physics: { lineTiltDeg: -1.6, waveAmp: 0.7, jitterPx: 0, slantDeg: 0, fadeRate: 0, borderPx: 2.2 },
    xrayText: '🔍 Ink X-Ray: Pace 112ms · Force 94ms avg / 138ms peak · Pause 14px (1.4s) · 2-Clause Trajectory Shift',
    words: [
      { text: "The", clauseIndex: 0, localTone: 'sigh', localPhysics: { lineTiltDeg: 2.4, waveAmp: 0, jitterPx: 0, slantDeg: 0, fadeRate: 0.05 } },
      { text: "server", clauseIndex: 0, localTone: 'sigh', localPhysics: { lineTiltDeg: 2.4, waveAmp: 0, jitterPx: 0, slantDeg: 0, fadeRate: 0.05 } },
      { text: "was", clauseIndex: 0, localTone: 'sigh', localPhysics: { lineTiltDeg: 2.4, waveAmp: 0, jitterPx: 0, slantDeg: 0, fadeRate: 0.05 } },
      { text: "down...", clauseIndex: 0, poolAfter: true, pausePx: 14, localTone: 'sigh', localPhysics: { lineTiltDeg: 2.4, waveAmp: 0, jitterPx: 0, slantDeg: 0, fadeRate: 0.05 } },
      { text: "but", clauseIndex: 1, localTone: 'warm', localPhysics: { lineTiltDeg: -2.1, waveAmp: 0.75, jitterPx: 0, slantDeg: 0, fadeRate: 0 } },
      { text: "everything", clauseIndex: 1, localTone: 'warm', localPhysics: { lineTiltDeg: -2.1, waveAmp: 0.75, jitterPx: 0, slantDeg: 0, fadeRate: 0 } },
      { text: "runs", clauseIndex: 1, fastGlide: true, localTone: 'warm', localPhysics: { lineTiltDeg: -2.1, waveAmp: 0.75, jitterPx: 0, slantDeg: 0, fadeRate: 0 } },
      { text: "smoothly", clauseIndex: 1, fastGlide: true, localTone: 'warm', localPhysics: { lineTiltDeg: -2.1, waveAmp: 0.75, jitterPx: 0, slantDeg: 0, fadeRate: 0 } },
      { text: "now!", clauseIndex: 1, heavyForce: true, punch: true, localTone: 'warm', localPhysics: { lineTiltDeg: -2.1, waveAmp: 0.75, jitterPx: 0, slantDeg: 0, fadeRate: 0 } }
    ]
  }
];

function hasLetterStretch(word) {
  const norm = normalizeToken(word);
  if (!norm) return false;
  if (/([a-z])\1{2,}/.test(norm)) return true;
  if (norm.length >= 3 && !NATURAL_DOUBLE_ENDINGS.has(norm)) {
    const last = norm.charAt(norm.length - 1);
    const prev = norm.charAt(norm.length - 2);
    if (last === prev && 'yuiadhnrmog'.indexOf(last) !== -1) {
      return true;
    }
  }
  return false;
}

function uppercaseRatio(text) {
  const letters = String(text || '').match(/[A-Za-z]/g) || [];
  if (!letters.length) return 0;
  const upper = String(text || '').match(/[A-Z]/g) || [];
  return upper.length / letters.length;
}

function getSignalIndices(tokens) {
  return tokens
    .map(function(t, i) { return hasLetterStretch(t) ? i : -1; })
    .filter(function(i) { return i >= 0; });
}

function scopedValence(tokens, signalIndex, fullLower) {
  const negated = isTokenNegated(tokens, signalIndex, fullLower || '');
  const Nw = negated ? 1 : 0;
  return 1 * (1 - 2 * Nw);
}

function structuralAnalysis(tokens, raw) {
  const fullLower = normalizeSentence(raw);
  const stretches = getSignalIndices(tokens);
  const valences = stretches.map(function(i) { return scopedValence(tokens, i, fullLower); });
  const ratio = uppercaseRatio(raw);
  const letters = String(raw || '').match(/[A-Za-z]/g) || [];
  const uppercasePunch = ratio > 0.8 && letters.length >= 2;
  return { stretches: stretches, valences: valences, uppercaseRatio: ratio, uppercasePunch: uppercasePunch };
}

function computeQuartileStats(arr) {
  if (!arr || !arr.length) return { mean: 0, q1: Infinity, median: 0, q3: 0, max: 0, qcd: 0, cv: 0 };
  const sorted = arr.slice().sort(function(a, b) { return a - b; });
  const n = sorted.length;
  const sum = sorted.reduce(function(a, b) { return a + b; }, 0);
  const mean = sum / n;

  function percentile(p) {
    const pos = (n - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  }

  const q1 = percentile(0.25);
  const median = percentile(0.50);
  const q3 = percentile(0.75);
  const max = sorted[n - 1];
  const qcd = (q3 + q1) > 0 ? (q3 - q1) / (q3 + q1) : 0;

  let cv = 0;
  if (n >= 2 && mean > 0) {
    const variance = sorted.reduce(function(acc, v) { return acc + Math.pow(v - mean, 2); }, 0) / n;
    cv = Math.sqrt(variance) / mean;
  }

  return { mean: mean, q1: q1, median: median, q3: q3, max: max, qcd: qcd, cv: cv };
}

function physicalAnalysis() {
  const finalLength = inputBox.value.length;
  const churn = finalLength ? state.totalKeys / finalLength : 0;
  const bThresh = activeBurstThreshold();

  const itdStats = computeQuartileStats(state.keyTimes);
  const dwellStats = computeQuartileStats(state.dwellTimes);

  // Mobile uses responsive recent-peak tracking so shaking/forceful thumb taps spike immediately;
  // Desktop uses median/mean so a single stray 130ms key-hold doesn't false-trigger Heavy Force on every message!
  let responsiveForceMs = dwellStats.median || dwellStats.mean || 0;
  if (state.isMobileMode) {
    const recentDwells = state.dwellTimes.slice(-4);
    const recentDwellStats = computeQuartileStats(recentDwells);
    responsiveForceMs = Math.max(dwellStats.q3 || 0, recentDwellStats.q3 || 0, dwellStats.mean || 0);
  }

  const guarded = churn >= CONFIG.churnThreshold;
  const stare = state.stareMs >= CONFIG.stareThresholdMs;

  let rapidRun = 0;
  let maxRapidRun = 0;
  for (let i = 0; i < state.keyTimes.length; i++) {
    const gap = state.keyTimes[i];
    if (gap >= CONFIG.minHumanTapDeltaMs && gap < bThresh) {
      rapidRun++;
      maxRapidRun = Math.max(maxRapidRun, rapidRun);
    } else {
      rapidRun = 0;
    }
  }

  const burst = maxRapidRun >= CONFIG.burstRunLength;
  const pauseValues = Object.values(state.pauseGapsBySlot)
    .concat(Object.values(state.lockedPauseBySlot))
    .filter(Number.isFinite);
  const longestPauseMs = pauseValues.length ? Math.max.apply(null, pauseValues) : 0;

  return {
    churn: churn,
    fastest: itdStats.q1,
    q1ItdMs: itdStats.q1,
    medianItdMs: itdStats.median,
    q3ItdMs: itdStats.q3,
    qcd: itdStats.qcd,
    guarded: guarded,
    stare: stare,
    burst: burst,
    rapidRun: maxRapidRun,
    longestPauseMs: longestPauseMs,
    avgDwellMs: responsiveForceMs,
    meanDwellMs: dwellStats.mean,
    peakDwellMs: dwellStats.max,
    avgFlightMs: itdStats.median || itdStats.mean,
    rhythmCv: itdStats.cv
  };
}

function pauseSpacing(includeLive) {
  const allowLive = includeLive !== false;
  const p = physicalAnalysis();
  const pThresh = activePauseThreshold();
  const live = allowLive && Number.isFinite(state.livePendingPauseMs) && state.livePendingPauseMs >= pThresh
    ? state.livePendingPauseMs
    : 0;
  return pauseToPx(Math.max(p.longestPauseMs, live));
}

const BiometricsHelper = Object.freeze({
  deliveryAnalysis,
  computePhysicsField,
  pauseToPx,
  familyPresentation,
  hasLetterStretch,
  uppercaseRatio,
  structuralAnalysis,
  computeQuartileStats,
  physicalAnalysis,
  pauseSpacing
});
//#endregion 6. PHYSICAL BIOMETRICS & TELEMETRY ENGINE

// ============================================================================
//#region 7. INK VISUALIZATION & BUBBLE RENDERING
// ============================================================================

function evaluateTextSignal(raw, customPhysical, hasGhosts, pools) {
  const tokens = tokenize(raw);
  const physical = customPhysical || physicalAnalysis();
  const structural = structuralAnalysis(tokens, raw);
  const liwc = computeLiwcMetrics(raw);
  const semantic = semanticAnalysis(tokens, raw);
  const meaning = meaningAnalysis(tokens, raw);
  const expression = expressionAnalysis(tokens, raw, structural, semantic);
  const delivery = deliveryAnalysis(physical, Boolean(hasGhosts), Boolean(pools));
  const physics = computePhysicsField(semantic, meaning, expression, delivery, structural, liwc, physical);

  let family = semantic.dominant;
  if (family === 'unresolved') {
    if (physics.effectiveWarmth >= 0.55) family = 'warm';
    else if (physics.effectiveTension >= 0.5) family = 'tense';
    else if (physics.effectiveHeaviness >= 0.55) family = 'sigh';
  }

  let visualDirection = family !== 'unresolved' ? family : 'neutral';
  if (family === 'unresolved') {
    if (delivery.hesitant || delivery.edited) visualDirection = 'withdrawn';
    else if (delivery.rapid) visualDirection = 'rapid-neutral';
    else if (meaning.explicit) visualDirection = 'meaning-' + meaning.type;
  }

  const routeParts = [];
  if (semantic.clauseArc && semantic.clauseArc.hasConflictingArc) routeParts.push('arc:' + semantic.clauseArc.distinctTones.join('->'));
  else if (family !== 'unresolved') routeParts.push('affect:' + family);
  if (meaning.explicit) routeParts.push('meaning:' + meaning.type);
  if (semantic.hasContrastivePivot) routeParts.push('vader:but-pivot');
  if (liwc.highSelfFocus) routeParts.push('liwc:self-focus');
  if (expression.style !== 'plain') routeParts.push('expr:' + expression.style);
  if (delivery.style !== 'direct') routeParts.push('deliv:' + delivery.style);
  const reason = routeParts.length ? routeParts.join(' + ') : 'unresolved-direct';

  const presentation = familyPresentation(family, physics, semantic, meaning, expression, delivery, liwc, physical);

  return Object.assign({}, presentation, {
    family: family,
    intensity: physics.intensity,
    physics: physics,
    semantic: semantic,
    liwc: liwc,
    meaning: meaning,
    expression: expression,
    delivery: delivery,
    visualDirection: visualDirection,
    physical: physical,
    structural: structural,
    reason: reason
  });
}

function decideVibe() {
  const hasGhosts = Object.values(state.ghostsAtSlot).some(function(a) { return a && a.length; });
  const pools = Object.values(state.wordMeta).some(function(m) { return m && m.poolAfter; });
  return evaluateTextSignal(inputBox.value, physicalAnalysis(), hasGhosts, pools);
}

function splitTrailingDots(text) {
  const str = String(text || '');
  let i = str.length;
  while (i > 0 && str.charAt(i - 1) === '.') i--;
  const dotCount = str.length - i;
  if (dotCount >= 2) {
    return { base: str.slice(0, i), dots: str.slice(i) };
  }
  return { base: str, dots: '' };
}

function appendFadingDots(container, dots) {
  for (let i = 0; i < dots.length; i++) {
    const d = document.createElement('span');
    d.className = 'trail-dot';
    d.textContent = '.';
    d.style.opacity = Math.max(0.22, 0.9 - i * 0.16).toFixed(2);
    container.appendChild(d);
  }
}

// [Story #14]: Compute continuous font axes from biometrics and psycholinguistics
function computeDynamicFontAxes(wordMeta, isBurst, tone) {
  const m = wordMeta || {};

  // 1. Weight Axis (wght: 300 to 950):
  // 35ms dwell -> 350, 80ms -> 500, 180ms+ -> 950
  const dwell = m.peakForce || 75;
  const clampedDwell = Math.max(35, Math.min(180, dwell));
  let weight = Math.round(350 + ((clampedDwell - 35) / 145) * 600);
  if (m.heavyForce) weight = Math.max(weight, 850);
  if (typeof m.weight === 'number' && m.weight > weight) {
    weight = m.weight;
  }

  // 2. Slant Axis (slnt: 0deg to -14deg):
  // Deliberate -> 0deg, Fast burst -> -12deg, Max run -> -14deg
  let slant = 0;
  if (isBurst) slant = -12;
  else if (m.fastGlide) slant = -8;

  // 3. Casual & Cursive Axis (CASL: 0.0 to 1.0, CRSV: 0 or 1):
  // Geometric sans (0.0, CRSV 0) -> Handwritten ink brush & cursive loops (1.0, CRSV 1)
  let casual = 0.0;
  let cursive = 0;
  if (tone === 'warm') {
    casual = 1.0;
    cursive = 1;
  } else if (m.isStretch || m.punch) {
    casual = 0.85;
    cursive = 1;
  } else if (tone === 'sigh') {
    casual = 0.20;
    cursive = 0;
  }

  return { weight: weight, slant: slant, casual: casual, cursive: cursive };
}

// [Story #14]: Zero-thrash CSS custom property injection on word element
function applyWordAxes(element, axes) {
  if (!element || !axes) return;
  element.style.setProperty('--ink-weight', axes.weight);
  element.style.setProperty('--ink-slant', axes.slant);
  element.style.setProperty('--ink-casual', axes.casual);
  element.style.setProperty('--ink-cursive', axes.cursive != null ? axes.cursive : (axes.casual > 0.5 ? 1 : 0));
}

function renderInkWord(text, tone, intensity, stretch, physics, wordIndex) {
  const parts = splitTrailingDots(text);
  const base = parts.base;
  const dots = parts.dots;
  const validTones = ['warm', 'tense', 'sigh', 'unresolved'];
  const resolvedTone = validTones.indexOf(tone) !== -1 ? tone : 'unresolved';
  const c = document.createElement('span');
  c.className = 'w-token tone-' + resolvedTone + (stretch ? ' w-stretch-' + resolvedTone : '');

  const wIdxRaw = wordIndex || 0;
  if (resolvedTone === 'warm') {
    c.style.animationDelay = ((wIdxRaw % 4) * 0.16).toFixed(2) + 's';
  } else if (resolvedTone === 'sigh') {
    c.style.animationDelay = ((wIdxRaw % 4) * 0.4).toFixed(2) + 's';
  }

  const graphemes = splitGraphemes(base);
  const fadeRate = resolvedTone === 'sigh' ? 0.045 : 0;

  for (let i = 0; i < graphemes.length; i++) {
    const s = document.createElement('span');
    const isEmoji = /\p{Extended_Pictographic}/u.test(graphemes[i]);
    s.className = (stretch ? 'stretch-char ink-char' : 'ink-char') + (isEmoji ? ' emoji-char' : '');
    s.textContent = graphemes[i];
    s.style.setProperty('--char-i', i);
    if (fadeRate > 0) {
      s.style.opacity = Math.max(0.45, 1 - (wIdxRaw * 0.08) - (i % 10) * fadeRate).toFixed(2);
    }
    c.appendChild(s);
  }
  appendFadingDots(c, dots);
  return c;
}

function renderStretchedWord(text, tone, intensity, physics, wordIndex) {
  return renderInkWord(text, tone, intensity, true, physics, wordIndex);
}

// [Tactile Paper & Living Ink]: Retired cartoon SVG stickers in favor of pure forensic typography and ink physics
function createBalloonDOM(msg, isPreview) {
  const balloon = document.createElement('div');
  const deliveryCues = (msg.delivery && Array.isArray(msg.delivery.cues)) ? msg.delivery.cues : [];
  const deliveryClasses = deliveryCues.map(function(c) { return 'delivery-' + c; });
  if (!deliveryClasses.length && msg.delivery && msg.delivery.style) {
    deliveryClasses.push('delivery-' + msg.delivery.style);
  }
  balloon.className = [msg.style].concat(deliveryClasses).filter(Boolean).join(' ');

  // [Tactile Paper]: Tag committed feed messages to settle gracefully
  if (!isPreview) {
    balloon.classList.add('balloon-settled');
  }

  if (msg.physics && msg.physics.borderPx && msg.physics.borderPx > 1.6) {
    balloon.style.borderWidth = msg.physics.borderPx + 'px';
  }

  const line = document.createElement('span');
  line.className = 'sentence-line';
  const defaultTone = msg.tone || msg.vibeTone || 'unresolved';

  const isMultiClause = msg.style === 'balloon-mixed';

  if (!isMultiClause) {
    let tiltDeg = 0;
    if (msg.physics && typeof msg.physics.lineTiltDeg === 'number') {
      tiltDeg = msg.physics.lineTiltDeg;
    } else if (defaultTone === 'warm') {
      tiltDeg = -2.1;
    } else if (defaultTone === 'sigh') {
      tiltDeg = 2.4;
    }
    if (Math.abs(tiltDeg) > 0.15) {
      line.style.setProperty('--line-tilt', tiltDeg.toFixed(2) + 'deg');
    }
  }

  let visibleWordIdx = 0;
  let activeClauseContainer = line;
  let lastClauseIdx = null;

  msg.words.forEach(function(w) {
    if (w.newlinesBefore > 0) {
      for (let n = 0; n < w.newlinesBefore; n++) {
        const br = document.createElement('span');
        br.className = n === 0 ? 'ink-line-break' : 'ink-line-break ink-empty-line';
        if (isMultiClause) {
          line.appendChild(br);
        } else {
          activeClauseContainer.appendChild(br);
        }
      }
    }

    if (w.ghostType) {
      const span = document.createElement('span');
      span.className = w.ghostType === 'single' ? 'w-cross-single' : 'w-cross-scribble';
      span.textContent = w.text;
      if (isPreview) {
        span.title = 'Tap to remove deletion trace';
        span.style.cursor = 'pointer';
        span.addEventListener('click', function(ev) {
          ev.stopPropagation();
          triggerHaptic(20, true);
          const arr = state.ghostsAtSlot[w.slotIndex] || [];
          state.ghostsAtSlot[w.slotIndex] = arr.filter(function(g) { return g !== w.ghostRef && g.text !== w.text; });
          if (!state.ghostsAtSlot[w.slotIndex].length) delete state.ghostsAtSlot[w.slotIndex];
          const anyGhosts = Object.values(state.ghostsAtSlot).some(function(a) { return a && a.length; });
          if (!inputBox.value.trim() && !anyGhosts) {
            resetDraftState();
          }
          renderPreview();
        });
      }
      activeClauseContainer.appendChild(span);
      return;
    }

    if (isMultiClause && w.clauseIndex !== undefined && w.clauseIndex !== lastClauseIdx) {
      lastClauseIdx = w.clauseIndex;
      activeClauseContainer = document.createElement('span');
      activeClauseContainer.className = 'clause-span';
      const cTilt = (w.localPhysics && typeof w.localPhysics.lineTiltDeg === 'number') ? w.localPhysics.lineTiltDeg : 0;
      if (Math.abs(cTilt) > 0.15) {
        activeClauseContainer.style.transform = 'rotate(' + cTilt.toFixed(2) + 'deg)';
      }
      line.appendChild(activeClauseContainer);
    }

    const currentWordIdx = visibleWordIdx++;
    const clauseTone = (w.localTone && w.localTone !== 'unresolved') ? w.localTone : defaultTone;
    // [Story #14 Polish]: Targeted emotion accents — only emotional hits, stretches, and punch words bloom
    const isEmotionTrigger = Boolean(matchEmotionFamily(w.text) || w.isStretch || w.punch);
    const wordTone = isEmotionTrigger ? clauseTone : 'unresolved';
    const wordPhysics = w.localPhysics || msg.physics;

    let renderedWord;
    if (w.isStretch) {
      renderedWord = renderStretchedWord(w.text, wordTone, msg.intensity || 1, wordPhysics, currentWordIdx);
    } else {
      renderedWord = renderInkWord(w.text, wordTone, msg.intensity || 1, false, wordPhysics, currentWordIdx);
      if (w.punch) renderedWord.classList.add('w-punch');
    }

    // [Story #14]: Apply continuous variable font axes (wght, slnt, CASL)
    const axes = w.axes || computeDynamicFontAxes(w, Boolean(w.fastGlide), wordTone);
    applyWordAxes(renderedWord, axes);

    if (w.fastGlide && !w.isStretch) renderedWord.classList.add('w-fast-glide');
    if (w.heavyForce) renderedWord.classList.add('w-heavy-force');
    if (w.poolAfter) renderedWord.classList.add('w-ink-pool');

    activeClauseContainer.appendChild(renderedWord);

    if (w.pausePx > 0) {
      const spacer = document.createElement('span');
      spacer.className = w.isLivePause ? 'pause-space live-waiting' : 'pause-space';
      spacer.style.width = w.pausePx + 'px';
      activeClauseContainer.appendChild(spacer);
    }
  });

  if (msg.trailingNewlines > 0) {
    for (let n = 0; n < msg.trailingNewlines; n++) {
      const br = document.createElement('span');
      br.className = n === 0 ? 'ink-line-break' : 'ink-line-break ink-empty-line';
      if (isMultiClause) {
        line.appendChild(br);
      } else {
        activeClauseContainer.appendChild(br);
      }
    }
  }

  balloon.appendChild(line);
  return balloon;
}

function buildDraftMessage(includeLiveWaiting) {
  const allowLive = includeLiveWaiting !== false;
  const pThresh = activePauseThreshold();
  const rawInput = inputBox.value;
  const trailingSpace = endsWithSpace(rawInput);
  const tokens = tokenize(rawInput);
  const lineBreaks = extractTokenNewlines(rawInput, tokens);
  const decision = decideVibe();
  const clauseMap = (decision.semantic && decision.semantic.clauseArc && decision.semantic.clauseArc.wordClauseMap)
    ? decision.semantic.clauseArc.wordClauseMap
    : {};
  const hasConflictingArc = Boolean(decision.semantic && decision.semantic.clauseArc && decision.semantic.clauseArc.hasConflictingArc);

  const finalWords = [];
  const ghostSlots = Object.keys(state.ghostsAtSlot).map(function(k) { return Number(k) + 1; });
  const maxSlot = Math.max.apply(null, [tokens.length, 0].concat(ghostSlots));

  for (let i = 0; i < maxSlot; i++) {
    if (state.ghostsAtSlot[i]) {
      state.ghostsAtSlot[i].forEach(function(g) {
        if (i < tokens.length && isAutocorrectExpansion(tokens[i], g.text)) {
          return;
        }
        finalWords.push({ text: g.text, ghostType: g.type, slotIndex: i, ghostRef: g });
      });
    }
    if (i < tokens.length) {
      const m = state.wordMeta[i] || { weight: 450, fastGlide: false, heavyForce: false, peakForce: 0, punch: false, poolAfter: false };
      const isLast = i === tokens.length - 1;
      const nextSlotHasGhost = Boolean(state.ghostsAtSlot[i + 1] && state.ghostsAtSlot[i + 1].length);

      const lockedMs = nextSlotHasGhost ? 0 : (state.pauseGapsBySlot[i] || state.lockedPauseBySlot[i] || 0);

      let liveBoundaryMs = 0;
      if (isLast && trailingSpace) {
        if (state.isKeyboardOpen && state.spacePauseAnchorTime != null) {
          liveBoundaryMs = state.accumulatedSpacePauseMs + Math.max(0, performance.now() - state.spacePauseAnchorTime);
        } else {
          liveBoundaryMs = state.accumulatedSpacePauseMs;
        }
      }

      let liveWordHoldMs = 0;
      if (isLast && !trailingSpace) {
        if (state.isKeyboardOpen && state.lastNonSpaceInputTime != null) {
          liveWordHoldMs = state.accumulatedWordHoldMs + Math.max(0, performance.now() - state.lastNonSpaceInputTime);
        } else {
          liveWordHoldMs = state.accumulatedWordHoldMs;
        }
      }

      let effectivePauseMs = 0;
      let pausePx = 0;
      let hasLingeringPool = false;

      if (allowLive) {
        const pauseMs = Math.max(lockedMs, liveBoundaryMs);
        effectivePauseMs = pauseMs >= pThresh ? pauseMs : 0;
        pausePx = pauseToPx(effectivePauseMs);
        hasLingeringPool = (liveWordHoldMs >= CONFIG.poolDelayMs || liveBoundaryMs >= CONFIG.poolDelayMs);
      } else {
        // Sent message mode (Hybrid Approach):
        // Preserve authentic ink pooling and clamped breathing room without causing empty mobile line wraps
        if (isLast && (trailingSpace || liveWordHoldMs >= CONFIG.poolDelayMs)) {
          const terminalPauseMs = Math.max(liveBoundaryMs, liveWordHoldMs);
          hasLingeringPool = terminalPauseMs >= CONFIG.poolDelayMs;
          if (trailingSpace && terminalPauseMs >= pThresh) {
            pausePx = Math.min(10, Math.max(6, pauseToPx(terminalPauseMs)));
          }
        } else {
          effectivePauseMs = lockedMs >= pThresh ? lockedMs : 0;
          pausePx = pauseToPx(effectivePauseMs);
        }
      }

      const liveWaiting = allowLive && isLast && trailingSpace && liveBoundaryMs >= pThresh;
      const livePooling = hasLingeringPool;

      if (allowLive && livePooling && !state.hapticPoolFiredForSlot[i]) {
        state.hapticPoolFiredForSlot[i] = true;
        triggerHaptic(28);
      }

      const cInfo = clauseMap[i] || {};
      const clauseTone = hasConflictingArc ? (cInfo.localTone || 'unresolved') : (decision.tone || decision.family || 'unresolved');
      const isEmotionTrigger = Boolean(matchEmotionFamily(tokens[i]) || hasLetterStretch(tokens[i]) || m.punch);
      const wordTone = isEmotionTrigger ? clauseTone : 'unresolved';
      const axes = computeDynamicFontAxes(m, Boolean(m.fastGlide), wordTone);

      finalWords.push({
        text: tokens[i],
        newlinesBefore: lineBreaks.newlinesBefore[i] || 0,
        weight: axes.weight,
        axes: axes,
        fastGlide: Boolean(m.fastGlide),
        heavyForce: Boolean(m.heavyForce),
        peakForce: m.peakForce || 0,
        punch: m.punch,
        poolAfter: Boolean(m.poolAfter || lockedMs >= CONFIG.poolDelayMs || livePooling),
        ghostType: null,
        isStretch: hasLetterStretch(tokens[i]),
        pausePx: pausePx,
        isLivePause: liveWaiting,
        clauseIndex: hasConflictingArc ? cInfo.clauseIndex : undefined,
        localTone: hasConflictingArc ? cInfo.localTone : null,
        localPhysics: hasConflictingArc ? cInfo.localPhysics : null,
        localWordIndex: hasConflictingArc ? cInfo.localWordIndex : undefined
      });
    }
  }
  return Object.assign({}, decision, { words: finalWords, trailingNewlines: lineBreaks.trailingNewlines || 0 });
}

function isRecentBackspaceBurstFrantic(atTime) {
  const now = atTime || performance.now();
  if (state.franticStreakActive && state.lastBackspaceActionTime != null && (now - state.lastBackspaceActionTime) <= 1200) {
    return true;
  }
  const n = state.backspaceTimes.length;
  if (n < CONFIG.franticBackspaceMinCount) return false;
  const latest = state.backspaceTimes[n - 1];
  if (now - latest > 1200) return false;
  const fourthLast = state.backspaceTimes[n - CONFIG.franticBackspaceMinCount];
  return (latest - fourthLast) <= CONFIG.franticBackspaceWindowMs;
}

function updateHUD() {
  const p = physicalAnalysis();
  const liwc = computeLiwcMetrics(inputBox.value);
  const spacing = pauseSpacing(true);
  const frantic = isRecentBackspaceBurstFrantic(performance.now());
  const hThresh = activeHeavyDwellThreshold();

  const churnEl = byId('mChurn');
  const stareEl = byId('mStare');
  const liwcEl = byId('mLiwc');
  const dwellEl = byId('mDwell');
  const flightEl = byId('mFlight');
  const burstEl = byId('mBurst');
  const pauseEl = byId('mPause');
  const bkspEl = byId('mBksp');

  if (churnEl) churnEl.textContent = p.churn.toFixed(1) + 'x';
  if (stareEl) {
    const hasText = Boolean(inputBox.value.trim());
    if (hasText && !state.isKeyboardOpen) {
      stareEl.textContent = (state.stareMs / 1000).toFixed(1) + 's ⏸';
      stareEl.style.color = 'var(--muted)';
      stareEl.title = 'Pen down (stare timer paused)';
    } else {
      stareEl.textContent = (state.stareMs / 1000).toFixed(1) + 's';
      stareEl.style.color = 'var(--hud-text-metric)';
      stareEl.title = 'Active typing hesitation';
    }
  }

  const modeBadge = byId('modeBadge');
  if (modeBadge) {
    const hasText = Boolean(inputBox.value.trim());
    if (hasText && !state.isKeyboardOpen) {
      modeBadge.textContent = 'PAUSED';
      modeBadge.style.color = 'var(--hud-text-label)';
    } else if (hasText && state.isKeyboardOpen) {
      modeBadge.textContent = state.isMobileMode ? 'TOUCH' : 'TYPING';
      modeBadge.style.color = 'var(--hud-accent)';
    } else {
      modeBadge.textContent = state.isMobileMode ? 'TOUCH' : 'READY';
      modeBadge.style.color = 'var(--hud-text-metric)';
    }
  }
  if (liwcEl) {
    liwcEl.textContent = liwc.pct + '%';
    liwcEl.style.color = liwc.highSelfFocus ? 'var(--hud-accent)' : 'var(--hud-text-metric)';
  }
  if (dwellEl) {
    dwellEl.textContent = p.avgDwellMs ? Math.round(p.avgDwellMs) + 'ms' : '—';
    dwellEl.style.color = p.avgDwellMs >= hThresh ? 'var(--hud-alert)' : 'var(--hud-text-metric)';
  }
  if (flightEl) {
    flightEl.textContent = p.medianItdMs ? Math.round(p.medianItdMs) + 'ms' : '—';
  }
  if (burstEl) burstEl.textContent = Number.isFinite(p.q1ItdMs) ? Math.round(p.q1ItdMs) + 'ms' : '—';
  if (pauseEl) pauseEl.textContent = spacing + 'px';
  if (bkspEl) {
    bkspEl.textContent = frantic ? 'Frantic' : 'Calm';
    bkspEl.style.color = frantic ? 'var(--hud-alert)' : 'var(--hud-text-metric)';
  }
}

function renderPreview(isClockTick) {
  const raw = inputBox.value;
  const hasGhosts = Object.values(state.ghostsAtSlot).some(function(a) { return a && a.length; });
  if (!raw.trim() && !hasGhosts) {
    state.lastPreviewRenderedText = null;
    state.lastPreviewArchetype = null;
    previewStage.replaceChildren();
    const s = document.createElement('span');
    s.style.cssText = 'font-size:11.5px;color:var(--muted);font-style:italic';
    s.textContent = 'Ink flows as you write...';
    previewStage.appendChild(s);
    previewTitle.textContent = 'Preview';
    updateHUD();
    return;
  }

  const draft = buildDraftMessage(true);
  const pThresh = activePauseThreshold();

  // [Story #14]: Zero-Thrash Clock Tick Update:
  // If text and archetype have not changed on a 100ms clock tick, mutate existing DOM elements in-place.
  // This prevents resetting CSS animation keyframe timelines (which caused words to violently jitter/shake).
  if (isClockTick && state.lastPreviewRenderedText === raw && state.lastPreviewArchetype === draft.style) {
    const trailingSpace = endsWithSpace(raw);
    const line = previewStage.querySelector('.sentence-line');
    if (line) {
      if (trailingSpace) {
        let liveSpacer = line.querySelector('.pause-space.live-waiting');
        if (state.livePendingPauseMs >= pThresh) {
          const pausePx = pauseToPx(state.livePendingPauseMs);
          if (liveSpacer) {
            liveSpacer.style.width = pausePx + 'px';
          } else {
            liveSpacer = document.createElement('span');
            liveSpacer.className = 'pause-space live-waiting';
            liveSpacer.style.width = pausePx + 'px';
            line.appendChild(liveSpacer);
          }
        } else if (liveSpacer) {
          liveSpacer.remove();
        }
      }
      // Check mid-word pool trigger without rebuilding whole DOM
      const tokens = tokenize(raw);
      if (tokens.length > 0 && !trailingSpace) {
        const lastSlot = tokens.length - 1;
        const liveHold = state.accumulatedWordHoldMs + (state.isKeyboardOpen && state.lastNonSpaceInputTime != null ? Math.max(0, performance.now() - state.lastNonSpaceInputTime) : 0);
        if (liveHold >= CONFIG.poolDelayMs) {
          const allTokens = line.querySelectorAll('.w-token');
          if (allTokens.length) {
            const lastTokenEl = allTokens[allTokens.length - 1];
            if (!lastTokenEl.classList.contains('w-ink-pool')) {
              lastTokenEl.classList.add('w-ink-pool');
              if (!state.hapticPoolFiredForSlot[lastSlot]) {
                state.hapticPoolFiredForSlot[lastSlot] = true;
                triggerHaptic(28);
              }
            }
          }
        }
      }
    }
    previewTitle.textContent = draft.caption;
    updateHUD();
    return;
  }

  state.lastPreviewRenderedText = raw;
  state.lastPreviewArchetype = draft.style;
  previewTitle.textContent = draft.caption;
  previewStage.replaceChildren(createBalloonDOM(draft, true));
  updateHUD();
}
//#endregion 7. INK VISUALIZATION & BUBBLE RENDERING

// ============================================================================
//#region 8. FEED RENDERING & DELETION TRACES
// ============================================================================

function renderFeed(isNewSend) {
  const frag = document.createDocumentFragment();
  if (!messages.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'margin:auto;text-align:center;color:var(--muted);font-size:12px;padding:24px;font-style:italic';
    empty.textContent = 'No messages yet.';
    frag.appendChild(empty);
    chatFeed.replaceChildren(frag);
    return;
  }

  messages.forEach(function(m, idx) {
    const wrap = document.createElement('div');
    wrap.className = 'msg-wrap ' + (m.sender === activeSender ? 'mine' : 'theirs');
    const meta = document.createElement('div');
    meta.className = 'meta-line';
    const strong = document.createElement('strong');
    strong.textContent = m.sender;
    meta.append(strong, document.createTextNode(' • ' + m.caption));

    const balloonEl = createBalloonDOM(m, false);
    const xrayEl = document.createElement('div');
    xrayEl.className = 'xray-pill';
    xrayEl.textContent = m.xrayText || ('🔍 X-Ray: ' + m.caption);

    const triggerInkPulse = function() {
      if (balloonEl._pulseTimer) {
        clearTimeout(balloonEl._pulseTimer);
        balloonEl._pulseTimer = null;
      }
      balloonEl.classList.remove('ink-pulse');
      void balloonEl.offsetWidth;
      balloonEl.classList.add('ink-pulse');
      balloonEl._pulseTimer = setTimeout(function() {
        balloonEl.classList.remove('ink-pulse');
        balloonEl._pulseTimer = null;
      }, 1450);
    };

    balloonEl.addEventListener('click', function() {
      triggerHaptic(15, true);
      xrayEl.classList.toggle('open');
      triggerInkPulse();
    });

    xrayEl.addEventListener('click', function() {
      triggerHaptic(15, true);
      xrayEl.classList.remove('open');
      triggerInkPulse();
    });

    wrap.append(meta, balloonEl, xrayEl);
    frag.appendChild(wrap);

    const hasEmotionalCharge = (m.style === 'balloon-warm' || m.style === 'balloon-urgent' || m.style === 'balloon-whisper' || m.style === 'balloon-mixed');

    if (isNewSend && idx === messages.length - 1) {
      if (hasEmotionalCharge) {
        setTimeout(function() {
          triggerInkPulse();
        }, 20);
      } else {
        wrap.classList.add('msg-send-simple');
      }
    }
  });
  chatFeed.replaceChildren(frag);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function resetDraftState() {
  clearTimeout(state.deletionCheckTimer);
  state.totalKeys = 0;
  state.keyTimes = [];
  state.dwellTimes = [];
  state.flightTimes = [];
  state.activeKeyDowns = {};
  state.lastKeyUpTime = null;
  state.backspaceTimes = [];
  state.lastBackspaceActionTime = null;
  state.franticStreakActive = false;
  state.hapticPoolFiredForSlot = {};
  state.lastInputTime = null;
  state.lastKeyTime = null;
  state.firstKeyTime = null;
  state.lastNonSpaceInputTime = null;
  state.spacePauseAnchorTime = null;
  state.lastInputLength = 0;
  state.sendPressTime = null;
  state.sendPressure = 0;
  state.stareMs = 0;
  state.accumulatedStareMs = 0;
  state.lastActiveKeyboardTime = null;
  state.accumulatedSpacePauseMs = 0;
  state.accumulatedWordHoldMs = 0;
  state.keyboardDismissals = 0;
  state.maxBurstMs = Infinity;
  state.prevTokenCount = 0;
  state.peakWordsBySlot = [];
  state.ghostsAtSlot = {};
  state.wordMeta = {};
  state.pauseGapsBySlot = {};
  state.lockedPauseBySlot = {};
  state.livePendingPauseMs = 0;
  state.lastPreviewRenderedText = null;
  state.lastPreviewArchetype = null;
  if (inputBox) inputBox.style.height = '38px';
}

let maxObservedViewportHeight = (window.visualViewport && window.visualViewport.height) || window.innerHeight || 800;

function isVirtualKeyboardOpen() {
  const isInputFocused = (document.activeElement === inputBox);
  if (!isInputFocused) return false;

  const currentHeight = (window.visualViewport && window.visualViewport.height) || window.innerHeight;

  // On touch/mobile devices or when visualViewport contracts significantly:
  if (state.isMobileMode || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) {
    return currentHeight < (maxObservedViewportHeight * 0.80);
  }

  // On desktop browser: focused input with active window focus
  return document.hasFocus();
}

function evaluateKeyboardState() {
  const currentHeight = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
  const isInputFocused = (document.activeElement === inputBox);

  // When input is unfocused or keyboard is closed, track the uncontracted baseline
  if (!isInputFocused) {
    maxObservedViewportHeight = Math.max(maxObservedViewportHeight, currentHeight);
  }

  const isNowOpen = isVirtualKeyboardOpen();
  const wasOpen = state.isKeyboardOpen;
  const now = performance.now();

  if (wasOpen && !isNowOpen) {
    // Transition: KEYBOARD DOWN ("Pen Down")
    if (state.lastActiveKeyboardTime != null) {
      state.accumulatedStareMs += Math.max(0, now - state.lastActiveKeyboardTime);
      state.lastActiveKeyboardTime = null;
    }
    if (state.spacePauseAnchorTime != null) {
      state.accumulatedSpacePauseMs += Math.max(0, now - state.spacePauseAnchorTime);
      state.spacePauseAnchorTime = null;
    }
    if (state.lastNonSpaceInputTime != null && !endsWithSpace(inputBox.value)) {
      state.accumulatedWordHoldMs += Math.max(0, now - state.lastNonSpaceInputTime);
      state.lastNonSpaceInputTime = null;
    }
    state.keyboardDismissals++;
  } else if (!wasOpen && isNowOpen) {
    // Transition: KEYBOARD UP ("Pen Resumed")
    state.lastActiveKeyboardTime = now;
    if (endsWithSpace(inputBox.value)) {
      state.spacePauseAnchorTime = now;
    } else {
      state.lastNonSpaceInputTime = now;
    }
  }

  state.isKeyboardOpen = isNowOpen;
  updateHUD();
}

function startStareClock() {
  clearInterval(state.stareTimer);

  state.stareTimer = setInterval(function() {
    evaluateKeyboardState();

    const raw = inputBox.value;
    if (!raw.trim() || state.lastInputTime == null) {
      state.accumulatedStareMs = 0;
      state.lastActiveKeyboardTime = null;
      state.stareMs = 0;
      state.livePendingPauseMs = 0;
      state.accumulatedSpacePauseMs = 0;
      updateHUD();
      return;
    }

    const now = performance.now();

    // Accumulate stare time only while keyboard is active
    if (state.isKeyboardOpen && state.lastActiveKeyboardTime != null) {
      const activeDelta = Math.max(0, now - state.lastActiveKeyboardTime);
      state.stareMs = state.accumulatedStareMs + activeDelta;
    } else {
      // Pen Down: Frozen at accumulated value
      state.stareMs = state.accumulatedStareMs;
    }

    if (endsWithSpace(raw)) {
      if (state.isKeyboardOpen && state.spacePauseAnchorTime != null) {
        state.livePendingPauseMs = state.accumulatedSpacePauseMs + Math.max(0, now - state.spacePauseAnchorTime);
      } else {
        state.livePendingPauseMs = state.accumulatedSpacePauseMs;
      }
    } else {
      state.livePendingPauseMs = 0;
      state.accumulatedSpacePauseMs = 0;
    }

    renderPreview(true);
  }, 100);
}

function commitDeletionTracesNow() {
  const raw = inputBox.value;
  const tokens = tokenize(raw);
  const targetSlot = tokens.length;
  const frantic = isRecentBackspaceBurstFrantic(performance.now());

  if (targetSlot > 0) {
    delete state.pauseGapsBySlot[targetSlot - 1];
    delete state.lockedPauseBySlot[targetSlot - 1];
    if (state.wordMeta[targetSlot - 1]) {
      state.wordMeta[targetSlot - 1].poolAfter = false;
    }
  }

  const newlyErased = [];
  if (tokens.length < state.prevTokenCount) {
    const multiWordWipe = (state.prevTokenCount - tokens.length) >= 2 || Boolean(state.ghostsAtSlot[state.prevTokenCount]);
    for (let i = tokens.length; i < state.prevTokenCount; i++) {
      const erased = state.peakWordsBySlot[i];
      const normErased = normalizeToken(erased);
      const keepWord = erased && (normErased.length >= 2 || (multiWordWipe && normErased.length >= 1));
      if (keepWord) {
        const isLastSurvivingAutocorrect = (i === tokens.length && tokens.length > 0 && isAutocorrectExpansion(tokens[tokens.length - 1], erased));
        if (!isLastSurvivingAutocorrect) {
          newlyErased.push({ text: erased, type: frantic ? 'scribble' : 'single' });
        }
      }
      state.peakWordsBySlot[i] = '';
    }
  }

  const strandedRight = [];
  const allGhostKeys = Object.keys(state.ghostsAtSlot).map(Number).sort(function(a, b) { return a - b; });
  allGhostKeys.forEach(function(slotKey) {
    if (slotKey > targetSlot) {
      const arr = state.ghostsAtSlot[slotKey] || [];
      arr.forEach(function(g) {
        if (frantic) g.type = 'scribble';
        strandedRight.push(g);
      });
      delete state.ghostsAtSlot[slotKey];
    }
  });

  if (newlyErased.length || strandedRight.length) {
    const existingHere = state.ghostsAtSlot[targetSlot] || [];
    if (frantic) {
      existingHere.forEach(function(g) { g.type = 'scribble'; });
    }
    state.ghostsAtSlot[targetSlot] = existingHere.concat(newlyErased, strandedRight);
  } else if (frantic && state.ghostsAtSlot[targetSlot]) {
    state.ghostsAtSlot[targetSlot].forEach(function(g) { g.type = 'scribble'; });
  }

  if (tokens.length > 0 && !endsWithSpace(raw)) {
    const activeIdx = tokens.length - 1;
    const rightGhosts = state.ghostsAtSlot[tokens.length];
    if (rightGhosts && rightGhosts.length) {
      if (!state.ghostsAtSlot[activeIdx]) state.ghostsAtSlot[activeIdx] = [];
      const oldPeak = state.peakWordsBySlot[activeIdx];
      if (oldPeak && normalizeToken(oldPeak).length >= 2 && !isAutocorrectExpansion(tokens[activeIdx], oldPeak) && tokens[activeIdx] !== oldPeak) {
        state.ghostsAtSlot[activeIdx].push({ text: oldPeak, type: frantic ? 'scribble' : 'single' });
        state.peakWordsBySlot[activeIdx] = tokens[activeIdx];
      }
      rightGhosts.forEach(function(g) {
        if (frantic) g.type = 'scribble';
        state.ghostsAtSlot[activeIdx].push(g);
      });
      delete state.ghostsAtSlot[tokens.length];
    }
  }

  state.prevTokenCount = tokens.length;
  renderPreview();
}

const UIHelper = Object.freeze({
  createBalloonDOM,
  buildDraftMessage,
  renderInkWord,
  renderStretchedWord,
  updateHUD,
  renderPreview,
  renderFeed,
  resetDraftState,
  startStareClock,
  commitDeletionTracesNow
});
//#endregion 8. FEED RENDERING & DELETION TRACES

// ============================================================================
//#region 9. HARDWARE SENSORS & INPUT EVENT LISTENERS
// ============================================================================

function onDeviceMotion(e) {
  const acc = e.acceleration || e.accelerationIncludingGravity;
  if (!acc || typeof acc.z !== 'number') return;
  if (state.lastZAccel != null) {
    const jolt = Math.abs(acc.z - state.lastZAccel);
    state.recentMotionJolt = Math.max(state.recentMotionJolt * 0.82, jolt);
  }
  state.lastZAccel = acc.z;
}

function onInput(e) {
  if (inputBox) {
    inputBox.style.height = 'auto';
    inputBox.style.height = Math.min(115, Math.max(38, inputBox.scrollHeight)) + 'px';
  }
  const now = performance.now();
  const input = inputBox.value;
  const prevLen = state.lastInputLength || 0;
  const charDiff = input.length - prevLen;
  const delta = state.lastInputTime == null ? 150 : now - state.lastInputTime;
  const previousSpaceAnchor = state.spacePauseAnchorTime;
  state.lastInputTime = now;
  state.accumulatedStareMs = 0;
  state.stareMs = 0;
  if (state.isKeyboardOpen) {
    state.lastActiveKeyboardTime = now;
  }

  const inputType = (e && e.inputType) ? e.inputType : '';
  const isDeletion = charDiff < 0;

  if (isDeletion) {
    state.lastBackspaceActionTime = now;
    state.spacePauseAnchorTime = null;
    state.lastNonSpaceInputTime = now;
    state.livePendingPauseMs = 0;

    const deletedChars = Math.abs(charDiff);
    state.totalKeys += Math.min(deletedChars, 6);

    if (deletedChars >= 5 || inputType === 'deleteWordBackward') {
      state.franticStreakActive = true;
    }

    if (inputType === 'deleteContentBackward' || deletedChars <= 2) {
      const lastBksp = state.backspaceTimes.length ? state.backspaceTimes[state.backspaceTimes.length - 1] : 0;
      if (now - lastBksp >= 18) {
        state.backspaceTimes.push(now);
        if (state.backspaceTimes.length > 16) state.backspaceTimes.shift();
      }
      if (isRecentBackspaceBurstFrantic(now)) {
        state.franticStreakActive = true;
      }
    }

    if (state.franticStreakActive) {
      triggerHaptic([50, 30, 80]);
      triggerPreviewCardShake();
    } else {
      triggerHaptic(32);
    }
  } else if (charDiff > 0) {
    state.franticStreakActive = false;
    state.totalKeys += charDiff === 1 ? 1 : Math.min(charDiff, 4);
  }
  state.lastInputLength = input.length;

  const isSwipeOrAutocomplete = Math.abs(charDiff) > 1 && delta < 45;

  // Mobile Z-Axis Accelerometer Jolt -> Uncapped Force up to 300ms
  if (state.isMobileMode && state.recentMotionJolt > 0.06) {
    const syntheticDwell = Math.min(300, Math.max(55, Math.round(62 + state.recentMotionJolt * 45)));
    state.dwellTimes.push(syntheticDwell);
    if (state.dwellTimes.length > 60) state.dwellTimes.shift();
    if (syntheticDwell >= 135) {
      triggerHaptic(30);
    }
    state.recentMotionJolt = 0;
  }

  const clamped = Math.min(Math.max(delta, 50), 350);
  const pct = Math.round(100 - ((clamped - 50) / 300) * 85);
  if (pulseFill) {
    pulseFill.style.width = pct + '%';
    pulseFill.style.backgroundColor = pct > 70 ? '#fb7185' : pct < 35 ? '#818cf8' : '#34d399';
  }

  if (state.firstKeyTime == null) state.firstKeyTime = now;

  if (charDiff > 0 && state.lastKeyTime != null && !isSwipeOrAutocomplete && delta >= CONFIG.minHumanTapDeltaMs && delta < 1000) {
    state.keyTimes.push(delta);
    if (state.keyTimes.length > 60) state.keyTimes.shift();
    state.maxBurstMs = Math.min(state.maxBurstMs, delta);
  }
  state.lastKeyTime = now;

  const tokens = tokenize(input);

  if (!isDeletion) {
    tokens.forEach(function(tok, idx) {
      const peak = state.peakWordsBySlot[idx] || '';
      if (tok.length >= peak.length || isAutocorrectExpansion(tok, peak)) {
        state.peakWordsBySlot[idx] = tok;
      }
      if (state.ghostsAtSlot[idx]) {
        state.ghostsAtSlot[idx] = state.ghostsAtSlot[idx].filter(function(g) {
          return !isAutocorrectExpansion(tok, g.text);
        });
        if (!state.ghostsAtSlot[idx].length) delete state.ghostsAtSlot[idx];
      }
    });
  }

  if (tokens.length > state.prevTokenCount && state.prevTokenCount > 0) {
    const slot = state.prevTokenCount - 1;
    const recentlyBackspaced = state.lastBackspaceActionTime != null && (now - state.lastBackspaceActionTime) < 1800;
    const hasGhostsOnNewSlot = Boolean(state.ghostsAtSlot[tokens.length - 1] && state.ghostsAtSlot[tokens.length - 1].length);

    if (!recentlyBackspaced && !hasGhostsOnNewSlot && previousSpaceAnchor != null) {
      const boundaryPauseMs = Math.max(0, now - previousSpaceAnchor);
      const lockedGap = Math.max(state.pauseGapsBySlot[slot] || 0, boundaryPauseMs);
      state.pauseGapsBySlot[slot] = lockedGap;

      const meta = state.wordMeta[slot] || { weight: 450, fastGlide: false, heavyForce: false, peakForce: 0, punch: false, poolAfter: false };
      state.wordMeta[slot] = Object.assign({}, meta, {
        poolAfter: Boolean(meta.poolAfter || lockedGap >= CONFIG.poolDelayMs)
      });
    }
    state.prevTokenCount = tokens.length;
  }

  clearTimeout(state.deletionCheckTimer);
  if (tokens.length < state.prevTokenCount || (tokens.length > 0 && state.ghostsAtSlot[tokens.length])) {
    if (tokens.length === 0) {
      commitDeletionTracesNow();
    } else {
      state.deletionCheckTimer = setTimeout(commitDeletionTracesNow, 55);
    }
  } else {
    state.prevTokenCount = tokens.length;
  }

  Object.keys(state.wordMeta).forEach(function(key) {
    if (Number(key) >= tokens.length) delete state.wordMeta[key];
  });
  Object.keys(state.pauseGapsBySlot).forEach(function(key) {
    if (Number(key) >= tokens.length) delete state.pauseGapsBySlot[key];
  });
  Object.keys(state.lockedPauseBySlot).forEach(function(key) {
    if (Number(key) >= tokens.length) delete state.lockedPauseBySlot[key];
  });

  if (tokens.length > 0) {
    if (endsWithSpace(input)) {
      if (!isDeletion && state.spacePauseAnchorTime == null) {
        state.spacePauseAnchorTime = now;
        state.accumulatedSpacePauseMs = 0;
      }
    } else {
      state.spacePauseAnchorTime = null;
      state.accumulatedSpacePauseMs = 0;
      state.accumulatedWordHoldMs = 0;
      state.livePendingPauseMs = 0;
      const idx = tokens.length - 1;
      const prev = state.wordMeta[idx] || { weight: 450, fastGlide: false, heavyForce: false, peakForce: 0, punch: false, poolAfter: false };
      const lastDwell = state.dwellTimes.length ? state.dwellTimes[state.dwellTimes.length - 1] : 70;
      const wordPeakForce = Math.max(prev.peakForce || 0, lastDwell);
      const hThresh = activeHeavyDwellThreshold();
      const isHeavyForce = wordPeakForce >= hThresh;
      const isFastGlide = (!isSwipeOrAutocomplete && delta >= CONFIG.minHumanTapDeltaMs && delta < activeBurstThreshold()) || prev.fastGlide;
      const allCaps = isWordAllCaps(tokens[idx]);

      let computedWeight = 450;
      if (isHeavyForce || allCaps) computedWeight = 900;
      else if (isFastGlide) computedWeight = 550;
      else if (pct < 35) computedWeight = 350;

      state.wordMeta[idx] = {
        weight: computedWeight,
        fastGlide: isFastGlide,
        heavyForce: isHeavyForce,
        peakForce: wordPeakForce,
        punch: allCaps || prev.punch,
        poolAfter: prev.poolAfter
      };
      state.lastNonSpaceInputTime = now;
    }
  }

  renderPreview();
}

function isNonLetterKey(e) {
  const k = e.key || '';
  const c = e.code || '';
  if (k === ' ' || c === 'Space' || k === 'Enter' || k === 'Backspace' || k === 'Delete' || k === 'Shift' || k === 'Control' || k === 'Alt' || k === 'Meta' || k === 'Tab' || k === 'CapsLock') {
    return true;
  }
  return k.length > 1;
}

function onKeydown(e) {
  const now = performance.now();
  const code = e.code || e.key;
  const isIme = (e.key === 'Unidentified' || e.keyCode === 229);
  if (isIme) state.isMobileMode = true;

  const badge = byId('modeBadge');
  if (badge) {
    badge.textContent = state.isMobileMode ? 'MOBILE THUMB MODE' : 'DESKTOP MODE';
  }

  // Only record key-down dwell start on actual printable character keys (ignores Space/Backspace/Shift holds!)
  if (!isIme && !e.repeat && !isNonLetterKey(e) && !state.activeKeyDowns[code]) {
    state.activeKeyDowns[code] = now;
    if (state.lastKeyUpTime != null) {
      const flight = now - state.lastKeyUpTime;
      if (flight >= CONFIG.minHumanTapDeltaMs && flight < 1000) {
        state.flightTimes.push(flight);
        if (state.flightTimes.length > 60) state.flightTimes.shift();
      }
    }
  }

  if (e.key === 'Backspace' || e.key === 'Delete') {
    state.lastBackspaceActionTime = now;
    const lastBksp = state.backspaceTimes.length ? state.backspaceTimes[state.backspaceTimes.length - 1] : 0;
    if (now - lastBksp >= 18) {
      state.backspaceTimes.push(now);
      if (state.backspaceTimes.length > 16) state.backspaceTimes.shift();
    }
    if (isRecentBackspaceBurstFrantic(now)) {
      state.franticStreakActive = true;
      triggerHaptic([50, 30, 80]);
      triggerPreviewCardShake();
    } else {
      triggerHaptic(30);
    }
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    if (state.isMobileMode || isTouchDevice || /android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
      return; // On mobile / Android keyboard, let Enter insert newline into textarea
    }
    e.preventDefault();
    sendNow();
  }
}

function onKeyup(e) {
  const now = performance.now();
  const code = e.code || e.key;
  const downTime = state.activeKeyDowns[code];
  if (downTime != null) {
    const dwell = now - downTime;
    delete state.activeKeyDowns[code];
    // Cap desktop keystroke dwell at 220ms so long key-holds never create fake 700ms force spikes!
    if (dwell >= 18 && dwell <= 220) {
      state.dwellTimes.push(dwell);
      if (state.dwellTimes.length > 60) state.dwellTimes.shift();
      const tokens = tokenize(inputBox.value);
      const hThresh = activeHeavyDwellThreshold();
      if (tokens.length > 0 && !endsWithSpace(inputBox.value)) {
        const idx = tokens.length - 1;
        const meta = state.wordMeta[idx];
        if (meta) {
          meta.peakForce = Math.max(meta.peakForce || 0, dwell);
          if (meta.peakForce >= hThresh) {
            meta.heavyForce = true;
            meta.weight = 900;
          }
        }
      }
    }
  }
  state.lastKeyUpTime = now;
  renderPreview();
}

function onSendPointerDown(e) {
  state.sendPressTime = performance.now();
  const p = typeof e.pressure === 'number' && e.pressure > 0 ? e.pressure : 0;
  const radiusBoost = (e.width && e.width > 18) ? Math.min(0.4, (e.width - 18) / 40) : 0;
  state.sendPressure = Math.max(p, radiusBoost);
  triggerHaptic([25, 35, 55], true);
}

function onSendPointerUp(e) {
  if (state.sendPressTime != null) {
    const holdMs = performance.now() - state.sendPressTime;
    const pressureBonus = state.sendPressure > 0.45 ? 35 : 0;
    if (holdMs >= 18 && holdMs <= 260) {
      state.dwellTimes.push(holdMs + pressureBonus);
      if (state.dwellTimes.length > 60) state.dwellTimes.shift();
    }
    state.sendPressTime = null;
  }
}

function sendNow() {
  const rawText = inputBox.value;
  const hasGhosts = Object.values(state.ghostsAtSlot).some(function(a) { return a && a.length; });
  if (!rawText.trim() && !hasGhosts) return;

  clearTimeout(state.deletionCheckTimer);
  commitDeletionTracesNow();

  // Finalize active stare duration before committing snapshot
  if (state.isKeyboardOpen && state.lastActiveKeyboardTime != null) {
    state.accumulatedStareMs += Math.max(0, performance.now() - state.lastActiveKeyboardTime);
    state.lastActiveKeyboardTime = null;
  }
  state.stareMs = state.accumulatedStareMs;

  const draft = buildDraftMessage(false);
  const physical = physicalAnalysis();
  const structural = structuralAnalysis(tokenize(rawText), rawText);
  const pSpace = pauseSpacing(false);

  const paceStr = physical.medianItdMs ? Math.round(physical.medianItdMs) + 'ms' : 'steady';
  const avgForce = physical.meanDwellMs ? Math.round(physical.meanDwellMs) + 'ms avg' : 'normal';
  const lastWord = (draft.words && draft.words.length) ? draft.words[draft.words.length - 1] : null;
  const avgWght = (draft.words && draft.words.length)
    ? Math.round(draft.words.reduce(function(acc, w) { return acc + ((w.axes && w.axes.weight) || 450); }, 0) / draft.words.length)
    : 450;
  const activeSlnt = (lastWord && lastWord.axes) ? lastWord.axes.slant : 0;
  const activeCasl = (lastWord && lastWord.axes) ? lastWord.axes.casual : 0;
  const renderedFontAxes = { wght: avgWght, slnt: activeSlnt, casl: activeCasl };

  const xrayText = '🔍 X-Ray: Pace ' + paceStr + ' · Force ' + avgForce + ' (wght ' + avgWght + ', slnt ' + activeSlnt + '°)';

  const snapshot = {
    text: rawText,
    sender: activeSender,
    decision: draft,
    physical: physical,
    structural: structural,
    stareMs: state.stareMs,
    netActiveStareMs: state.stareMs,
    keyboardDismissals: state.keyboardDismissals || 0,
    pauseSpacing: pSpace,
    totalKeys: state.totalKeys,
    renderedFontAxes: renderedFontAxes,
    keyTimes: state.keyTimes.slice(),
    backspaceTimes: state.backspaceTimes.slice(),
    timestamp: new Date().toISOString()
  };

  state.reportSnapshot = snapshot;
  state.reportHistory.push(snapshot);

  messages.push(Object.assign({ sender: activeSender, xrayText: xrayText }, draft));
  inputBox.value = '';
  resetDraftState();
  renderPreview();
  renderFeed(true);
  inputBox.focus();
}

function setSender(user) {
  activeSender = user;
  byId('btnAlex').classList.toggle('active', user === 'Alex');
  byId('btnSam').classList.toggle('active', user === 'Sam');
  renderFeed();
}
//#endregion 9. HARDWARE SENSORS & INPUT EVENT LISTENERS

// ============================================================================
//#region 10. UI CONTROLS, DIAGNOSTICS & INITIALIZATION
// ============================================================================

function toggleHud() {
  state.hudCollapsed = !state.hudCollapsed;
  const hud = byId('hudContainer');
  const btn = byId('hudBtn');
  if (hud) hud.classList.toggle('collapsed', state.hudCollapsed);
  if (btn) btn.classList.toggle('active-toggle', !state.hudCollapsed);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function clearChat() {
  triggerHaptic(35, true);
  messages = [];
  state.reportHistory = [];
  renderFeed();
  showToast('🗑️ Chat feed cleared');
}

function formatReportEntry(entry, index) {
  const draft = entry.decision;
  const p = entry.physical || {};
  const sem = draft.semantic || { dominant: 'unresolved', senticValence: 0, confidence: 0, vectors: { warmth: 0, tension: 0, heaviness: 0 }, hits: [] };
  const liwc = draft.liwc || { pct: 0, firstPersonCount: 0 };
  const ev = (draft.expression && draft.expression.vectors) ? draft.expression.vectors : { elongation: 0, uppercase: 0, punctuation: 0, repetition: 0, emoji: 0 };
  const phys = draft.physics || { lineTiltDeg: 0, waveAmp: 0, jitterPx: 0, slantDeg: 0, fadeRate: 0, borderPx: 1.5, neuromotorState: 'baseline' };
  const route = draft.reason || 'unresolved-direct';
  const q1Text = Number.isFinite(p.q1ItdMs) ? Math.round(p.q1ItdMs) + 'ms' : 'N/A';
  const medText = p.medianItdMs ? Math.round(p.medianItdMs) + 'ms' : 'N/A';
  const q3Text = p.q3ItdMs ? Math.round(p.q3ItdMs) + 'ms' : 'N/A';
  const dwellText = p.avgDwellMs ? Math.round(p.avgDwellMs) + 'ms (peak: ' + Math.round(p.peakDwellMs || p.avgDwellMs) + 'ms)' : 'N/A';
  const time = entry.timestamp
    ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'session';

  const lexicalList = sem.lexicalHits || (sem.hits || []).filter(function(h) { return h.evidence === 'semantic'; });
  const semanticHits = lexicalList
    .map(function(h) { return h.token + ' -> ' + h.family + (h.negated ? ' (negated)' : '') + (h.butWeight && h.butWeight !== 1 ? ' (x' + h.butWeight + ')' : ''); })
    .join(', ') || 'none';

  const emojiList = sem.emojiHits || (sem.hits || []).filter(function(h) { return h.evidence === 'emoji'; });
  const emojiHits = emojiList
    .map(function(h) { return h.token + ' -> ' + h.family; })
    .join(', ') || 'none';

  const senderName = entry.sender || activeSender;
  const safeText = String(entry.text || '').replace(/"/g, '\\"');
  const activeMeaningList = (draft.meaning && draft.meaning.activeList && draft.meaning.activeList.length)
    ? draft.meaning.activeList.join(', ')
    : 'none';
  const arcInfo = (sem.clauseArc && sem.clauseArc.distinctTones && sem.clauseArc.distinctTones.length)
    ? sem.clauseArc.distinctTones.join(' -> ')
    : 'single-tone';

  return [
    '### Message ' + (index + 1) + ' — ' + senderName + ' — ' + time,
    '- **User Text Input:** "' + safeText + '"',
    '- **Observable Summary:** ' + draft.caption,
    '- **Visual Bubble Archetype:** `' + draft.style + '`',
    '- **Clause Trajectory Arc:** `' + arcInfo + '` (`' + ((sem.clauseArc && sem.clauseArc.clauseCount) || 1) + '` clause(s))',
    '',
    '#### Deterministic Psycholinguistic & Neuromotor Field:',
    '- **1. Meaning Cues:** `' + ((draft.meaning && draft.meaning.type) || 'statement') + '` (active: ' + activeMeaningList + ')',
    '- **2. SenticNet & VADER Affect:** dominant=`' + draft.family + '` · senticValence=`' + (sem.senticValence || 0) + '` · warmth=`' + (phys.effectiveWarmth || sem.vectors.warmth).toFixed(2) + '` · tension=`' + (phys.effectiveTension || sem.vectors.tension).toFixed(2) + '` · heaviness=`' + (phys.effectiveHeaviness || sem.vectors.heaviness).toFixed(2) + '`',
    '- **3. LIWC Self-Focus Index:** `' + liwc.pct + '%` (`' + liwc.firstPersonCount + '` first-person singular pronouns)',
    '- **4. Expression Field (VADER Heuristics):** style=`' + ((draft.expression && draft.expression.style) || 'plain') + '` · elongation=`' + ev.elongation.toFixed(2) + '` · caps=`' + ev.uppercase.toFixed(2) + '` · punct=`' + ev.punctuation.toFixed(2) + '`',
    '- **5. Physics Output:** wholeLineTilt=`' + (phys.lineTiltDeg || 0).toFixed(2) + 'deg` · borderThickness=`' + (phys.borderPx || 1.5) + 'px` · waveAmp=`' + phys.waveAmp.toFixed(2) + 'px` · jitter=`' + phys.jitterPx.toFixed(2) + 'px`',
    '- **Lexical Affect Signals:** ' + semanticHits,
    '- **Emoji Signals:** ' + emojiHits,
    '',
    '#### Mobile ITD Quartiles & Neuromotor Telemetry:',
    '- **Device Mode:** `' + (state.isMobileMode ? 'Mobile Touchscreen' : 'Desktop Hardware') + '`',
    '- **Force / Dwell Equivalent:** `' + dwellText + '`',
    '- **ITD Quartiles (Q1 / Median / Q3):** `' + q1Text + ' / ' + medText + ' / ' + q3Text + '`',
    '- **Quartile Dispersion (QCD):** `' + Number(p.qcd || 0).toFixed(2) + '`',
    '- **Edit Churn Ratio:** `' + Number(p.churn || 0).toFixed(1) + 'x`',
    '- **Post-Type Stare Hesitation:** `' + ((entry.stareMs || 0) / 1000).toFixed(1) + 's`' + ((entry.keyboardDismissals && entry.keyboardDismissals > 0) ? ' (' + entry.keyboardDismissals + ' pen-down pauses)' : ''),
    '- **Longest Word Pause:** `' + Math.round(p.longestPauseMs || 0) + 'ms` (`' + Number(entry.pauseSpacing || 0) + 'px`)',
    '- **Rendered Variable Font Axes:** ' + (entry.renderedFontAxes ? '`wght: ' + entry.renderedFontAxes.wght + '` · `slnt: ' + entry.renderedFontAxes.slnt + '°` · `CASL: ' + entry.renderedFontAxes.casl.toFixed(2) + '`' : '`standard`'),
    '- **Active Signal Route:** `' + route + '`.'
  ].join('\n');
}

function makeReport() {
  const entries = state.reportHistory.slice();

  if (!entries.length) {
    return [
      '### Resonance v1 Diagnostic Report',
      '- **Conversation:** No messages have been submitted yet.',
      '',
      'Type and send a message to begin the session report.'
    ].join('\n');
  }

  const header = [
    '### Resonance v1 Signal Field Diagnostic Report',
    '- **Conversation Messages:** ' + entries.length,
    '- **Report Scope:** Entire committed conversation history',
    '',
    '## Conversation Transcript + Signal Field Telemetry'
  ].join('\n');

  return header + '\n\n' + entries.map(function(entry, i) { return formatReportEntry(entry, i); }).join('\n\n---\n\n');
}

async function copyReport() {
  triggerHaptic(25, true);
  const report = makeReport();
  try {
    await navigator.clipboard.writeText(report);
    showToast('📋 Diagnostic report copied');
  } catch (err) {
    const ta = document.createElement('textarea');
    ta.value = report;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    showToast(ok ? '📋 Diagnostic report copied' : 'Clipboard permission blocked');
  }
}

let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(function() {
    toast.classList.remove('show');
  }, 1800);
}

const DiagnosticHelper = Object.freeze({
  formatReportEntry,
  makeReport,
  copyReport,
  showToast,
  toggleHud,
  clearChat,
  setSender
});

// Master Unified Namespace (Access everything via Helper.<module>.<method>)
const Helper = Object.freeze({
  device: DeviceHelper,
  text: TextHelper,
  sentiment: SentimentHelper,
  biometrics: BiometricsHelper,
  ui: UIHelper,
  diagnostic: DiagnosticHelper
});

if (window.visualViewport) {
  const syncViewport = function() {
    const shell = byId('phoneShell');
    if (shell && window.innerWidth <= 480) {
      shell.style.height = window.visualViewport.height + 'px';
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }
    evaluateKeyboardState();
  };
  window.visualViewport.addEventListener('resize', syncViewport);
  window.visualViewport.addEventListener('scroll', syncViewport);
}

window.addEventListener('resize', evaluateKeyboardState);
window.addEventListener('orientationchange', function() {
  setTimeout(function() {
    maxObservedViewportHeight = (window.visualViewport && window.visualViewport.height) || window.innerHeight || 800;
    evaluateKeyboardState();
  }, 120);
});
document.addEventListener('visibilitychange', evaluateKeyboardState);
window.addEventListener('focus', evaluateKeyboardState);
window.addEventListener('blur', evaluateKeyboardState);
inputBox.addEventListener('focus', evaluateKeyboardState);
inputBox.addEventListener('blur', evaluateKeyboardState);

if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', onDeviceMotion, true);
}

inputBox.addEventListener('keydown', onKeydown);
inputBox.addEventListener('keyup', onKeyup);
inputBox.addEventListener('input', onInput);

const sendBtn = byId('sendBtn');
sendBtn.addEventListener('click', sendNow);
sendBtn.addEventListener('pointerdown', onSendPointerDown);
sendBtn.addEventListener('pointerup', onSendPointerUp);

const infoModal = byId('infoModal');
byId('infoBtn').addEventListener('click', function() {
  triggerHaptic(15, true);
  infoModal.classList.add('open');
});
byId('closeModalBtn').addEventListener('click', function() {
  infoModal.classList.remove('open');
});
infoModal.addEventListener('click', function(e) {
  if (e.target === infoModal) infoModal.classList.remove('open');
});

byId('hudBtn').addEventListener('click', toggleHud);
byId('clearBtn').addEventListener('click', clearChat);
byId('reportBtn').addEventListener('click', copyReport);
byId('btnAlex').addEventListener('click', function() { setSender('Alex'); });
byId('btnSam').addEventListener('click', function() { setSender('Sam'); });

// [Tactile Paper & Living Ink]: Theme Toggle Engine (Stationery Paper vs. Midnight Journal)
function applyTheme(theme) {
  document.body.dataset.theme = theme;
  const tBtn = byId('themeBtn');
  if (tBtn) {
    tBtn.textContent = theme === 'stationery' ? '📜 Paper' : '📓 Vellum';
    tBtn.title = 'Current Theme: ' + (theme === 'stationery' ? 'Stationery Paper (Tap for Journal)' : 'Midnight Journal (Tap for Paper)');
  }
  try {
    localStorage.setItem('resonance_theme', theme);
  } catch (err) {}
}

function toggleTheme() {
  triggerHaptic(15, true);
  const current = document.body.dataset.theme || 'stationery';
  const next = current === 'stationery' ? 'journal' : 'stationery';
  applyTheme(next);
  renderPreview();
  renderFeed();
}

const themeBtn = byId('themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', toggleTheme);
}

const savedTheme = (function() {
  try { return localStorage.getItem('resonance_theme') || 'stationery'; } catch (e) { return 'stationery'; }
})();
applyTheme(savedTheme);

renderFeed();
startStareClock();
//#endregion 10. UI CONTROLS, DIAGNOSTICS & INITIALIZATION
