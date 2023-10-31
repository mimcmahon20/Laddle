const fetch = require('node-fetch');
const fs = require('fs');

const API_URL = 'https://random-word-api.vercel.app/api?words=1&length=4&type=uppercase';

async function fetchWord() {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data[0];
}

async function generateData() {
    const data = [];
    let currentDate = new Date(2023, 9, 30); // Oct 30th, 2023
    const endDate = new Date(2023, 10, 30);  // Nov 30th, 2023

    while (currentDate <= endDate) {
        const startingWord = await fetchWord();
        let targetWord = await fetchWord();
        
        // Ensure startingWord and targetWord are not the same
        while (startingWord === targetWord) {
            targetWord = await fetchWord();
        }

        data.push({
            date: currentDate.toISOString().slice(0, 10),
            startingWord,
            targetWord
        });

        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    fs.writeFileSync('word_data.json', JSON.stringify(data, null, 4));
    console.log('Data saved to word_data.json');
}

generateData();