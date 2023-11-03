import {
  gameState,
  isOneLetterChanged,
  isValidWord,
  turnCounter,
  checkWinCondition,
  updateWordWithGuess,
  setRandomWords,
  updateWordPath,
  generateGameURL,
  generateGameEmojis,
  resetWordPath,
  initGameState,
  todaysStartWord,
  resetGameState,
  wordList,
} from "./gameLogic.js";

let selectedLetterIndex = null;

window.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const letterButtons = document.querySelectorAll(".letter");
  const submitButton = document.getElementById("submit-guess");
  const feedbackDiv = document.querySelector(".feedback");
  const turnsDisplay = document.querySelector(".turns");
  const newGameButton = document.getElementById("new-game");
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const keys = document.querySelectorAll(".key");
  const previousGuess = document.getElementById("previous-guess");
  const shareButton = document.getElementById("share-button");
  const shareModel = document.getElementById("shareModal");
  const resultsPath = document.getElementById("results-path");
  const resetButton = document.getElementById("reset-game");
  let isDarkMode = false;
  let selectedKey = null;

  // Event Listeners
  letterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      handleLetterSelection(e);
    });
  });

  keys.forEach((key) => {
    key.addEventListener("click", (e) => {
      handleKeyPress(e);
    });
  });

  darkModeToggle.addEventListener("click", () => {
    handleDarkModeToggle();
  });

  newGameButton.addEventListener("click", async () => {
    await resetGame();
    await setRandomWords();
    setTimeout(updateUI(), 20);
  });

  resetButton.addEventListener("click", async () => {
    resetGameState();
    updateUI();
  });

  shareButton.addEventListener("click", async function () {
    handleShare();
  });

  submitButton.addEventListener("click", () => {
    handleSubmit();
  });

  document.addEventListener("keydown", (e) => {
    handleKeyboardInput(e);
  });

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    darkModeToggle.click();
  } else {
    // the dark mode is not enabled
  }


  //helper functions below
  function handleKeyPress(e) {
    const guessedLetter = e.target.getAttribute("data-key");
    if (guessedLetter) {
      selectedKey = guessedLetter;
    }
    if (selectedLetterIndex !== null && guessedLetter) {
      letterButtons[selectedLetterIndex].textContent = guessedLetter;
    }
  }

  function handleDarkModeToggle() {
    isDarkMode = !isDarkMode; // Toggle the dark mode flag
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      darkModeToggle.innerHTML =
        '<img class="svg" src="assets/sun.svg" alt="Toggle Light Mode" />';
    } else {
      document.body.classList.remove("dark-mode");
      darkModeToggle.innerHTML =
        '<img class="svg" src="assets/moon.svg" alt="Toggle Dark Mode" />';
    }
  }

  function handleLetterSelection(e) {
    // Reset all letters to their current state
    const wordArray = gameState.currentWord.split("");
    letterButtons.forEach((btn, idx) => {
      btn.textContent = wordArray[idx];
      btn.style.backgroundColor = "transparent"; // Reset color
    });

    // Highlight the newly selected letter
    if (isDarkMode) {
      e.target.style.backgroundColor = "#333";
    } else {
      e.target.style.backgroundColor = "#e0e0e0";
    }
    selectedLetterIndex = parseInt(e.target.dataset.index);
  }

  function handleSubmit() {
    const guessedLetter = selectedKey;
    if (selectedLetterIndex !== null && guessedLetter) {
      handleGuess(selectedLetterIndex, guessedLetter);
    }
  }

  function handleKeyboardInput(e) {
    const guessedLetter = e.key.toUpperCase();

    if (
      guessedLetter.length <= 1 &&
      selectedLetterIndex !== null &&
      guessedLetter
    ) {
      //handleGuess(selectedLetterIndex, guessedLetter);
      selectedKey = guessedLetter;
      letterButtons[selectedLetterIndex].textContent = selectedKey;
    }
    //try to submit if key is enter
    if (e.key == "Enter") {
      if (selectedLetterIndex !== null && guessedLetter) {
        handleGuess(selectedLetterIndex, selectedKey);
      }
    }
  }

  async function handleGuess(index, letter) {
    const newWord = updateWordWithGuess(index, letter);
    // Both checks are now asynchronous
    if (isOneLetterChanged(gameState.currentWord, newWord)) {
      if (await isValidWord(newWord)) {
        gameState.currentWord = newWord;
        updateWordPath();
        gameState.turnsTaken = turnCounter(gameState.turnsTaken);
        gameState.status = checkWinCondition(
          gameState.currentWord,
          gameState.targetWord,
          gameState.turnsTaken
        );
        letterButtons[selectedLetterIndex].style.backgroundColor = "#4CAF50";
        updateUI();
      } else {
        letterButtons[selectedLetterIndex].style.backgroundColor = "#e85d46";
        setTimeout(() => {
          letterButtons[selectedLetterIndex].textContent =
            gameState.pathOfWords[gameState.pathOfWords.length - 1][index];
        }, 50);
      }
      setTimeout(() => {
        clearHighlights();
        selectedLetterIndex = null;
      }, 400);
    } else {
    }
  }

  async function initUI() {
    await initGameState();
    updateUI();
  }

  function updateUI() {
    // Update displayed word
    const wordArray = gameState.currentWord.split("");
    letterButtons.forEach((button, index) => {
      button.textContent = wordArray[index];
    });

    // Update turns count
    turnsDisplay.textContent = `${gameState.turnsTaken}`;
    updateTargetWord();
    // Check win/lose status and provide feedback
    if (gameState.status === "win") {
      displayShareModel();
    } else if (gameState.status === "lose") {
      displayFeedback("Sorry, you've exceeded the maximum turns. Try again!");
    } else {
      feedbackDiv.textContent = ""; // clear feedback if game is ongoing
    }
    checkIfTargetLetterIsCorrect();
    //updatePreviousWordDisplay();
    // const targetWordDisplay = document.getElementById("display-target-word");
    // targetWordDisplay.textContent = gameState.targetWord;
  }

  async function resetGame() {
    gameState.turnsTaken = 0;
    gameState.status = "ongoing";
    gameState.currentWord = gameState.nextCurrentWord;
    gameState.targetWord = gameState.nextTargetWord;
    resetWordPath();
    gameState.pathOfWords.push(gameState.currentWord);
    feedbackDiv.textContent = "";
  }

  function clearHighlights() {
    letterButtons.forEach((button) => {
      button.style.backgroundColor = "transparent";
    });
  }

  function displayFeedback(message) {
    feedbackDiv.textContent = message;
  }

  async function handleShare() {
    // Assuming startWord and targetWord are the words you want to share
    const startWord = gameState.pathOfWords[0];
    const targetWord = gameState.targetWord;
    const pathOfWords = gameState.pathOfWords;

    // Generate the URL
    const gameURL = generateGameURL(startWord, targetWord);

    const emojis = generateGameEmojis(pathOfWords, targetWord);
    let title = "Ladderl";
    //await navigator.clipboard.writeText(gameURL + emojis);
    if (todaysStartWord == gameState.pathOfWords[0]) {
      const date = new Date();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      title += " - " + month + "/" + day + "\n";
    }

    title += "- " + gameState.turnsTaken + " turns\n";
    // Share content using Web Share API
    if (navigator.share) {
      navigator
        .share({
          title: "Can you beat this?",
          text: title + emojis,
          url: gameURL,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback to copying URL to clipboard
      const tempTextArea = document.createElement("textarea");
      document.body.appendChild(tempTextArea);
      tempTextArea.value = gameURL + "\n" + title + emojis;
      tempTextArea.select();
      await navigator.clipboard.writeText(tempTextArea.value);
      document.body.removeChild(tempTextArea);

      // Notify the user that the URL has been copied
      alert("Game URL and emojis copied to clipboard!");
    }

    // Notify the user that the URL has been copied
    //alert("Game URL copied to clipboard!");
  }

  function displayShareModel() {
    triggerConfetti();
    shareModel.style.display = "block";

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[1];
    resultsPath.textContent = gameState.pathOfWords.join(" -> ");
    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      shareModel.style.display = "none";
    };
  }

  function updateTargetWord() {
    const targetWordDisplay = document.querySelectorAll(".target-letter");
    targetWordDisplay.forEach((button, index) => {
      button.textContent = gameState.targetWord.split("")[index];
    });
  }

  function checkIfTargetLetterIsCorrect() {
    const targetWordDisplay = document.querySelectorAll(".target-letter");
    targetWordDisplay.forEach((button, index) => {
      if (button.textContent == gameState.currentWord.split("")[index]) {
        button.style.backgroundColor = "#4CAF50";
      } else {
        button.style.backgroundColor = "#E54B31";
      }
    });
  }

  function updatePreviousWordDisplay() {
    const previousWordDisplay = document.getElementById("previous-guess");
    previousWordDisplay.textContent =
      gameState.pathOfWords[gameState.pathOfWords.length - 2];
  }

  function triggerConfetti() {
    const confettiCount = 100;
    const parentElement = document.body; // Can be any container where you want the confetti

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");

      // Randomize properties for each confetti particle
      const left = Math.random() * 100 + "vw";
      const animationDuration = Math.random() * 3 + 2 + "s";
      const backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

      confetti.style.left = left;
      confetti.style.animationDuration = animationDuration;
      confetti.style.backgroundColor = backgroundColor;

      parentElement.appendChild(confetti);

      // Optional: Remove confetti from the DOM after animation completes to free up resources
      setTimeout(() => {
        confetti.remove();
      }, parseFloat(animationDuration) * 1000); // Convert to milliseconds
    }
  }
  initUI();
});
