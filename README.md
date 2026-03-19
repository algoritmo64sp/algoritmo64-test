# ALGORITMO64 — English Level Promotion Test

## Motor de evaluación profesional
- **IRT (Rasch Model)**: Cada pregunta tiene dificultad calibrada. Estima habilidad (theta) del estudiante.
- **NLP**: Analiza escritura — diversidad léxica (TTR), complejidad sintáctica, conectores, subordinación.
- **CEFR Vocabulary Profiler**: Clasifica vocabulario por nivel A1-C1.
- **Pronunciación (Web Speech API)**: El estudiante lee en voz alta, el sistema compara transcripción vs texto esperado.
- **AI Interpreter (Claude)**: Interpreta todos los datos algorítmicos para generar reporte humano.

## Estructura de la prueba
1. **30 preguntas** mezcladas (grammar/reading/listening) — dificultad progresiva, sin etiquetas, sin feedback, auto-avance
2. **Writing** — respuesta escrita analizada por NLP + Vocab Profiler
3. **Speaking** — 3 lecturas en voz alta (pronunciación) + 1 respuesta libre
4. **Resultados** — nivel CEFR estimado, puntuaciones por habilidad, recomendaciones AI

## Desplegar en Vercel (GRATIS)

### Opción 1: Desde GitHub
1. Sube esta carpeta a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
3. Click "New Project" → selecciona tu repositorio
4. Vercel detecta automáticamente que es Vite
5. Click "Deploy" — listo!

### Opción 2: Desde la CLI
```bash
npm install -g vercel
cd a64-test
npm install
vercel
```

### Dominio personalizado
En Vercel Dashboard → Settings → Domains → añadir `test.algoritmo64.com`
Luego configura un CNAME en tu DNS apuntando a `cname.vercel-dns.com`

## Credenciales
- **PIN Admin**: A64admin (cambiar en src/App.jsx, variable PIN)

## Requisitos del navegador
- Chrome, Edge, o Safari (para Web Speech API)
- El estudiante necesita micrófono para la sección de Speaking
- Los datos se guardan en localStorage del navegador

## Tecnologías
- React 18 + Vite
- Web Speech API (SpeechRecognition + SpeechSynthesis)
- Claude API (Sonnet) para interpretación AI
- Zero dependencias de backend — todo funciona client-side

## Personalización
- Preguntas: `src/questions.js`
- Tareas de speaking: `src/speaking.js`
- Motores de evaluación: `src/engines.js`
- UI y flujo: `src/App.jsx`
