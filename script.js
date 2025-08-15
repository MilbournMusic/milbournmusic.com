const SONGS = [
  "Prologue","At The End Of The Day","I Dreamed A Dream","The Docks","Cart Crash","Fantine’s Death",
  "Little Cosette","The Innkeeper’s Song","The Bargain","The Beggars","The Robbery","Stars",
  "The ABC Cafe","The People’s Song","Rue Plumet","A Heart Full Of Love","The Attack On Rue Plumet",
  "One Day More","Building The Barricade","Javert At The Barricade","The First Attack","The Night",
  "The Final Battle","The Sewers","Javert’s Suicide","The Cafe Song","Marius and Cosette",
  "The Wedding","Epilogue","Bows/Playout"
];

const CELL_H = 56, SEP_H = 6;

// labelForIndex: skip 23 (like your RN code did when i >= 22)
const labelForIndex = (i) => (i < 22 ? i : i + 1);

const $ = (sel) => document.querySelector(sel);
const screenStart = $("#screen-start");
const screenQuiz = $("#screen-quiz");
const screenCelebrate = $("#screen-celebrate");
const songList = $("#songList");
const gutter = $("#numberGutter");

const startBtn = $("#startBtn");
const checkBtn = $("#checkBtn");
const resetBtn = $("#resetBtn");
const homeBtn = $("#homeBtn");

let data = []; // array of { key, title }
let highlightTimer = null;

const shuffle = (a) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};

const isCorrect = () => data.every((item, i) => item.title === SONGS[i]);
const countCorrect = () => data.reduce((acc, item, i) => acc + (item.title === SONGS[i] ? 1 : 0), 0);

const clearHighlightTimer = () => {
  if (highlightTimer) {
    clearTimeout(highlightTimer);
    highlightTimer = null;
  }
};

const setScreen = (name) => {
  screenStart.classList.add("hidden");
  screenQuiz.classList.add("hidden");
  screenCelebrate.classList.add("hidden");
  if (name === "start") screenStart.classList.remove("hidden");
  if (name === "quiz") screenQuiz.classList.remove("hidden");
  if (name === "celebrate") screenCelebrate.classList.remove("hidden");
};

const renderGutter = () => {
  gutter.innerHTML = "";
  data.forEach((_, i) => {
    const li = document.createElement("li");
    li.textContent = labelForIndex(i);
    gutter.appendChild(li);
  });
};

const renderList = () => {
  songList.innerHTML = "";
  data.forEach((item) => {
    const li = document.createElement("li");
    li.className = "song";
    li.draggable = true;
    li.dataset.key = item.key;
    li.textContent = item.title;

    li.addEventListener("dragstart", (e) => {
      li.classList.add("dragging", "active");
      e.dataTransfer.setData("text/plain", item.key);
      e.dataTransfer.effectAllowed = "move";
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging", "active");
    });

    songList.appendChild(li);
  });
};

const positionFromY = (y) => {
  const rect = songList.getBoundingClientRect();
  const offset = Math.max(0, Math.min(y - rect.top, songList.scrollHeight));
  const idx = Math.floor(offset / (CELL_H + SEP_H));
  return Math.max(0, Math.min(idx, data.length));
};

const setupDnD = () => {
  songList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = songList.querySelector(".song.dragging");
    if (!dragging) return;
    const idx = positionFromY(e.clientY);
    const siblings = [...songList.children].filter((c) => c !== dragging);
    const target = siblings[idx];
    if (!target) songList.appendChild(dragging);
    else songList.insertBefore(dragging, target);
  });

  songList.addEventListener("drop", (e) => {
    e.preventDefault();
    const orderKeys = [...songList.children].map((li) => li.dataset.key);
    data.sort((a, b) => orderKeys.indexOf(a.key) - orderKeys.indexOf(b.key));
    renderGutter();
  });
};

const startQuiz = () => {
  clearHighlightTimer();
  data = shuffle(SONGS).map((title, idx) => ({ key: `${idx}-${title}`, title }));
  renderGutter();
  renderList();
  setScreen("quiz");
};

const goHome = () => {
  clearHighlightTimer();
  setScreen("start");
};

const flashCorrect = () => {
  // green highlight for correct rows, clear after 5s
  const items = [...songList.children];
  items.forEach((li, i) => {
    const title = li.textContent;
    const ok = title === SONGS[i];
    li.classList.toggle("correct", ok);
  });

  clearHighlightTimer();
  highlightTimer = setTimeout(() => {
    items.forEach((li) => li.classList.remove("correct"));
  }, 5000);
};

const checkOrder = () => {
  const total = data.length;
  const correct = countCorrect();
  flashCorrect();

  if (correct === total) {
    setScreen("celebrate");
    setTimeout(() => setScreen("start"), 1600);
  } else {
    alert(`Keep trying — ${correct} of ${total} are in the right place.`);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  document.getElementById("startBtn").addEventListener("click", startQuiz);
  document.getElementById("resetBtn").addEventListener("click", startQuiz);
  document.getElementById("homeBtn").addEventListener("click", goHome);
  document.getElementById("checkBtn").addEventListener("click", checkOrder);

  setupDnD();
  setScreen("start");
});
