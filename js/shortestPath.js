import {
    wordList,
    isOneLetterChanged,
    isValidWord,
} from "./gameLogic.js"

// function to find neighbors of a word
function findNeighbors(word) {
    word = word.toUpperCase();
    let neighbors = [];
    for (let i = 0; i < word.length; i++) {
        for (let c = 0; c < 26; c++) { // loop through all letters A to Z
            const newWordArray = [...word];
            newWordArray[i] = String.fromCharCode(65 + c); // 65 is the char code for 'A'
            const newWord = newWordArray.join('');
            console.log(newWord);
            if (newWord !== word && isValidWord(newWord)) {
                neighbors.push(newWord);
            }
        }
    }
    return neighbors;
}

// Breadth-first search function to find shortest path between two words
function findShortestPath(word1, word2) {
    word1 = word1.toUpperCase();
    word2 = word2.toUpperCase();

    if (word1 === word2) {
        return [word1];
    }

    let queue = [[word1, [word1]]];
    let visited = new Set([word1]);

    while (queue.length > 0) {
        const [currentWord, path] = queue.shift();

        if (currentWord === word2) {
            return path;
        }

        const neighbors = findNeighbors(currentWord);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([neighbor, path.concat([neighbor])]);
            }
        }
    }

    return null; // or an empty list, if you prefer
}

export {
    findNeighbors,
    findShortestPath,
}