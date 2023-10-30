const gameState = {
  currentWord: "FAST",
  targetWord: "MAKE",
  turnsTaken: 0,
  status: "ongoing", // can be 'ongoing', 'win', or 'lose'
  pathOfWords: [],
  nextCurrentWord: null,
  nextTargetWord: null,
};

// This function checks if two words are different by only one letter
function isOneLetterChanged(word1, word2) {
  if (word1.length !== word2.length) return false;

  let changes = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) changes++;
    if (changes > 1) return false;
  }
  return changes === 1;
}

// This function checks if a word is valid
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

// This function fetches a random word from an API
async function getRandomWord() {
  try {
    const response = await fetch(
      "https://random-word-api.vercel.app/api?words=1&length=4&type=uppercase"
    );
    const [word] = await response.json(); // API returns an array, we need the first element
    return word.toUpperCase();
  } catch (error) {
    console.error("Error fetching random word:", error);
    return null;
  }
}

// This function sets the current and target words in the game state
// and gets new random words for the next turn
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

// This function increments the turn counter
function turnCounter(turns) {
  return turns + 1;
}

// This function checks if the game is won or lost
function checkWinCondition(currentWord, targetWord, turns) {
  if (currentWord === targetWord) return "win";
  if (turns >= 10) return "lose"; // you can adjust the max allowed turns
  return "continue";
}

// This function updates the current word with the guessed letter
function updateWordWithGuess(index, letter) {
  const currentWordArray = gameState.currentWord.split("");
  currentWordArray[index] = letter;
  return currentWordArray.join("");
}

// This function updates the path of words
function updateWordPath() {
  gameState.pathOfWords.push(gameState.currentWord);
}

// This function gets a URL parameter
function getURLParameters(paramName) {
  const result = new URLSearchParams(window.location.search).get(paramName);
  return result ? result : null;
}

// This function initializes the game state
function initGameState() {
  // Get the current and target words from the URL parameters
  const currentWord = getURLParameters("start");
  const targetWord = getURLParameters("target");

  // If they exist, set them in the game state
  if (currentWord && targetWord) {
    gameState.currentWord = currentWord.toUpperCase();
    gameState.targetWord = targetWord.toUpperCase();
  } else {
    // Otherwise, set random words
    setRandomWords();
  }
}

// This function generates a URL for the next turn
function generateGameURL(start, target) {
  return `https://mimcmahon20.github.io/Laddle?start=${start}&target=${target}`;
}

function generateGameEmojis(wordPath, answer) {
  let emojis = "";
  for (let i = 0; i < wordPath.length; i++) {
    for (let j = 0; j < wordPath[i].length; j++) {
      if (wordPath[i][j] === answer[j]) {
        emojis += "🟩";
      } else {
        emojis += "⬛";
      }
    }
    emojis += "\n";
  }

  console.log(emojis)
  return emojis;
}

setRandomWords();
updateWordPath();
initGameState();

console.log(generateGameURL(gameState.currentWord, gameState.targetWord));

export {
  gameState,
  checkWinCondition,
  isOneLetterChanged,
  isValidWord,
  turnCounter,
  updateWordWithGuess,
  getRandomWord,
  setRandomWords,
  updateWordPath,
  generateGameURL,
  generateGameEmojis,
};
