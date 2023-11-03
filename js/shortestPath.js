import {
    neighborsDict,
} from "./gameLogic.js"

// function to find neighbors of a word
function findNeighbors(word) {
    return neighborsDict[word] || [];
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