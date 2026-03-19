// Speaking & Pronunciation Engine
// Uses Web Speech API for recording + transcription
// Compares transcribed text to expected text for pronunciation scoring

export const SPEAK_TASKS = {
  A1: {
    read: [
      "My name is Carlos. I am thirteen years old.",
      "I like playing video games with my friends.",
      "She is a student at a big school.",
      "The cat is on the table near the window.",
    ],
    free: { prompt: "Tell me about yourself. What is your name? How old are you? What do you like?", hint: "Use: I am..., I like..., I have..." },
  },
  A2: {
    read: [
      "Last weekend I went to the beach with my family.",
      "She was cooking dinner when the phone rang.",
      "This movie is more interesting than the other one.",
      "I usually wake up early and take the bus to school.",
    ],
    free: { prompt: "What did you do last weekend? Where did you go?", hint: "Use past tense: I went..., I played..." },
  },
  B1: {
    read: [
      "If it rains tomorrow, we will stay at home and watch a movie.",
      "She has lived in London since two thousand and twenty.",
      "The cake was baked by my grandmother for my birthday.",
      "I think technology can help students learn more effectively.",
    ],
    free: { prompt: "Does technology help or hurt education? Give your opinion.", hint: "Use: I think, because, for example, however" },
  },
  B2: {
    read: [
      "Had I known about the meeting earlier, I would have prepared a presentation.",
      "Not until the research was completed did we understand the full implications.",
      "The project, which was due on Friday, has been postponed until next month.",
      "Despite the challenges, the team managed to deliver outstanding results.",
    ],
    free: { prompt: "Should social media be banned for teenagers? Argue both sides.", hint: "Use: on the other hand, furthermore, despite" },
  },
  C1: {
    read: [
      "Seldom have we seen such a remarkable transformation in educational methodology.",
      "Were it not for the unprecedented collaboration, the project would have failed entirely.",
      "It is imperative that every participant arrive on time for the proceedings.",
    ],
    free: { prompt: "How might AI transform education? Discuss benefits and risks.", hint: "Use: arguably, implications, whereas" },
  },
};

// Word-level comparison for pronunciation scoring
export function scorePronunciation(expected, transcribed) {
  if (!transcribed?.trim()) return { score: 0, wordScores: [], matchRate: 0, totalWords: 0, matchedWords: 0 };

  const normalize = (s) => s.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
  const exp = normalize(expected);
  const got = normalize(transcribed);

  if (!exp.length) return { score: 0, wordScores: [], matchRate: 0, totalWords: 0, matchedWords: 0 };

  // Word-by-word matching with fuzzy tolerance
  const wordScores = [];
  let matched = 0;
  let gotIdx = 0;

  for (let i = 0; i < exp.length; i++) {
    const target = exp[i];
    let bestScore = 0;
    let bestJ = -1;

    // Search nearby words in transcription (allow some reordering)
    for (let j = Math.max(0, gotIdx - 2); j < Math.min(got.length, gotIdx + 4); j++) {
      const sim = wordSimilarity(target, got[j]);
      if (sim > bestScore) { bestScore = sim; bestJ = j; }
    }

    if (bestScore >= 0.6) {
      matched++;
      gotIdx = bestJ + 1;
    }

    wordScores.push({ word: target, score: Math.round(bestScore * 100), matched: bestScore >= 0.6 });
  }

  const matchRate = matched / exp.length;
  // Score: 70% word accuracy + 30% fluency (did they produce enough words?)
  const fluency = Math.min(1, got.length / exp.length);
  const score = Math.round((matchRate * 70 + fluency * 30));

  return { score, wordScores, matchRate: Math.round(matchRate * 100), totalWords: exp.length, matchedWords: matched };
}

// Levenshtein-based word similarity (0 to 1)
function wordSimilarity(a, b) {
  if (a === b) return 1;
  const la = a.length, lb = b.length;
  if (!la || !lb) return 0;
  const maxLen = Math.max(la, lb);

  // Simple Levenshtein
  const dp = Array.from({ length: la + 1 }, (_, i) => Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return 1 - dp[la][lb] / maxLen;
}

// Speech Recognition wrapper
export class SpeechRecorder {
  constructor() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.supported = !!SR;
    this.SR = SR;
    this.recognition = null;
    this.transcript = "";
    this.isRecording = false;
  }

  start(onUpdate, onEnd) {
    if (!this.supported) return false;
    this.transcript = "";
    const r = new this.SR();
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = true;

    let final = "";
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      this.transcript = (final + interim).trim();
      onUpdate?.(this.transcript);
    };

    r.onerror = () => { this.isRecording = false; onEnd?.(this.transcript); };
    r.onend = () => { this.isRecording = false; onEnd?.(this.transcript); };

    this.recognition = r;
    r.start();
    this.isRecording = true;
    return true;
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
      this.isRecording = false;
    }
    return this.transcript;
  }
}
