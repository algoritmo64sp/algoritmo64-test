import { useState, useCallback, useRef, useEffect } from "react";
// Use namespace import to avoid build-time failures when named exports are stale in CI cache.
import * as Engines from "./engines.js";
import { QUESTIONS, WRITING_PROMPTS } from "./questions.js";
import { SPEAK_TASKS, scorePronunciation, SpeechRecorder } from "./speaking.js";

const {
  LEVELS, LC, LL, WRITING_RUBRIC, SPEAKING_RUBRIC,
  irt, nlpAnalyze, vocabProfile, assess, aiInterpret, loadAll, saveResult, delResult,
} = Engines;

const scoreWritingEvidence = Engines.scoreWritingEvidence || (() => ({
  score: 0,
  grammar: 0,
  range: 0,
  organization: 0,
  taskAchievement: 0,
  strengths: ["Evidence unavailable"],
  growth: ["Manual writing review needed"],
}));

const scoreSpeakingEvidence = Engines.scoreSpeakingEvidence || (() => ({
  score: 0,
  fluency: 0,
  lexical: 0,
  grammar: 0,
  pronunciation: 0,
  strengths: ["Evidence unavailable"],
  growth: ["Manual speaking review needed"],
}));
};
  return null;
}

// ═══ Styles ═══
const CSS = `
:root{--bg:#f8f9fc;--card:#fff;--card2:#f0f4ff;--text:#1a1d27;--muted:#6b7088;--accent:#3b6adb;--brd:#e2e5ee;--opt:#fff;--optB:#e2e5ee;--sel:#e8f0fe;--dis:#f0f1f4;--disT:#adb0be;--trk:#e2e5ee}
@media(prefers-color-scheme:dark){:root{--bg:#0f1117;--card:#1a1d27;--card2:#151821;--text:#e8eaf0;--muted:#8b8fa3;--accent:#6d9eff;--brd:#2a2d3a;--opt:#1a1d27;--optB:#2a2d3a;--sel:#1e2a42;--dis:#1a1d27;--disT:#4a4d5a;--trk:#2a2d3a}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes recording{0%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}70%{box-shadow:0 0 0 12px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}
*{box-sizing:border-box;margin:0}body{margin:0;background:var(--bg);font-family:${F}}button,input,textarea{font-family:${F}}
`;

// ═══ UI Components ═══
const Btn = ({ children, onClick, disabled, v = "p", style: s }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: "12px 28px", fontSize: 15, fontWeight: 700, border: v === "o" ? "1px solid var(--brd)" : "none",
    borderRadius: 11, cursor: disabled ? "not-allowed" : "pointer",
    background: disabled ? "var(--dis)" : v === "p" ? "linear-gradient(135deg,#3b82f6,#8b5cf6)" : v === "g" ? "#10b981" : v === "d" ? "#ef4444" : "var(--opt)",
    color: disabled ? "var(--disT)" : v === "o" ? "var(--text)" : "#fff", transition: "all 0.15s", ...s
  }}>{children}</button>
);
const Badge = ({ level, size = "md" }) => {
  const s = { sm: [11, 8, 2], md: [13, 12, 4], lg: [28, 28, 12], xl: [36, 36, 16] }[size];
  return <span style={{ display: "inline-block", fontSize: s[0], fontWeight: 700, padding: `${s[2]}px ${s[1]}px`, borderRadius: 10, color: "#fff", background: LC[level], fontFamily: F2 }}>{level}</span>;
};
const Bar = ({ value, color }) => (
  <div style={{ height: 8, background: "var(--trk)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
    <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: color, borderRadius: 4, transition: "width 0.8s" }} />
  </div>
);
const Inp = ({ label, value, onChange, ph, type = "text", req }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 5 }}>{label}{req && <span style={{ color: "#ef4444" }}> *</span>}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={ph}
      style={{ width: "100%", padding: "11px 14px", fontSize: 15, border: "2px solid var(--brd)", borderRadius: 10, background: "var(--card)", color: "var(--text)", outline: "none" }}
      onFocus={e => e.target.style.borderColor = "#3b82f6"} onBlur={e => e.target.style.borderColor = "var(--brd)"} />
  </div>
);
const Wrap = ({ children, fade }) => (
  <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 20px", opacity: fade ? 1 : 0, transition: "opacity 0.25s" }}>
    <style>{CSS}</style>{children}
  </div>
);

// ═══ Report Download ═══
function dlReport(r) {
  const a = r.analysis; const p = a.verdict === "PROMOTED"; const el = a.estimatedLevel || "A1";
  const sk = [["Grammar", a.grammarScore, a.grammarStrength, a.grammarGrowth], ["Reading", a.readingScore, a.readingStrength, a.readingGrowth], ["Listening", a.listeningScore, a.listeningStrength, a.listeningGrowth], ["Writing", a.writingScore, a.writingStrength, a.writingGrowth], ["Speaking", a.speakingScore, a.speakingStrength, a.speakingGrowth]];
  const h = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte ${r.reg.sName}</title><style>*{box-sizing:border-box;margin:0}body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1d27;line-height:1.6}h1{font-size:20px}h2{font-size:16px;margin:20px 0 10px;border-bottom:2px solid #eee;padding-bottom:4px}.s{color:#666;font-size:12px;margin-bottom:20px}.g{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}.g div{padding:10px;border:1px solid #eee;border-radius:6px}.g label{font-size:10px;color:#888;text-transform:uppercase;display:block}.g span{font-size:14px;font-weight:600}.lv{text-align:center;padding:28px;margin:16px 0;border-radius:14px;background:${LC[el]}15;border:2px solid ${LC[el]}}.lv h2{border:none;font-size:36px;color:${LC[el]};margin:8px 0}.sk{border:1px solid #eee;border-radius:8px;padding:14px;margin-bottom:10px;border-left:4px solid}.rc{background:#f8fafc;border-radius:6px;padding:10px;margin-bottom:6px;border-left:3px solid #3b82f6;font-size:13px}.f{text-align:center;margin-top:24px;color:#aaa;font-size:10px;border-top:1px solid #eee;padding-top:16px}@media print{body{margin:16px}}</style></head><body>
<h1>Reporte de Evaluación MCER</h1><p class="s">ALGORITMO64 · IRT + NLP + Pronunciación · ${new Date(r.date).toLocaleDateString("es-PA", { day: "2-digit", month: "long", year: "numeric" })}</p>
<h2>Estudiante</h2><div class="g"><div><label>Alumno</label><span>${r.reg.sName}</span></div><div><label>Edad</label><span>${r.reg.age}</span></div><div><label>Grado</label><span>${r.reg.grade}</span></div><div><label>Acudiente</label><span>${r.reg.pName}</span></div><div><label>WhatsApp</label><span>${r.reg.wa}</span></div><div><label>Email</label><span>${r.reg.email}</span></div></div>
<div class="lv"><p>Nivel estimado MCER</p><h2>${el} — ${LL[el]}</h2><p style="font-size:14px;color:#555">${a.summary}</p><p style="margin-top:8px;font-size:22px;font-weight:800;color:${a.overallScore >= 55 ? "#10b981" : "#f97316"}">${a.overallScore}/100</p></div>
<h2>Habilidades</h2>${sk.map(([n, s, st, g]) => `<div class="sk" style="border-left-color:${s >= 55 ? "#10b981" : "#f97316"}"><div style="display:flex;justify-content:space-between"><strong>${n}</strong><span style="font-size:18px;font-weight:800;color:${s >= 55 ? "#10b981" : "#f97316"}">${s}</span></div><p style="font-size:12px;color:#059669;margin:4px 0">✓ ${st}</p><p style="font-size:12px;color:#ea580c;margin:0">△ ${g}</p></div>`).join("")}
<h2>Recomendaciones</h2>${(a.recommendations || []).map(x => `<div class="rc">${x}</div>`).join("")}
<div style="text-align:center;padding:16px;margin:16px 0;border-radius:8px;background:#f0f4ff;font-weight:600">${a.studentMessage}</div>
${r.transcript ? `<h2>Respuesta Escrita</h2><div style="padding:12px;background:#f8fafc;border-radius:6px;font-style:italic;font-size:13px">"${r.transcript}"</div>` : ""}
<div class="f"><p><strong>ALGORITMO64</strong> · La Chorrera, Panamá · +507 6062-4207</p><p>IRT (Rasch) + NLP + Vocabulario MCER + Pronunciación + IA</p></div></body></html>`;
  const b = new Blob([h], { type: "text/html" }); const u = URL.createObjectURL(b); const l = document.createElement("a"); l.href = u; l.download = `Reporte_${r.reg.sName.replace(/\s+/g, "_")}.html`; document.body.appendChild(l); l.click(); document.body.removeChild(l); URL.revokeObjectURL(u);
}

// ═══ MAIN APP ═══
export default function App() {
  const [view, setView] = useState("reg"); // reg, test, write, speak, loading, res, admin
  const [fade, setFade] = useState(true);
  const [reg, setReg] = useState({ pName: "", wa: "", email: "", sName: "", age: "", grade: "" });
  const [cLvl, setCLvl] = useState("A1");
  const [qi, setQi] = useState(0);
  const [resp, setResp] = useState({ g: [], r: [], l: [] });
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [txt, setTxt] = useState("");
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  const [all, setAll] = useState([]);
  const [det, setDet] = useState(null);
  const [srch, setSrch] = useState("");

  // Speaking state
  const [spkStep, setSpkStep] = useState(0); // read-aloud items then oral tasks
  const [spkRecording, setSpkRecording] = useState(false);
  const [spkTranscript, setSpkTranscript] = useState("");
  const [spkScores, setSpkScores] = useState([]);
  const [spkInterview, setSpkInterview] = useState("");
  const [spkProduction, setSpkProduction] = useState("");
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MS);
  const [testStartedAt, setTestStartedAt] = useState(null);
  const recorderRef = useRef(null);

  const nLvl = LEVELS[Math.min(LEVELS.indexOf(cLvl) + 1, 5)];
  const go = useCallback(cb => { setFade(false); setTimeout(() => { cb(); setFade(true); }, 250); }, []);

  useEffect(() => {
    if (!testStartedAt) return;
    const tick = () => {
      const remaining = TEST_DURATION_MS - (Date.now() - testStartedAt);
      if (remaining <= 0) {
        setTimeLeft(0);
        setTestStartedAt(null);
        alert("El tiempo de la prueba ha terminado. La sesión se cerrará automáticamente.");
        go(() => { reset(); setView("reg"); });
        return;
      }
      setTimeLeft(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [testStartedAt, go]);

  const startTimedTest = () => {
    setTimeLeft(TEST_DURATION_MS);
    setTestStartedAt(Date.now());
    go(() => setView("test"));
  };

  // TTS
  const tts = (text, rate) => new Promise(res => {
    const sy = window.speechSynthesis; sy.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = rate || 0.85;
    const v = sy.getVoices(); const ev = v.find(x => x.lang.startsWith("en-US")) || v.find(x => x.lang.startsWith("en"));
    if (ev) u.voice = ev; setPlaying(true);
    u.onend = () => { setPlaying(false); setPlayed(true); res(); };
    u.onerror = () => { setPlaying(false); setPlayed(true); res(); };
    sy.speak(u);
  });

  // Speaking recorder
  const startRecording = () => {
    if (!recorderRef.current) recorderRef.current = new SpeechRecorder();
    const rec = recorderRef.current;
    if (!rec.supported) { alert("Tu navegador no soporta grabación de voz. Usa Chrome o Edge."); return; }
    setSpkTranscript("");
    rec.start(
      (t) => setSpkTranscript(t),
      (t) => { setSpkRecording(false); setSpkTranscript(t); }
    );
    setSpkRecording(true);
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      const t = recorderRef.current.stop();
      setSpkTranscript(t);
      setSpkRecording(false);
    }
  };

  const submitSpkRead = () => {
    const tasks = SPEAK_TASKS[nLvl] || SPEAK_TASKS[cLvl] || SPEAK_TASKS.A1;
    const expected = tasks.read[spkStep];
    const result = scorePronunciation(expected, spkTranscript);
    setSpkScores(prev => [...prev, result]);
    setSpkTranscript("");
    if (spkStep + 1 < tasks.read.length) {
      setSpkStep(spkStep + 1);
    } else {
      setSpkStep(tasks.read.length); // guided oral phase
    }
  };

  const submitSpkOral = () => {
    const tasks = SPEAK_TASKS[nLvl] || SPEAK_TASKS[cLvl] || SPEAK_TASKS.A1;
    if (spkStep === tasks.read.length) {
      setSpkInterview(spkTranscript);
      setSpkTranscript("");
      setSpkStep(tasks.read.length + 1);
      return;
    }
    setSpkProduction(spkTranscript);
    setSpkTranscript("");
    runFullAssessment(spkInterview || spkTranscript, spkTranscript);
  };

  const runFullAssessment = async (interviewOverride = spkInterview, productionOverride = spkProduction || spkTranscript) => {
    setBusy(true);
    go(() => setView("loading"));

    const gI = irt(resp.g), rI = irt(resp.r), lI = irt(resp.l);
    const speakingText = [interviewOverride, productionOverride].filter(Boolean).join(" ");
    const nlpR = nlpAnalyze(txt), vocR = vocabProfile(txt);

    const combinedPronData = {
      pronScore: spkScores.length > 0 ? Math.round(spkScores.reduce((a, s) => a + s.score, 0) / spkScores.length) : 0,
      matchRate: spkScores.length > 0 ? Math.round(spkScores.reduce((a, s) => a + s.matchRate, 0) / spkScores.length) : 0,
      matchedWords: spkScores.reduce((a, s) => a + s.matchedWords, 0),
      totalWords: spkScores.reduce((a, s) => a + s.totalWords, 0),
      wordScores: spkScores.flatMap(s => s.wordScores),
      interviewWords: interviewOverride.trim().split(/\s+/).filter(Boolean).length,
      productionWords: productionOverride.trim().split(/\s+/).filter(Boolean).length,
    };

    const writingEval = scoreWritingEvidence(txt, nlpR, vocR, cLvl, nLvl);
    const speakingEval = scoreSpeakingEvidence(speakingText, combinedPronData, cLvl, nLvl);
    const a = assess(gI, rI, lI, writingEval, speakingEval, cLvl, nLvl);
    const analysis = await aiInterpret(a, reg, cLvl, nLvl, {
      writingText: txt,
      speakingTranscript: speakingText,
      writingRubric: WRITING_RUBRIC,
      speakingRubric: SPEAKING_RUBRIC,
      pronunciation: combinedPronData,
    });

    const rec = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString(),
      reg: { ...reg }, currentLevel: cLvl, nextLevel: nLvl,
      assessment: a, analysis, transcript: txt,
      pronunciation: { scores: spkScores, average: combinedPronData.pronScore, data: combinedPronData },
      interviewSpeak: interviewOverride,
      freeSpeak: productionOverride,
    };
    saveResult(rec);
    setResults(rec);
    setBusy(false);
    setTestStartedAt(null);
    go(() => setView("res"));
  };

  // Test question handler
  const handleAnswer = (optIdx) => {
    const q = QUESTIONS[qi];
    setResp(prev => ({ ...prev, [q.skill]: [...prev[q.skill], { c: optIdx === q.ans, d: q.d }] }));
    if (qi + 1 < QUESTIONS.length) {
      setPlayed(false);
      setQi(qi + 1);
    } else {
      go(() => setView("write"));
    }
  };

  const reset = () => {
    setQi(0); setResp({ g: [], r: [], l: [] }); setPlayed(false); setTxt("");
    setResults(null); setReg({ pName: "", wa: "", email: "", sName: "", age: "", grade: "" });
    setCLvl("A1"); setSpkStep(0); setSpkScores([]); setSpkTranscript(""); setSpkInterview(""); setSpkProduction("");
    setTimeLeft(TEST_DURATION_MS); setTestStartedAt(null);
  };

  // ═══════════════════════════════════════════════
  // REGISTER
  // ═══════════════════════════════════════════════
  if (view === "reg") {
    const ok = reg.pName.trim() && reg.wa.trim() && reg.email.trim() && reg.sName.trim() && reg.age && reg.grade.trim();
    return (
      <Wrap fade={fade}>
        <div style={{ maxWidth: 540, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>🎓</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", fontFamily: F2, marginBottom: 4 }}>English Level Test</h1>
            <p style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>ALGORITMO64</p>
          </div>
          <div style={{ background: "var(--card)", borderRadius: 16, padding: 24, border: "1px solid var(--brd)", marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Registro</p>
            <Inp label="Nombre del Acudiente" value={reg.pName} onChange={v => setReg({ ...reg, pName: v })} ph="Nombre completo" req />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Inp label="WhatsApp" value={reg.wa} onChange={v => setReg({ ...reg, wa: v })} ph="+507 6000-0000" req />
              <Inp label="E-mail" value={reg.email} onChange={v => setReg({ ...reg, email: v })} ph="correo@ejemplo.com" type="email" req />
            </div>
            <Inp label="Nombre del Alumno" value={reg.sName} onChange={v => setReg({ ...reg, sName: v })} ph="Estudiante" req />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Inp label="Edad" value={reg.age} onChange={v => setReg({ ...reg, age: v })} ph="13" type="number" req />
              <Inp label="Grado" value={reg.grade} onChange={v => setReg({ ...reg, grade: v })} ph="7mo grado" req />
            </div>
          </div>
          <div style={{ background: "var(--card)", borderRadius: 16, padding: 20, border: "1px solid var(--brd)", marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Instrucciones</p>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>Completa tu registro y presiona comenzar. La prueba tendrá una duración máxima de 1 hora y se cerrará automáticamente cuando el tiempo termine.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <Btn disabled={!ok} onClick={startTimedTest} style={{ width: "100%", maxWidth: 320, padding: "13px 0" }}>Comenzar →</Btn>
            <button onClick={() => go(() => { setView("admin"); setAuth(false); setPin(""); setAll(loadAll()); })} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 11, cursor: "pointer" }}>🔒 Administración</button>
          </div>
        </div>
      </Wrap>
    );
  }

  // ═══════════════════════════════════════════════
  // TEST (objective questions, auto-advance, no feedback)
  // ═══════════════════════════════════════════════
  if (view === "test") {
    const q = QUESTIONS[qi];
    const hasAudio = q.audio && !played;
    return (
      <Wrap fade={fade}>
        <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.2s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Tiempo restante</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: timeLeft <= 5 * 60 * 1000 ? "#ef4444" : "var(--text)", fontFamily: F2 }}>{fmtTime(timeLeft)}</div>
          </div>
          <div style={{ height: 4, background: "var(--trk)", borderRadius: 2, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ height: "100%", width: `${((qi + 1) / QUESTIONS.length) * 100}%`, background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius: 2, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{qi + 1} / {QUESTIONS.length}</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{reg.sName}</span>
          </div>
          {q.passage && <div style={{ background: "var(--card2)", borderRadius: 12, padding: 20, marginBottom: 16, borderLeft: "4px solid #3b82f6", fontSize: 14, lineHeight: 1.8, color: "var(--text)" }}>{q.passage}</div>}
          {q.audio && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              {hasAudio ? (
                <Btn v="g" disabled={playing} onClick={() => tts(q.audio, q.d < -1 ? 0.75 : 0.9)}>{playing ? "🔊 Playing..." : "🔊 Listen"}</Btn>
              ) : (
                <button onClick={() => tts(q.audio, q.d < -1 ? 0.75 : 0.9)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}>🔊 Listen again</button>
              )}
            </div>
          )}
          {(!q.audio || played) && (
            <div style={{ background: "var(--card)", borderRadius: 14, padding: 24, border: "1px solid var(--brd)" }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 18, lineHeight: 1.5 }}>{q.q}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.opts.map((o, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} style={{ padding: "13px 16px", fontSize: 14, textAlign: "left", background: "var(--opt)", border: "1px solid var(--optB)", borderRadius: 10, cursor: "pointer", color: "var(--text)", transition: "all 0.12s" }}
                    onMouseEnter={e => { e.target.style.background = "var(--sel)"; e.target.style.borderColor = "#3b82f6"; }}
                    onMouseLeave={e => { e.target.style.background = "var(--opt)"; e.target.style.borderColor = "var(--optB)"; }}>
                    <span style={{ fontWeight: 700, marginRight: 8, opacity: 0.4, fontSize: 12 }}>{String.fromCharCode(65 + i)}</span>{o}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Wrap>
    );
  }

  // ═══════════════════════════════════════════════
  // WRITING
  // ═══════════════════════════════════════════════
  if (view === "write") {
    const sp = WRITING_PROMPTS[nLvl] || WRITING_PROMPTS[cLvl] || WRITING_PROMPTS.A2;
    const wc = txt.trim().split(/\s+/).filter(Boolean).length;
    return (
      <Wrap fade={fade}>
        <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Tiempo restante</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: timeLeft <= 5 * 60 * 1000 ? "#ef4444" : "var(--text)", fontFamily: F2 }}>{fmtTime(timeLeft)}</div>
          </div>
          <div style={{ height: 4, background: "var(--trk)", borderRadius: 2, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ height: "100%", width: "90%", background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius: 2 }} />
          </div>
          <div style={{ background: "var(--card)", borderRadius: 14, padding: 22, border: "1px solid var(--brd)", marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", marginBottom: 10 }}>Write your answer in English</p>
            <p style={{ fontSize: 16, fontWeight: 500, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{sp.p}</p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10, fontStyle: "italic", background: "var(--card2)", padding: "6px 10px", borderRadius: 8 }}>💡 {sp.h}</p>
          </div>
          <div style={{ background: "var(--card)", borderRadius: 14, padding: 20, border: "1px solid var(--brd)", marginBottom: 16 }}>
            <textarea value={txt} onChange={e => setTxt(e.target.value)} placeholder="Write here..." rows={5}
              style={{ width: "100%", padding: 14, fontSize: 15, border: "2px solid var(--brd)", borderRadius: 10, background: "var(--card2)", color: "var(--text)", resize: "vertical", outline: "none", lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"} onBlur={e => e.target.style.borderColor = "var(--brd)"} />
            <p style={{ fontSize: 11, color: wc > 0 ? "var(--accent)" : "var(--muted)", marginTop: 6 }}>{wc} words</p>
          </div>
          <Btn disabled={!txt.trim()} onClick={() => go(() => setView("speak"))} style={{ width: "100%", padding: "13px 0" }}>Next: Speaking →</Btn>
        </div>
      </Wrap>
    );
  }

  // ═══════════════════════════════════════════════
  // SPEAKING (Read Aloud + Guided Oral + Extended Production)
  // ═══════════════════════════════════════════════
  if (view === "speak") {
    const tasks = SPEAK_TASKS[nLvl] || SPEAK_TASKS[cLvl] || SPEAK_TASKS.A1;
    const phase = spkStep < tasks.read.length ? "read" : spkStep === tasks.read.length ? "interview" : "production";
    const readSentence = phase === "read" ? tasks.read[spkStep] : null;
    const oralPrompt = phase === "interview" ? tasks.interview : tasks.production;

    return (
      <Wrap fade={fade}>
        <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Tiempo restante</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: timeLeft <= 5 * 60 * 1000 ? "#ef4444" : "var(--text)", fontFamily: F2 }}>{fmtTime(timeLeft)}</div>
          </div>
          <div style={{ height: 4, background: "var(--trk)", borderRadius: 2, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ height: "100%", width: "95%", background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius: 2 }} />
          </div>

          {phase === "read" ? (
            <>
              <div style={{ background: "var(--card)", borderRadius: 14, padding: 24, border: "1px solid var(--brd)", marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>
                  Read aloud for intelligibility evidence ({spkStep + 1}/{tasks.read.length})
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <button onClick={() => tts(readSentence, 0.85)} disabled={playing}
                    style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, cursor: "pointer" }}>
                    {playing ? "🔊 ..." : "🔊 Listen first"}
                  </button>
                </div>
                <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", lineHeight: 1.6, padding: 16, background: "var(--card2)", borderRadius: 10, textAlign: "center" }}>
                  "{readSentence}"
                </p>
              </div>

              <div style={{ textAlign: "center", marginBottom: 16 }}>
                {!spkRecording ? (
                  <Btn v={spkTranscript ? "o" : "g"} onClick={startRecording} style={{ padding: "14px 36px" }}>
                    {spkTranscript ? "🎙 Record Again" : "🎙 Start Recording"}
                  </Btn>
                ) : (
                  <Btn v="d" onClick={stopRecording} style={{ padding: "14px 36px", animation: "recording 1.5s infinite" }}>
                    ⏹ Stop Recording
                  </Btn>
                )}
              </div>

              {spkTranscript && (
                <div style={{ background: "var(--card)", borderRadius: 12, padding: 16, border: "1px solid var(--brd)", marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>What we heard:</p>
                  <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                    "{spkTranscript}"
                  </p>
                </div>
              )}

              {spkTranscript && !spkRecording && (
                <Btn onClick={submitSpkRead} style={{ width: "100%", padding: "13px 0" }}>Next →</Btn>
              )}
            </>
          ) : (
            <>
              <div style={{ background: "var(--card)", borderRadius: 14, padding: 24, border: "1px solid var(--brd)", marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>
                  {phase === "interview" ? "Guided oral response" : "Extended oral production"}
                </p>
                <p style={{ fontSize: 16, fontWeight: 500, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{oralPrompt.prompt}</p>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10, fontStyle: "italic", background: "var(--card2)", padding: "6px 10px", borderRadius: 8 }}>💡 {oralPrompt.hint}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ background: "var(--card2)", borderRadius: 12, padding: 14 }}>
                  <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>Interview response</p>
                  <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>{spkInterview || "Pending"}</p>
                </div>
                <div style={{ background: "var(--card2)", borderRadius: 12, padding: 14 }}>
                  <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>Extended response</p>
                  <p style={{ fontSize: 13, color: "var(--text)", margin: 0 }}>{spkProduction || "Pending"}</p>
                </div>
              </div>

              <div style={{ textAlign: "center", marginBottom: 16 }}>
                {!spkRecording ? (
                  <Btn v={spkTranscript ? "o" : "g"} onClick={startRecording} style={{ padding: "14px 36px" }}>
                    {spkTranscript ? "🎙 Record Again" : phase === "interview" ? "🎙 Start Interview Response" : "🎙 Start Extended Response"}
                  </Btn>
                ) : (
                  <Btn v="d" onClick={stopRecording} style={{ padding: "14px 36px", animation: "recording 1.5s infinite" }}>
                    ⏹ Stop
                  </Btn>
                )}
              </div>

              {spkTranscript && (
                <div style={{ background: "var(--card)", borderRadius: 12, padding: 16, border: "1px solid var(--brd)", marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Current oral response:</p>
                  <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                    "{spkTranscript}"
                  </p>
                  <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>{spkTranscript.split(/\s+/).filter(Boolean).length} words</p>
                </div>
              )}

              {spkTranscript && !spkRecording && (
                <Btn onClick={submitSpkOral} style={{ width: "100%", padding: "13px 0" }} disabled={busy}>
                  {phase === "interview" ? "Continue to extended response →" : busy ? "Processing..." : "Finish Test →"}
                </Btn>
              )}
            </>
          )}
        </div>
      </Wrap>
    );
  }

  // ═══════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════
  if (view === "loading") return (
    <Wrap fade={fade}>
      <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "pulse 1.5s infinite" }}>🤖</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", fontFamily: F2, marginBottom: 8 }}>Evaluando...</h2>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Scoring objetivo · Rúbricas CEFR · AI</p>
      </div>
    </Wrap>
  );

  // ═══════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════
  if (view === "res" && results) {
    const a = results.analysis;
    const p = a.verdict === "PROMOTED";
    const el = a.estimatedLevel || results.assessment?.g?.level || "A1";
    const sk = [
      { n: "Grammar", s: a.grammarScore, st: a.grammarStrength, g: a.grammarGrowth },
      { n: "Reading", s: a.readingScore, st: a.readingStrength, g: a.readingGrowth },
      { n: "Listening", s: a.listeningScore, st: a.listeningStrength, g: a.listeningGrowth },
      { n: "Writing", s: a.writingScore, st: a.writingStrength, g: a.writingGrowth },
      { n: "Speaking", s: a.speakingScore, st: a.speakingStrength, g: a.speakingGrowth },
    ];
    return (
      <Wrap fade={fade}>
        <div style={{ maxWidth: 700, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 28, padding: "40px 20px", background: `${LC[el]}12`, borderRadius: 20, border: `2px solid ${LC[el]}40` }}>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8 }}>Nivel estimado de {reg.sName}</p>
            <Badge level={el} size="xl" />
            <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", fontFamily: F2, marginTop: 12 }}>{LL[el]}</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: sc(a.overallScore), fontFamily: F2, margin: "8px 0" }}>{a.overallScore}<span style={{ fontSize: 16, color: "var(--muted)" }}>/100</span></p>
            {p ? (
              <p style={{ fontSize: 14, color: "#10b981", fontWeight: 600 }}>✅ Listo para avanzar a {results.nextLevel}</p>
            ) : (
              <p style={{ fontSize: 14, color: "#f97316", fontWeight: 600 }}>Recomendamos reforzar {results.currentLevel}</p>
            )}
          </div>
          <div style={{ background: "var(--card)", borderRadius: 14, padding: 20, border: "1px solid var(--brd)", marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, margin: 0 }}>{a.summary}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {sk.map(s => (
              <div key={s.n} style={{ background: "var(--card)", borderRadius: 14, padding: 18, border: "1px solid var(--brd)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{s.n}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: sc(s.s), fontFamily: F2 }}>{s.s}</span>
                </div>
                <Bar value={s.s} color={sc(s.s)} />
                <p style={{ fontSize: 11, color: "#10b981", margin: "6px 0 3px" }}>✓ {s.st}</p>
                <p style={{ fontSize: 11, color: "#ea580c", margin: 0 }}>△ {s.g}</p>
              </div>
            ))}
          </div>
          {a.recommendations && (
            <div style={{ background: "var(--card)", borderRadius: 14, padding: 20, border: "1px solid var(--brd)", marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Recomendaciones</p>
              {a.recommendations.map((r, i) => <p key={i} style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0", lineHeight: 1.5 }}>{i + 1}. {r}</p>)}
            </div>
          )}
          <div style={{ background: p ? "#10b98115" : "#f9731615", borderRadius: 14, padding: 20, border: `1px solid ${p ? "#10b98130" : "#f9731630"}`, marginBottom: 20, textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0 }}>{a.studentMessage}</p>
          </div>
          {a.methodology && <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginBottom: 16 }}>🔬 {a.methodology}</p>}
          <div style={{ textAlign: "center" }}><Btn onClick={() => go(() => { reset(); setView("reg"); })}>Nueva Evaluación</Btn></div>
        </div>
      </Wrap>
    );
  }

  // ══════════════════════════════════════════════
  // ADMIN
  // ═══════════════════════════════════════════════
  if (view === "admin") {
    if (!auth) return (
      <Wrap fade={fade}>
        <div style={{ maxWidth: 380, margin: "0 auto", textAlign: "center", animation: "fadeUp 0.3s ease" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: F2, marginBottom: 20 }}>Administración</h2>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && pin === PIN) { setAuth(true); setAll(loadAll()); } }} placeholder="PIN"
            style={{ width: 200, padding: "12px 18px", fontSize: 18, textAlign: "center", border: "2px solid var(--brd)", borderRadius: 12, background: "var(--card)", color: "var(--text)", outline: "none", letterSpacing: "0.2em", marginBottom: 14 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <Btn disabled={pin !== PIN} onClick={() => { setAuth(true); setAll(loadAll()); }}>Entrar</Btn>
            <button onClick={() => go(() => setView("reg"))} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>← Volver</button>
          </div>
        </div>
      </Wrap>
    );

    if (det) {
      const r = det; const a = r.analysis; const el = a.estimatedLevel || "A1";
      const sk = [["Grammar", a.grammarScore, a.grammarStrength, a.grammarGrowth], ["Reading", a.readingScore, a.readingStrength, a.readingGrowth], ["Listening", a.listeningScore, a.listeningStrength, a.listeningGrowth], ["Writing", a.writingScore, a.writingStrength, a.writingGrowth], ["Speaking", a.speakingScore, a.speakingStrength, a.speakingGrowth]];
      return (
        <Wrap fade={fade}>
          <div style={{ maxWidth: 700, margin: "0 auto", animation: "fadeUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={() => setDet(null)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← Dashboard</button>
              <Btn v="g" onClick={() => dlReport(r)} style={{ fontSize: 12, padding: "6px 16px" }}>📥 Reporte</Btn>
            </div>
            <div style={{ background: "var(--card)", borderRadius: 14, padding: 20, border: "1px solid var(--brd)", marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
                {[["Alumno", r.reg?.sName], ["Edad", r.reg?.age], ["Grado", r.reg?.grade], ["Acudiente", r.reg?.pName], ["WhatsApp", r.reg?.wa], ["Fecha", new Date(r.date).toLocaleDateString("es-PA")]].map(([l, v]) => (
                  <div key={l}><p style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", marginBottom: 2 }}>{l}</p><p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{v}</p></div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", padding: 20, background: `${LC[el]}15`, borderRadius: 14, border: `1px solid ${LC[el]}30`, marginBottom: 16 }}>
              <Badge level={el} size="lg" />
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: F2, marginTop: 6 }}>{LL[el]} · {a.overallScore}/100</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {sk.map(([n, s, st, g]) => (
                <div key={n} style={{ background: "var(--card)", borderRadius: 10, padding: 14, border: "1px solid var(--brd)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{n}</span><span style={{ fontWeight: 800, color: sc(s), fontFamily: F2 }}>{s}</span></div>
                  <Bar value={s} color={sc(s)} />
                  <p style={{ fontSize: 10, color: "#10b981", margin: "3px 0 1px" }}>✓ {st}</p>
                  <p style={{ fontSize: 10, color: "#ea580c", margin: 0 }}>△ {g}</p>
                </div>
              ))}
            </div>
            {r.pronunciation?.scores?.length > 0 && (
              <div style={{ background: "var(--card)", borderRadius: 10, padding: 14, border: "1px solid var(--brd)", marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>Pronunciation Details:</p>
                {r.pronunciation.scores.map((s, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)" }}>Sentence {i + 1}</span>
                      <span style={{ fontWeight: 700, color: sc(s.score) }}>{s.score}% ({s.matchedWords}/{s.totalWords} words)</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {s.wordScores?.map((w, j) => (
                        <span key={j} style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: w.matched ? "#10b98118" : "#ef444418", color: w.matched ? "#10b981" : "#ef4444" }}>{w.word}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {r.transcript && <div style={{ background: "var(--card)", borderRadius: 10, padding: 14, border: "1px solid var(--brd)", borderLeft: "4px solid #10b981", marginBottom: 8 }}><p style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>Written:</p><p style={{ fontSize: 12, color: "var(--text)", fontStyle: "italic", margin: 0 }}>"{r.transcript}"</p></div>}
            {r.freeSpeak && <div style={{ background: "var(--card)", borderRadius: 10, padding: 14, border: "1px solid var(--brd)", borderLeft: "4px solid #8b5cf6" }}><p style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>Spoken:</p><p style={{ fontSize: 12, color: "var(--text)", fontStyle: "italic", margin: 0 }}>"{r.freeSpeak}"</p></div>}
          </div>
        </Wrap>
      );
    }

    const filt = srch.trim() ? all.filter(r => r.reg?.sName?.toLowerCase().includes(srch.toLowerCase()) || r.reg?.pName?.toLowerCase().includes(srch.toLowerCase())) : all;
    return (
      <Wrap fade={fade}>
        <div style={{ maxWidth: 920, margin: "0 auto", animation: "fadeUp 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div><h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: F2, margin: 0 }}>Dashboard</h2><p style={{ fontSize: 12, color: "var(--muted)" }}>{all.length} evaluaciones</p></div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn v="o" onClick={() => go(() => { setView("reg"); setAuth(false); })} style={{ fontSize: 12, padding: "6px 14px" }}>← Salir</Btn>
              <Btn v="o" onClick={() => setAll(loadAll())} style={{ fontSize: 12, padding: "6px 14px" }}>🔄</Btn>
            </div>
          </div>
          <input value={srch} onChange={e => setSrch(e.target.value)} placeholder="🔍 Buscar..." style={{ width: "100%", maxWidth: 360, padding: "8px 14px", fontSize: 13, border: "1px solid var(--brd)", borderRadius: 10, background: "var(--card)", color: "var(--text)", outline: "none", marginBottom: 16 }} />
          {filt.length === 0 ? <p style={{ textAlign: "center", padding: 50, color: "var(--muted)" }}>Sin resultados</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ borderBottom: "2px solid var(--brd)" }}>{["Fecha", "Alumno", "Nivel", "Score", "Pron.", "Acudiente", ""].map(h => <th key={h} style={{ padding: "10px 6px", textAlign: "left", color: "var(--muted)", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
                <tbody>{filt.sort((a, b) => new Date(b.date) - new Date(a.date)).map(r => {
                  const el = r.analysis?.estimatedLevel || "A1";
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--brd)", cursor: "pointer" }} onClick={() => setDet(r)}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--sel)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "8px 6px", color: "var(--muted)", fontSize: 11 }}>{new Date(r.date).toLocaleDateString("es-PA", { day: "2-digit", month: "short" })}</td>
                      <td style={{ padding: "8px 6px", color: "var(--text)", fontWeight: 600 }}>{r.reg?.sName}</td>
                      <td style={{ padding: "8px 6px" }}><Badge level={el} size="sm" /></td>
                      <td style={{ padding: "8px 6px", fontWeight: 800, color: sc(r.analysis?.overallScore), fontFamily: F2 }}>{r.analysis?.overallScore}</td>
                      <td style={{ padding: "8px 6px", fontWeight: 700, color: sc(r.pronunciation?.average || 0), fontFamily: F2 }}>{r.pronunciation?.average || 0}%</td>
                      <td style={{ padding: "8px 6px", color: "var(--muted)", fontSize: 11 }}>{r.reg?.pName}</td>
                      <td style={{ padding: "8px 6px" }}><button onClick={e => { e.stopPropagation(); if (confirm("¿Eliminar?")) { delResult(r.id); setAll(loadAll()); } }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>🗑</button></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </div>
      </Wrap>
    );
  }

  return null;
}
