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

  let isDarkMode = false;
  let selectedKey = null;

  keys.forEach((key) => {
    key.addEventListener("click", (e) => {
      const guessedLetter = e.target.getAttribute("data-key");
      if (guessedLetter) {
        selectedKey = guessedLetter;
      }
      if (selectedLetterIndex !== null && guessedLetter) {
        letterButtons[selectedLetterIndex].textContent = guessedLetter;
      }
      console.log(gameState.pathOfWords);
    });
  });

  darkModeToggle.addEventListener("click", () => {
    isDarkMode = !isDarkMode; // Toggle the dark mode flag
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      darkModeToggle.textContent = "Toggle Light Mode";
    } else {
      document.body.classList.remove("dark-mode");
      darkModeToggle.textContent = "Toggle Dark Mode";
    }
  });

  newGameButton.addEventListener("click", async () => {
    resetGame();
    setRandomWords();
    updateUI();
  });

  shareButton.addEventListener("click", async function () {
    handleShare();
  });

  // Highlight the selected letter and store its index
  letterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
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
    });
  });

  // Handle submit button click
  submitButton.addEventListener("click", () => {
    const guessedLetter = selectedKey;
    if (selectedLetterIndex !== null && guessedLetter) {
      handleGuess(selectedLetterIndex, guessedLetter);
    }
  });

  // Handle keyboard input
  document.addEventListener("keydown", (e) => {
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
  });

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
        letterButtons[selectedLetterIndex].style.backgroundColor = "#E54B31";
        displayFeedback("Invalid guess. Please try again.");
      }
      setTimeout(() => {
        clearHighlights();
        selectedLetterIndex = null;
      }, 400);
    } else {
      displayFeedback("Invalid guess. Please try again.");
    }
  }

  function updateUI() {
    // Update displayed word
    const wordArray = gameState.currentWord.split("");
    letterButtons.forEach((button, index) => {
      button.textContent = wordArray[index];
    });

    // Update turns count
    //turnsDisplay.textContent = `Turns: ${gameState.turnsTaken}`;
    updateTargetWord();
    // Check win/lose status and provide feedback
    if (gameState.status === "win") {
      displayFeedback(
        "Congratulations! You've transformed the word successfully. Your path of words is: " +
          gameState.pathOfWords.join(" -> ")
      );
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

  function resetGame() {
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

    //await navigator.clipboard.writeText(gameURL + emojis);

    // Share content using Web Share API
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this game!",
          text: "Laddle \n\n" + emojis,
          url: gameURL,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback to copying URL to clipboard
      const tempTextArea = document.createElement("textarea");
      document.body.appendChild(tempTextArea);
      tempTextArea.value = gameURL + "\n\n" + emojis;
      tempTextArea.select();
      await navigator.clipboard.writeText(tempTextArea.value);
      document.body.removeChild(tempTextArea);

      // Notify the user that the URL has been copied
      alert("Game URL and emojis copied to clipboard!");
    }

    // Notify the user that the URL has been copied
    //alert("Game URL copied to clipboard!");
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
        button.style.color = "#4CAF50";
      } else {
        button.style.color = "#E54B31";
      }
    });
  }

  function updatePreviousWordDisplay() {
    const previousWordDisplay = document.getElementById("previous-guess");
    previousWordDisplay.textContent =
      gameState.pathOfWords[gameState.pathOfWords.length - 2];
  }

  updateUI();
});
