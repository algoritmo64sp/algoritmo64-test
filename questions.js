// 30 Questions - Mixed skills, progressive difficulty
// skill: g=grammar, r=reading, l=listening (never shown to student)
// d = IRT Rasch difficulty parameter

export const QUESTIONS = [
  // A1 range (d: -2.5 to -1.5)
  { q: "She ___ a student.", opts: ["am", "is", "are", "be"], ans: 1, d: -2.5, skill: "g" },
  { q: "I ___ from Panama.", opts: ["is", "am", "are", "be"], ans: 1, d: -2.3, skill: "g" },
  { q: "They ___ happy today.", opts: ["is", "am", "are", "has"], ans: 2, d: -2.0, skill: "g" },
  { passage: "My name is Carlos. I am 13 years old. I live in Panama City. I like video games and science. I go to school by bus every day.", q: "How old is Carlos?", opts: ["10", "13", "15", "12"], ans: 1, d: -2.4, skill: "r" },
  { q: "___ you like ice cream?", opts: ["Does", "Do", "Is", "Are"], ans: 1, d: -1.8, skill: "g" },
  { passage: "My name is Carlos. I am 13 years old. I live in Panama City. I like video games and science. I go to school by bus every day.", q: "How does Carlos go to school?", opts: ["By car", "By bus", "Walking", "By train"], ans: 1, d: -2.2, skill: "r" },
  { audio: "Hello! My name is Emma. I am a teacher. I work in New York. Every day I wake up at seven. I go to work by bus.", q: "What is Emma's job?", opts: ["Doctor", "Teacher", "Student", "Driver"], ans: 1, d: -2.5, skill: "l" },
  { q: "He ___ a cat and a dog.", opts: ["have", "has", "is", "haves"], ans: 1, d: -1.6, skill: "g" },
  { audio: "Hello! My name is Emma. I am a teacher. I work in New York. Every day I wake up at seven. I go to work by bus.", q: "How does Emma go to work?", opts: ["By car", "By train", "By bus", "Walking"], ans: 2, d: -2.3, skill: "l" },
  // A2 range (d: -1.2 to -0.3)
  { q: "She ___ to school yesterday.", opts: ["go", "goes", "went", "goed"], ans: 2, d: -1.0, skill: "g" },
  { q: "This book is ___ than that one.", opts: ["more interesting", "interestinger", "most interesting", "interest"], ans: 0, d: -0.5, skill: "g" },
  { passage: "Last summer, Maria went to the beach with her family. They stayed at a hotel for five days. Every morning she went swimming. On the last day, they saw dolphins. Maria was excited because she had never seen dolphins before.", q: "How long did they stay?", opts: ["3 days", "1 week", "5 days", "2 weeks"], ans: 2, d: -0.8, skill: "r" },
  { q: "I ___ my homework when she called.", opts: ["do", "did", "was doing", "have done"], ans: 2, d: -0.3, skill: "g" },
  { passage: "Last summer, Maria went to the beach with her family. They stayed at a hotel for five days. Every morning she went swimming. On the last day, they saw dolphins. Maria was excited because she had never seen dolphins before.", q: "Why was Maria excited?", opts: ["Nice hotel", "Saw dolphins first time", "Learned to swim", "Cousins came"], ans: 1, d: -0.4, skill: "r" },
  { audio: "Welcome to the City Museum. Today's tour lasts two hours. First, ancient history on the second floor. Then art on the third floor. Don't touch paintings. You can take photos but no flash.", q: "How long is the tour?", opts: ["1 hour", "2 hours", "3 hours", "30 minutes"], ans: 1, d: -0.8, skill: "l" },
  { q: "There aren't ___ apples left.", opts: ["some", "any", "much", "a"], ans: 1, d: -0.7, skill: "g" },
  { audio: "Welcome to the City Museum. Today's tour lasts two hours. First, ancient history on the second floor. Then art on the third floor. Don't touch paintings. You can take photos but no flash.", q: "What is NOT allowed?", opts: ["Taking photos", "Asking questions", "Using flash", "Visiting"], ans: 2, d: -0.5, skill: "l" },
  // B1 range (d: 0.2 to 1.0)
  { q: "If it rains, I ___ at home.", opts: ["stay", "will stay", "would stay", "stayed"], ans: 1, d: 0.2, skill: "g" },
  { q: "The cake ___ by my grandmother.", opts: ["baked", "was baked", "is baking", "has bake"], ans: 1, d: 0.8, skill: "g" },
  { passage: "Digital citizenship means responsible internet behavior: protecting personal information, being respectful online, and recognizing false information. Research shows students who learn this are less likely to cyberbully and more likely to report suspicious activity.", q: "What does research show about digital citizenship education?", opts: ["No effect", "Better at coding", "Less cyberbullying", "Teachers prefer it"], ans: 2, d: 0.5, skill: "r" },
  { q: "I wish I ___ more free time.", opts: ["have", "had", "would have", "has"], ans: 1, d: 1.0, skill: "g" },
  { audio: "I started learning Python at fourteen to create a video game. It was frustrating at first. Online tutorials explained things step by step. After six months I built a simple game where a character collects stars.", q: "Why did the speaker start learning Python?", opts: ["School project", "Get a job", "Create a video game", "Parents asked"], ans: 2, d: 0.3, skill: "l" },
  { q: "She ___ here since 2020.", opts: ["lives", "has lived", "lived", "is living"], ans: 1, d: 0.6, skill: "g" },
  // B2 range (d: 1.2 to 1.8)
  { q: "Had I known earlier, I ___ differently.", opts: ["would act", "would have acted", "acted", "had acted"], ans: 1, d: 1.5, skill: "g" },
  { passage: "AI in creative industries sparks debate. Critics say outputs lack genuine creativity — intentional expression from lived experience. Proponents argue AI democratizes tools. The nuanced view suggests AI should amplify human creativity, not replace it.", q: "What is the 'nuanced position' about AI?", opts: ["Ban AI", "Replace artists", "Amplify creativity, not replace", "Only curation"], ans: 2, d: 1.5, skill: "r" },
  { q: "Not until the meeting ended ___ the truth.", opts: ["I learned", "did I learn", "I did learn", "learned I"], ans: 1, d: 1.8, skill: "g" },
  { audio: "A study found moderate social media use — under two hours — showed no negative effect on grades. Heavy use over four hours linked to decreased performance. Students using it for collaborative learning actually outperformed those who avoided it entirely.", q: "What did the study conclude?", opts: ["Ban social media", "Quality matters more than quantity", "All use is harmful", "No conclusion"], ans: 1, d: 1.3, skill: "l" },
  // C1 range (d: 2.0 to 2.5)
  { q: "Seldom ___ such a brilliant performance.", opts: ["I have seen", "have I seen", "I saw", "did I saw"], ans: 1, d: 2.2, skill: "g" },
  { q: "It is imperative that he ___ on time.", opts: ["arrives", "arrive", "arrived", "arriving"], ans: 1, d: 2.5, skill: "g" },
  { passage: "Algorithmic decision-making privileges correlational patterns from historical data over causal understanding. When algorithms flag a student as likely to underperform, they identify statistical regularities without comprehending socioeconomic factors. This raises questions about whether automated judgments can be legitimate without genuine understanding.", q: "What is the main critique of algorithmic decisions?", opts: ["Too transparent", "Correlation over causation", "Only for education", "Too expensive"], ans: 1, d: 2.0, skill: "r" },
];

export const WRITING_PROMPTS = {
  A1: { p: "Tell me about yourself. What is your name? How old are you? What do you like?", h: "Use: I am..., I like..., I have..." },
  A2: { p: "What did you do last weekend? Where did you go? Who were you with?", h: "Use past tense: I went..., I played..., I saw..." },
  B1: { p: "Does technology help or hurt education? Give your opinion with examples.", h: "Use: I think, because, for example, however" },
  B2: { p: "Should social media be banned for teenagers? Argue with reasons.", h: "Use: on the other hand, furthermore, despite" },
  C1: { p: "How might AI transform education? Discuss benefits and risks.", h: "Use: arguably, implications, whereas" },
};
