// Assessment Engines: IRT (Rasch) + NLP + Vocab Profiler + AI

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const LC = { A1: "#22c55e", A2: "#84cc16", B1: "#eab308", B2: "#f97316", C1: "#ef4444", C2: "#a855f7" };
export const LL = { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Intermediate", C1: "Advanced", C2: "Mastery" };

// CEFR Vocabulary Profiles
const VP = {
  A1: "i you he she it we they am is are have has do does can my your go come like want need know see eat drink play read write live work study school home family mother father brother sister friend name old new big small good bad happy sad day night time yes no please thank hello book cat dog house car food water boy girl teacher bus".split(" "),
  A2: "was were did went saw had made could would should been because but also still already ago last next more most than better worse interesting important different same easy difficult usually sometimes never always often begin finish stop try help think believe remember forget understand explain happen become bring buy sell give take leave arrive travel visit vacation beach hotel movie music sport weather photo phone internet country language money clothes".split(" "),
  B1: "although however therefore while since unless whether might experience opportunity environment technology education government society culture research information knowledge situation relationship development discussion opinion reason example advantage improve achieve consider suggest recommend provide require include involve compare increase reduce develop create organize communicate participate encourage influence affect depend succeed fail manage prefer describe".split(" "),
  B2: "furthermore nevertheless consequently meanwhile whereas despite regarding overall essentially significantly approximately particularly eventually previously subsequently controversial sophisticated comprehensive substantial considerable remarkable inevitable fundamental contemporary demonstrate acknowledge emphasize interpret evaluate analyze contribute implement establish generate maintain illustrate distinguish justify acquire overcome enhance undermine implication perspective phenomenon hypothesis criteria alternative strategy framework".split(" "),
  C1: "notwithstanding albeit arguably predominantly inherently explicitly implicitly paradoxically empirically epistemological paradigm discourse rhetoric autonomy ambiguity coherence nuance synthesis articulate scrutinize extrapolate corroborate substantiate constitute facilitate encompass transcend reconcile proliferate exacerbate mitigate unprecedented ubiquitous pervasive salient pertinent intrinsic".split(" "),
};

// IRT Engine (Rasch Model)
export function irt(responses) {
  if (!responses.length) return { theta: -3, level: "A1", score: 0 };
  let theta = 0;
  for (let i = 0; i < 25; i++) {
    let g = 0;
    for (const r of responses) g += (r.c ? 1 : 0) - 1 / (1 + Math.exp(-(theta - r.d)));
    theta = Math.max(-3, Math.min(3, theta + 0.5 * g));
  }
  const level = theta < -1.5 ? "A1" : theta < -0.2 ? "A2" : theta < 0.8 ? "B1" : theta < 1.7 ? "B2" : theta < 2.4 ? "C1" : "C2";
  return { theta: Math.round(theta * 100) / 100, level, score: Math.round(Math.max(0, Math.min(100, (theta + 3) / 6 * 100))) };
}

// NLP Engine
export function nlpAnalyze(text) {
  if (!text?.trim()) return { wc: 0, ttr: 0, asl: 0, cr: 0, conn: 0, ct: [0, 0, 0], sub: 0, sc: 0, uw: 0 };
  const c = text.trim().toLowerCase();
  const w = c.split(/\s+/).filter(Boolean), wc = w.length, uw = new Set(w);
  const ttr = Math.round(uw.size / wc * 100) / 100;
  const sc = Math.max(text.split(/[.!?]+/).filter(s => s.trim()).length, 1);
  const asl = Math.round(wc / sc * 10) / 10;
  const cr = Math.round(w.filter(x => x.length > 6).length / wc * 100) / 100;
  const t1 = ["and", "but", "or", "so", "because", "then"].filter(x => c.includes(x)).length;
  const t2 = ["however", "although", "therefore", "while", "also", "instead", "moreover"].filter(x => c.includes(x)).length;
  const t3 = ["furthermore", "nevertheless", "consequently", "whereas", "despite", "notwithstanding"].filter(x => c.includes(x)).length;
  const sub = ["that", "which", "who", "where", "when", "if", "unless", "because", "since"].filter(x => c.includes(x)).length;
  return { wc, ttr, asl, cr, conn: t1 + t2 * 2 + t3 * 3, ct: [t1, t2, t3], sub, sc, uw: uw.size };
}

// Vocabulary Profiler
export function vocabProfile(text) {
  if (!text?.trim()) return { dist: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 }, highest: "A1", score: 0 };
  const words = [...new Set(text.trim().toLowerCase().replace(/[^a-z\s']/g, "").split(/\s+/).filter(w => w.length > 2))];
  const dist = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
  for (const w of words) { for (const lv of ["C1", "B2", "B1", "A2", "A1"]) { if (VP[lv]?.includes(w)) { dist[lv]++; break; } } }
  const highest = dist.C1 >= 2 ? "C1" : dist.B2 >= 2 ? "B2" : dist.B1 >= 3 ? "B1" : dist.A2 >= 3 ? "A2" : "A1";
  const t = words.length || 1;
  return { dist, highest, score: Math.min(100, Math.round((dist.A1 * 10 + dist.A2 * 25 + dist.B1 * 45 + dist.B2 * 70 + dist.C1 * 90) / t)) };
}

// Combined Assessment
export function assess(gI, rI, lI, nlpR, vocR, pronScore, cLvl, nLvl) {
  const ci = LEVELS.indexOf(cLvl), ni = LEVELS.indexOf(nLvl);
  // Writing score from NLP + Vocab
  let ws = 0;
  ws += Math.min(25, (nlpR.wc / (ci <= 1 ? 15 : 40)) * 25);
  ws += Math.min(20, nlpR.ttr * 30);
  ws += Math.min(15, nlpR.conn * 3);
  ws += Math.min(25, (LEVELS.indexOf(vocR.highest) / Math.max(ni, 1)) * 25);
  ws += Math.min(15, nlpR.cr * 50 + nlpR.sub * 2);
  ws = Math.round(Math.min(100, ws));

  const ps = pronScore || 0; // pronunciation score 0-100
  // Overall: Grammar 20%, Reading 20%, Listening 20%, Writing 20%, Speaking 20%
  const os = Math.round(gI.score * 0.2 + rI.score * 0.2 + lI.score * 0.2 + ws * 0.2 + ps * 0.2);
  const avgTheta = (gI.theta + rI.theta + lI.theta) / 3;
  const promoted = avgTheta >= (ci * 1.0 - 1.5) && os >= 50 && ws >= 20 && ps >= 25;
  return { verdict: promoted ? "PROMOTED" : "NEEDS_PRACTICE", os, g: gI, r: rI, l: lI, ws, ps, nlpR, vocR };
}

// MCER descriptors
const MCER = {
  A1: { g: "to be, simple present, basic questions", d: "Basic words" },
  A2: { g: "Past simple/continuous, will, can/must, comparatives", d: "Everyday topics" },
  B1: { g: "Present perfect, conditionals, passive voice", d: "Work/school topics" },
  B2: { g: "Mixed conditionals, inversions, gerund/infinitive", d: "Abstract topics" },
  C1: { g: "Subjunctive, advanced inversions, cleft sentences", d: "Complex academic" },
  C2: { g: "Complete mastery, stylistic variation", d: "Any text" },
};

// AI Interpreter
export async function aiInterpret(a, reg, cL, nL, txt, pronData) {
  const m = `You are a MCER/CEFR expert at ALGORITMO64 (Panama). Interpret pre-computed IRT+NLP+Pronunciation results. Student: ${reg.sName}, age ${reg.age}.

RESULTS: Verdict=${a.verdict}, Overall=${a.os}/100
Grammar IRT: theta=${a.g.theta}, level=${a.g.level}, score=${a.g.score}
Reading IRT: theta=${a.r.theta}, level=${a.r.level}, score=${a.r.score}
Listening IRT: theta=${a.l.theta}, level=${a.l.level}, score=${a.l.score}
Writing: score=${a.ws}, words=${a.nlpR.wc}, TTR=${a.nlpR.ttr}, vocab=${a.vocR.highest}
Speaking/Pronunciation: score=${a.ps}, word accuracy=${pronData?.matchRate || 0}%, words matched=${pronData?.matchedWords || 0}/${pronData?.totalWords || 0}
${pronData?.wordScores ? `Words with low scores: ${pronData.wordScores.filter(w => !w.matched).map(w => w.word).join(", ")}` : ""}
Eval: ${cL}->${nL}. MCER ${nL}: ${MCER[nL]?.g}

TONE: Warm, encouraging, age ${reg.age}. NEVER: "underdeveloped","deficient","poor","weak". Start with CAN do. All Spanish.

JSON only:
{"verdict":"${a.verdict}","overallScore":${a.os},"estimatedLevel":"CEFR level from IRT","grammarScore":${a.g.score},"grammarStrength":"Spanish","grammarGrowth":"Spanish","readingScore":${a.r.score},"readingStrength":"Spanish","readingGrowth":"Spanish","listeningScore":${a.l.score},"listeningStrength":"Spanish","listeningGrowth":"Spanish","writingScore":${a.ws},"writingStrength":"Spanish","writingGrowth":"Spanish","speakingScore":${a.ps},"speakingStrength":"pronunciation analysis Spanish","speakingGrowth":"specific pronunciation tips Spanish","summary":"3 sentences for parent Spanish","recommendations":["r1","r2","r3","r4"],"studentMessage":"warm message Spanish","methodology":"1 sentence about IRT+NLP+Pronunciation"}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: m }] }),
    });
    const d = await r.json();
    return JSON.parse((d.content?.map(b => b.text || "").join("") || "").replace(/```json|```/g, "").trim());
  } catch {
    const lvl = a.g.level;
    return {
      verdict: a.verdict, overallScore: a.os, estimatedLevel: lvl,
      grammarScore: a.g.score, grammarStrength: `Nivel IRT: ${a.g.level}`, grammarGrowth: `Practicar ${nL}`,
      readingScore: a.r.score, readingStrength: `Nivel IRT: ${a.r.level}`, readingGrowth: `Leer textos ${nL}`,
      listeningScore: a.l.score, listeningStrength: `Nivel: ${a.l.level}`, listeningGrowth: `Audio ${nL}`,
      writingScore: a.ws, writingStrength: `${a.nlpR.wc} palabras, TTR ${a.nlpR.ttr}`, writingGrowth: `Escritura ${nL}`,
      speakingScore: a.ps, speakingStrength: `Pronunciación: ${pronData?.matchRate || 0}% de palabras reconocidas`, speakingGrowth: "Practicar lectura en voz alta",
      summary: `${reg.sName}: nivel ${lvl}, score ${a.os}/100. ${a.verdict === "PROMOTED" ? `Listo para ${nL}.` : `Reforzar ${cL}.`}`,
      recommendations: ["Gramática diaria", "Leer 15 min/día", "Podcasts en inglés", "Leer en voz alta 10 min/día"],
      studentMessage: a.verdict === "PROMOTED" ? `¡Felicidades ${reg.sName}!` : `¡Sigue así ${reg.sName}!`,
      methodology: "IRT (Rasch) + NLP + Vocabulario MCER + Análisis de pronunciación",
    };
  }
}

// Storage (localStorage for webapp)
export function loadAll() { try { return JSON.parse(localStorage.getItem("a64-v7") || "[]"); } catch { return []; } }
export function saveResult(rec) { try { const e = loadAll(); e.push(rec); localStorage.setItem("a64-v7", JSON.stringify(e)); } catch {} }
export function delResult(id) { try { const e = loadAll().filter(r => r.id !== id); localStorage.setItem("a64-v7", JSON.stringify(e)); } catch {} }
