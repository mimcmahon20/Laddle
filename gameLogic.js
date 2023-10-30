let selectedLetterIndex = null;

function clearHighlights() {
  document.querySelectorAll(".letter").forEach((button) => {
    button.style.backgroundColor = "transparent";
  });
}

function isOneLetterChanged(word1, word2) {
  if (word1.length !== word2.length) return false;

  let changes = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) changes++;
    if (changes > 1) return false;
  }
  return changes === 1;
}
async function isValidWord(word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await response.json();

    // Check if the response contains a title indicating no definitions found
    if (data.title && data.title === "No Definitions Found") {
      return false;
    }

    // If there's no error title, assume it's a valid word
    return true;
  } catch (error) {
    console.error("Error checking word validity:", error);
    return false;
  }
}

async function getRandomWord() {
  try {
    const response = await fetch(
      "https://random-word-api.herokuapp.com/word?length=4"
    );
    const [word] = await response.json(); // API returns an array, we need the first element
    return word.toUpperCase();
  } catch (error) {
    console.error("Error fetching random word:", error);
    return null;
  }
}

async function setRandomWords() {
  const currentWord = await getRandomWord();
  const targetWord = await getRandomWord();

  if (!gameState.currentWord || !gameState.targetWord) {
    // If it's the first time (or the words are not set), set the current and target words
    gameState.currentWord = currentWord;
    gameState.targetWord = targetWord;
  } else {
    // Otherwise, store them for the next turn
    gameState.nextCurrentWord = currentWord;
    gameState.nextTargetWord = targetWord;
  }
}

function turnCounter(turns) {
  return turns + 1;
}

function checkWinCondition(currentWord, targetWord, turns) {
  if (currentWord === targetWord) return "win";
  if (turns >= 10) return "lose"; // you can adjust the max allowed turns
  return "continue";
}

const gameState = {
  currentWord: "FAST",
  targetWord: "MAKE",
  turnsTaken: 0,
  status: "ongoing", // can be 'ongoing', 'win', or 'lose'
  pathOfWords: [],
  nextCurrentWord: null,
  nextTargetWord: null,
};

function updateWordWithGuess(index, letter) {
  const currentWordArray = gameState.currentWord.split("");
  currentWordArray[index] = letter;
  return currentWordArray.join("");
}

setRandomWords();

export {
  gameState,
  checkWinCondition,
  isOneLetterChanged,
  isValidWord,
  turnCounter,
  updateWordWithGuess,
  getRandomWord,
  setRandomWords,
};
