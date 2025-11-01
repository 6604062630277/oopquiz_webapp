// ===================== OOP Core =====================
// Abstract Question
class Question {
  constructor(text, points = 1, explanation = "") {
    if (new.target === Question) throw new Error("Question is abstract.");
    this.text = text;
    this.points = points;
    this.explanation = explanation;
  }
  render(container, onSelect) { throw new Error("render() must be implemented"); }
  checkAnswer(answer) { throw new Error("checkAnswer() must be implemented"); }
}

// Multiple Choice
class MultipleChoiceQuestion extends Question {
  constructor(text, choices, correctIndex, points = 1, explanation = "") {
    super(text, points, explanation);
    this.choices = choices;
    this.correctIndex = correctIndex;
  }
  render(container, onSelect) {
    container.innerHTML = "";
    this.choices.forEach((c, idx) => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.textContent = c;
      btn.onclick = () => onSelect(idx, btn);
      container.appendChild(btn);
    });
  }
  checkAnswer(answerIndex) {
    return Number(answerIndex) === Number(this.correctIndex);
  }
}

// True/False
class TrueFalseQuestion extends Question {
  constructor(text, isTrue, points = 1, explanation = "") {
    super(text, points, explanation);
    this.isTrue = isTrue;
  }
  render(container, onSelect) {
    container.innerHTML = "";
    ["ถูก", "ผิด"].forEach((label, idx) => {
      const val = idx === 0; // true for "ถูก"
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.textContent = label;
      btn.onclick = () => onSelect(val, btn);
      container.appendChild(btn);
    });
  }
  checkAnswer(answerBool) {
    return Boolean(answerBool) === Boolean(this.isTrue);
  }
}

// Player
class Player {
  constructor(name = "Guest") {
    this.name = name || "Guest";
    this.score = 0;
    this.correct = 0;
  }
  addPoints(p) { this.score += p; }
  addCorrect() { this.correct += 1; }
  reset() { this.score = 0; this.correct = 0; }
}

// Quiz (Controller)
class Quiz {
  constructor(questions, player) {
    this.questions = questions;
    this.player = player;
    this.index = 0;
    this.answered = false;
    this.selectedAnswer = null;
    this.selectedBtn = null;
  }
  current() { return this.questions[this.index]; }
  isFinished() { return this.index >= this.questions.length; }
  reset() { this.index = 0; this.answered = false; this.selectedAnswer = null; this.selectedBtn = null; this.player.reset(); }
}
// ===================== End OOP Core =====================


// ===================== UI Logic =====================
const el = (id) => document.getElementById(id);

// Screens
const startScreen  = el("start");
const quizScreen   = el("quiz");
const resultScreen = el("result");

// Quiz UI elements
const questionText = el("questionText");
const choicesBox   = el("choices");
const explainEl    = el("explain");
const progressEl   = el("progress");
const scoreEl      = el("score");
const submitBtn    = el("submitBtn");
const nextBtn      = el("nextBtn");

// Result UI
const finalScoreEl = el("finalScore");
const correctCntEl = el("correctCount");
const totalCntEl   = el("totalCount");
const percentEl    = el("percent");

// Buttons
const startBtn     = el("startBtn");
const restartBtn   = el("restartBtn");
const nameInput    = el("playerName");

// Sample Questions (ไม่ใช้ database เก็บในหน่วยความจำล้วน)
const sampleQuestions = [
  new MultipleChoiceQuestion(
    "หลักการ Encapsulation ใน OOP คือข้อใด?",
    ["การห่อหุ้มข้อมูลและเมธอดไว้ภายในคลาส", "การสืบทอดคุณลักษณะจากคลาสแม่", "การมีเมธอดชื่อเดียวกันแต่ทำงานต่างกัน", "การสร้างออบเจกต์จากคลาส"],
    0, 2, "Encapsulation = การซ่อนรายละเอียดภายในและเข้าถึงผ่าน public method"
  ),
  new MultipleChoiceQuestion(
    "Polymorphism สื่อถึงอะไร?",
    ["ออบเจกต์เดียวหลายค่า", "เมธอดเดียวหลายรูปแบบ", "คลาสเดียวหลายอินสแตนซ์", "โค้ดเดียวหลายไฟล์"],
    1, 2, "Polymorphism = เมธอดเดียวกันแต่พฤติกรรมต่างกันตามชนิดจริงของออบเจกต์"
  ),
  new TrueFalseQuestion(
    "คลาสแบบ abstract สามารถสร้างออบเจกต์ได้โดยตรง",
    false, 2, "Abstract class ใช้เป็นแม่แบบ ต้องให้คลาสลูกสืบทอด"
  ),
  new MultipleChoiceQuestion(
    "ข้อใด ‘ไม่ใช่’ คุณสมบัติหลักของ OOP",
    ["Encapsulation","Inheritance","Compilation","Polymorphism"],
    2, 2, "คุณสมบัติหลักคือ Encapsulation / Inheritance / Polymorphism / Abstraction"
  ),
  new TrueFalseQuestion(
    "Composition คือความสัมพันธ์ ‘มีเป็นส่วนประกอบของ’ เช่น รถมีล้อ",
    true, 2, "ถูกต้อง: รถประกอบด้วยล้อ ถ้ารถหาย ล้อก็ไม่มีความหมาย"
  ),
];

const player = new Player();
const quiz = new Quiz(sampleQuestions, player);

// Navigation
startBtn.onclick = () => {
  player.name = nameInput.value || "Guest";
  startScreen.classList.add("hide");
  resultScreen.classList.add("hide");
  quizScreen.classList.remove("hide");
  quiz.reset();
  renderQuestion();
};

restartBtn.onclick = () => {
  startScreen.classList.remove("hide");
  quizScreen.classList.add("hide");
  resultScreen.classList.add("hide");
};

// Render current question
function renderQuestion() {
  const q = quiz.current();
  if (!q) return;

  questionText.textContent = q.text;
  progressEl.textContent = `ข้อ ${quiz.index + 1}/${quiz.questions.length}`;
  scoreEl.textContent = `คะแนน: ${quiz.player.score}`;
  explainEl.textContent = "";
  submitBtn.disabled = true;
  nextBtn.disabled = true;
  quiz.answered = false;
  quiz.selectedAnswer = null;
  quiz.selectedBtn = null;

  q.render(choicesBox, (value, btn) => {
    // mark selected
    Array.from(choicesBox.children).forEach(c => c.classList.remove("selected"));
    btn.classList.add("selected");
    quiz.selectedAnswer = value;
    quiz.selectedBtn = btn;
    submitBtn.disabled = false;
  });
}

// Submit answer
submitBtn.onclick = () => {
  if (quiz.answered || quiz.selectedAnswer === null) return;

  const q = quiz.current();
  const correct = q.checkAnswer(quiz.selectedAnswer);
  quiz.answered = true;

  // decorate UI
  if (correct) {
    quiz.selectedBtn.classList.add("correct");
    quiz.player.addPoints(q.points);
    quiz.player.addCorrect();
  } else {
    quiz.selectedBtn.classList.add("incorrect");
    // also highlight the correct one for MCQ
    if (q instanceof MultipleChoiceQuestion) {
      Array.from(choicesBox.children).forEach((btn, idx) => {
        if (idx === q.correctIndex) btn.classList.add("correct");
      });
    } else if (q instanceof TrueFalseQuestion) {
      Array.from(choicesBox.children).forEach((btn, idx) => {
        const isTrueBtn = idx === 0;
        if (isTrueBtn === q.isTrue) btn.classList.add("correct");
      });
    }
  }

  scoreEl.textContent = `คะแนน: ${quiz.player.score}`;
  explainEl.textContent = q.explanation || (correct ? "ถูกต้อง!" : "ตอบผิด");
  nextBtn.disabled = false;
};

// Next question / Finish
nextBtn.onclick = () => {
  quiz.index += 1;
  if (quiz.isFinished()) return showResult();
  renderQuestion();
};

function showResult() {
  quizScreen.classList.add("hide");
  resultScreen.classList.remove("hide");
  finalScoreEl.textContent = quiz.player.score;
  correctCntEl.textContent = quiz.player.correct;
  totalCntEl.textContent = quiz.questions.length;
  percentEl.textContent = Math.round((quiz.player.correct/quiz.questions.length)*100);
}
// ===================== End UI Logic =====================
