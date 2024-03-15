import {
  findShortestPath,
} from "./shortestPath.js";


const gameState = {
  currentWord: "",
  targetWord: "",
  turnsTaken: 0,
  status: "ongoing", // can be 'ongoing', 'win', or 'lose'
  pathOfWords: [],
  nextCurrentWord: null,
  nextTargetWord: null,
};

let todaysStartWord = "";

const wordList = new Set();
let neighborsDict = {};

// This function initializes the game state
async function initGameState() {
  await loadWordList();
  neighborsDict = await loadNeighborsDict();
  // Get the current and target words from the URL parameters
  const currentWord = getURLParameters("start");
  const targetWord = getURLParameters("target");


  // If they exist, set them in the game state
  if (currentWord && targetWord) {
    gameState.currentWord = currentWord.toUpperCase();
    gameState.targetWord = targetWord.toUpperCase();
  } else {
    //otherwise, get today's words
    let todaysWords;
    await getWordsForToday().then(data => {
      todaysWords = data;
      todaysStartWord = todaysWords.startingWord;
      gameState.currentWord = todaysWords.startingWord.toUpperCase();
      gameState.targetWord = todaysWords.targetWord.toUpperCase();
    });
    setRandomWords();
  }
  updateWordPath();
  
}

// This function loads the wordList from the JSON file
async function loadWordList() {
  try {
    const response = await fetch("js/wordList.json");
    console.log('got response from wordList.json')
    const data = await response.json();
    data.forEach((word) => wordList.add(word.toUpperCase()));
  }
  catch (error) {
    console.error("Error loading word list:", error);
  }
}

async function loadNeighborsDict() {
  try {
    const response = await fetch("js/wordNeighbors.json");
    console.log('got response from wordNeighbors.json')
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Could not load word neighbors dictionary:', error);
  }
}

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
function isValidWord(word) {
  return wordList.has(word.toUpperCase());  
}

// This function fetches a random word from an API
function getRandomWord() {
  const randomNumOne = Math.floor(Math.random() * 2096);
  const arrWordList = Array.from(wordList);
  return arrWordList[randomNumOne];
}

// This function sets the current and target words in the game state
// and gets new random words for the next turn
function setRandomWords() {
  let pathBetweenWords = false;
  let currentWord;
  let targetWord;
  while (!pathBetweenWords) {
    currentWord = getRandomWord();
    targetWord = getRandomWord();
    let path = findShortestPath(currentWord, targetWord, neighborsDict);
    if (path) {
      pathBetweenWords = true;
    }
  }
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
function checkWinCondition(currentWord, targetWord) {
  if (currentWord === targetWord) return "win";
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

// This function resets the wordPath
function resetWordPath() {
  gameState.pathOfWords = [];
}

// This function gets a URL parameter
function getURLParameters(paramName) {
  const result = new URLSearchParams(window.location.search).get(paramName);
  return result ? result : null;
}

async function getWordsForToday() {
  try {
      // Fetch the JSON file
      const response = await fetch('js/word_data.json');
      if (!response.ok) {
          console.error('Failed to fetch word_data.json');
          return null;
      }

      const wordData = await response.json();

      // Get the current date in the format 'YYYY-MM-DD'
      const currentDate = new Date().toISOString().slice(0, 10);

      // Find the entry for the current date
      const todayData = wordData.find(entry => entry.date === currentDate);

      if (todayData) {
          return {
              startingWord: todayData.startingWord,
              targetWord: todayData.targetWord
          };
      } else {
          // Handle the case where there's no entry for the current date
          console.error('No word data found for today!');
          return null;
      }
  } catch (err) {
      console.error('Error reading word_data.json:', err);
      return null;
  }
}

// This function generates a URL for the next turn
function generateGameURL(start, target) {
  return `https://mimcmahon20.github.io/Ladderl?start=${start}&target=${target}`;
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
  return emojis.trim();
}

function resetGameState() {
  gameState.currentWord = gameState.pathOfWords[0];
  gameState.turnsTaken = 0;
  gameState.status = "ongoing";
  gameState.pathOfWords = [gameState.currentWord];
}

//initGameState();

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
  resetWordPath,
  initGameState,
  todaysStartWord,
  resetGameState,
  wordList,
  neighborsDict,
};
