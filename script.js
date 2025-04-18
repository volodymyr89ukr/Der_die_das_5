let wordSets = []; // 10 наборів по 60 слів
let currentSet = [];
let currentWord = null;
let correctStreak = new Map();
let learnedWords = 0;

// Функції для обробки рівнів складності перекладу
function getSelectedDifficulty() {
  return document.querySelector('input[name="difficulty"]:checked').value;
}

function applyDifficulty(translation, difficulty) {
  if (difficulty === "easy") {
    return translation;
  } else if (difficulty === "medium") {
    return translation
      .split(" ")
      .map((word) => {
        const letters = word.split("");
        const length = letters.length;
        const hideCount = Math.floor(length / 2);

        // Створюємо масив індексів для приховування
        const hideIndices = [];
        while (hideIndices.length < hideCount) {
          const randomIndex = Math.floor(Math.random() * length);
          if (!hideIndices.includes(randomIndex)) {
            hideIndices.push(randomIndex);
          }
        }

        // Замінюємо вибрані літери на *
        return letters
          .map((char, index) => (hideIndices.includes(index) ? "*" : char))
          .join("");
      })
      .join(" ");
  } else if (difficulty === "hard") {
    return translation
      .split(" ")
      .map((word) => {
        if (word.length < 2) return "*";
        return word
          .split("")
          .map((char, index) => (index === 1 ? char : "*"))
          .join("");
      })
      .join(" ");
  }
  return translation;
}

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
  const questionElement = document.getElementById("question");
  questionElement.style.minHeight = "3.5em";
  questionElement.classList.add("multiline");
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

  const difficulty = getSelectedDifficulty();
  const displayedTranslation = applyDifficulty(
    currentWord.translation,
    difficulty
  );

  document.getElementById(
    "question"
  ).innerText = `${currentWord.noun} (${displayedTranslation})`;
  document.getElementById("feedback").innerText = "";
}

function checkAnswer(userInput) {
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    btn.style.transform = "";
    btn.style.opacity = "";
  });
  if (!currentWord) return;

  let isCorrect = userInput === currentWord.gender;

  const clickedBtn = Array.from(buttons).find(
    (btn) => btn.textContent.trim() === userInput
  );
  if (clickedBtn) {
    clickedBtn.classList.add("active");
  }

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

  const feedback = document.getElementById("feedback");
  const feedbackMessage = isCorrect
    ? `✅ Правильно! ${currentWord.gender} ${currentWord.noun} (${currentWord.translation})`
    : `❌ Неправильно. Правильно: ${currentWord.gender} ${currentWord.noun} (${currentWord.translation})`;

  // Показуємо повідомлення з анімацією
  feedback.innerText = feedbackMessage;
  feedback.classList.add("show");

  // Відтворюємо аудіо
  setTimeout(() => {
    playAudio(`${currentWord.gender} ${currentWord.noun}`);
  }, 0);

  // Затримка перед наступним словом
  setTimeout(() => {
    // Ховаємо повідомлення з анімацією
    feedback.classList.remove("show");

    // Чекаємо завершення анімації перед оновленням
    setTimeout(() => {
      feedback.innerText = "";
      showNextWord();
    }, 300); // Час має збігатися з CSS transition
  }, 2200);
}

// Rest of your existing code remains the same

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
