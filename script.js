let wordSets = []; // 10 наборів по 60 слів
let currentSet = [];
let currentWord = null;
let correctStreak = new Map();
let learnedWords = 0;

// Розбиваємо words на 10 наборів по 60 слів
function prepareWordSets() {
  for (let i = 0; i < 10; i++) {
    wordSets.push(words.slice(i * 60, (i + 1) * 60));
  }
}

function startGame(selectedSetIndex) {
  currentSet = [...wordSets[selectedSetIndex]];
  learnedWords = 0;
  correctStreak = new Map();
  updateProgress();
  document.getElementById("set-selection").classList.add("hidden");
  document.getElementById("game-section").classList.remove("hidden");
  showNextWord();
}

function showNextWord() {
  if (learnedWords >= 60) {
    document.getElementById("result").innerText =
      "🎉 Комплект вивчено! Вітаємо!";
    return;
  }

  // Вибираємо слово з тих, що ще не вивчені
  const remainingWords = currentSet.filter(
    (word) => (correctStreak.get(word.noun) || 0) < 2
  );
  if (remainingWords.length === 0) {
    document.getElementById("result").innerText = "🎉 Усі слова вивчено!";
    return;
  }

  currentWord =
    remainingWords[Math.floor(Math.random() * remainingWords.length)];
  document.getElementById(
    "question"
  ).innerText = `${currentWord.noun} (${currentWord.translation})`;
  document.getElementById("feedback").innerText = "";
}

function checkAnswer(userInput) {
  if (!currentWord) return;

  let isCorrect = userInput === currentWord.gender;

  if (isCorrect) {
    const streakCount = (correctStreak.get(currentWord.noun) || 0) + 1;
    correctStreak.set(currentWord.noun, streakCount);

    if (streakCount === 2) {
      learnedWords++;
      updateProgress();
    }
  } else {
    correctStreak.set(currentWord.noun, 0);
  }

  const feedbackMessage = isCorrect
    ? `✅ Правильно! ${currentWord.gender} ${currentWord.noun} (${currentWord.translation})`
    : `❌ Неправильно. Правильно: ${currentWord.gender} ${currentWord.noun} (${currentWord.translation})`;

  document.getElementById("feedback").innerText = feedbackMessage;

  setTimeout(() => {
    playAudio(`${currentWord.gender} ${currentWord.noun}`);
  }, 100);

  setTimeout(showNextWord, 2100);
}

function updateProgress() {
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const progressPercent = (learnedWords / 60) * 100;

  progressBar.style.width = `${progressPercent}%`;
  progressText.innerText = `${learnedWords}/60 вивчено`;
}

function playAudio(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

// Ініціалізація гри
document.addEventListener("DOMContentLoaded", () => {
  prepareWordSets();

  document.getElementById("start-btn").addEventListener("click", () => {
    const selectedSet = document.getElementById("word-set").value;
    if (selectedSet) startGame(parseInt(selectedSet));
  });

  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", () =>
      checkAnswer(button.textContent.trim())
    );
  });

  document.getElementById("play-audio").addEventListener("click", () => {
    if (currentWord) playAudio(`${currentWord.gender} ${currentWord.noun}`);
  });
});
