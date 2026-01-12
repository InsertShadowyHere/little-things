/* 
TODO:
format the page so its not ugly
display keyboard
*/


let word;
let cts;

// GRID SIZE basically
const wordLength = 5;
const guesses = 6;

let pastDailyGames = [];
let pastInfGames = [];

let date = new Date();
let dayID = date.getUTCDate() + date.getUTCMonth()*100 + date.getUTCFullYear()*10000;

let colorsKnown = [[".", ".", ".", ".", "."], [], []]; // format: [.....] green letters, [yellows], [grays]

let wordList = [];
let wordOptions = []; 
let wordSet;
let currInd = 0;
let curr = [];
let pastGuesses = [];
let pastColors = [];
let gameOver = 0;
let currRow = 0;
let mode = "daily";

let emojiGraph;
let splashID = 0;

const asciiLower = "abcdefghijklmnopqrstuvwxyz"

// COLORS
let colorblindMode = false;
let GREEN = "#ade201ff";
let YELLOW = "#e5d600ff";
let GRAY = "#737373ff";
let GREEN_SQUARE = '🟩'
let YELLOW_SQUARE = '🟨'
const GRAY_SQUARE = '⬜'

function saveGame() {
  localStorage.setItem(mode + '-pastGuesses', JSON.stringify(pastGuesses));
  localStorage.setItem(mode + '-gameOver', gameOver.toString());
  localStorage.setItem(mode + '-currRow', currRow.toString());
  localStorage.setItem(mode + '-word', word.join(""));
  localStorage.setItem('pastDailyGames', JSON.stringify(pastDailyGames))
  localStorage.setItem('pastInfGames', JSON.stringify(pastInfGames))
  dayID = date.getUTCDate() + date.getUTCMonth()*100 + date.getUTCFullYear()*10000
  localStorage.setItem('lastDayPlayed', dayID.toString());
  
  // colors for keyboard & words left
  localStorage.setItem(mode + '-colorKnown', JSON.stringify(colorsKnown))
}

function clearGame() {
  localStorage.clear();
}

function clearInfiniteGame() {
  localStorage.setItem('infinite-pastGuesses', null);
  localStorage.setItem('infinite-gameOver', null);
  localStorage.setItem('infinite-currRow', null);
  localStorage.setItem('infinite-word', null);
}

function clearDailyGame() {
  localStorage.setItem('daily-pastGuesses', null);
  localStorage.setItem('daily-gameOver', null);
  localStorage.setItem('daily-currRow', null);
  localStorage.setItem('daily-word', null);
}

function loadGame() {
  pastDailyGames = JSON.parse(localStorage.getItem('pastDailyGames')) || [];
  pastInfGames = JSON.parse(localStorage.getItem('pastInfGames')) || [];

  let tmp = parseInt(localStorage.getItem('lastDayPlayed'));
  if (tmp !== dayID) {
    clearDailyGame();
  }

  word = localStorage.getItem(mode + '-word');
  if (word === "null" || word === null) {
    if (mode === "daily") {
      generateDailyWord();
    }
    else
      generateWord();
  }
  else {
    word = word.split("")
    generateCTS();  
  }
  console.log('oooog')
  colorsKnown = localStorage.getItem(mode + '-colorsKnown') || [[".", ".", ".", ".", "."], [], []];
  updateWordsLeft();
  past = JSON.parse(localStorage.getItem(mode + '-pastGuesses'));
  gameOver = parseInt(localStorage.getItem(mode + '-gameOver'));
  n = parseInt(localStorage.getItem(mode + '-currRow'));

  for (let i = 0; i<n; i++) {
    currRow = i
    for (let j = 0; j<wordLength; j++) {
      document.querySelectorAll(".row")[i].querySelectorAll('.cell')[j].textContent = past[i][j].toUpperCase();
    }
    
    curr = past[i].split("");
    fillRow();
  }
}

function endGame(win) {
  if (gameOver)
    return;

  gameOver = win;

  if (mode === "daily")
    pastDailyGames.push(win ? pastGuesses.length + 1 : 0)
  else
    pastInfGames.push(win ? pastGuesses.length + 1 : 0)
  document.getElementById('end-text').innerHTML = win ? "<u>Victory!</u>" : "<u>Better Luck Next Time</u>"

  // open end popup
  popupEnd();
}

function renderDaily(switching = false) {
  loadGame();
  if (switching)
    closeEnd();
}

function renderInfinite(switching = false) {
  loadGame();
  if (switching)
    closeEnd();
}

function resetGame() {
  document.getElementById("wordle-grid").textContent = '';
  console.log('egihi')
  colorsKnown = [[".", ".", ".", ".", "."], [], []];

  currRow = 0;
  currInd = 0;
  gameOver = 0;
  pastGuesses = [];
  pastColors = [];
  curr = [];
  generateRows();
}

function fillRow() {
  // validate word
  if (!wordSet.has(curr.join(""))) {
    splash("invalid word! wobbble")
    return;
  }

  if (pastGuesses.includes(curr.join(""))) {
    splash("guessed already! wobble")
    return;
  }

  const row = document.querySelectorAll('.row')[currRow];
  const cells = row.querySelectorAll('.cell');
  let ctsClone = { ...cts };
  let greensCt = 0;
  pastColors.push([0, 0, 0, 0, 0])
  // sweep for greens
  cells.forEach((cell, i) => {
    if (curr[i] === word[i]) {
      console.log('hi', i, curr)
      colorsKnown[0][i] = curr[i]
      cell.style.background = GREEN;
      pastColors[currRow][i] = 2
      greensCt += 1;
      ctsClone[curr[i]] -= 1;
    }
  });
  if (greensCt === wordLength) {
    endGame(2);
  }


  // sweep for grays and yellows
  cells.forEach((cell, i) => {
    if (curr[i] === word[i])
      return;
    else if (word.includes(curr[i]) && ctsClone[curr[i]] > 0) {
      console.log("found a yellow")
      colorsKnown[1].push([i, curr[i]]);
      console.log(colorsKnown[1])
      cell.style.background = YELLOW;
      pastColors[currRow][i] = 1
      ctsClone[curr[i]] -= 1;
    }
    else
      cell.style.background = GRAY;
    colorsKnown[2].push(curr[i]);
  });

  pastGuesses.push(curr.join(""))
  currRow += 1;
  currInd = 0;
  curr = [];
  updateWordsLeft();
  if (currRow === guesses && !gameOver)
    endGame(1);
  saveGame();
  
}

function splash(text) {
  const splashElem = document.getElementById('splash-text')
  splashElem.textContent = text;
  splashID += 1;
  let n = splashID;
  setTimeout(() => {
    if (n === splashID)
      splashElem.textContent = '';
  }, 1500); // clears after 1.5 seconds

}

document.addEventListener('keydown', function (event) {
  // if key is esc, close popups
  if (event.key === "Escape") {
    closeStats();
    closeEnd();
  }
  
  // ignore modifiers
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return;
  }

  // ignore game over
  if (gameOver) {
    return;
  }

  // if key is backspace or delete, delete
  if ((event.key === "Backspace" || event.key === "Delete") && currInd !== 0) {
    document.querySelectorAll(".row")[currRow].querySelectorAll('.cell')[currInd - 1].textContent = "";
    currInd -= 1;
    curr.pop();
  }

  if (event.key === "Enter") {
    if (currInd === wordLength) fillRow();
    else {
      splash("word not done (wobble!)")
    }
    return;
  }

  // IF ROW IS FULL
  if (currInd === wordLength) {
    return;
  }

  // if key is not a letter, ignore
  if (!asciiLower.includes(event.key))
    return;

  // add letter to HTML
  document.querySelectorAll(".row")[currRow].querySelectorAll('.cell')[currInd].textContent = event.key.toUpperCase();
  // move curr one
  currInd += 1;
  curr.push(event.key)
  //splash(curr)
});

async function loadWords() {
  try {
    const response = await fetch('guessable-words.txt');
    const text = await response.text();
    wordOptions = text.split('\n').map(w => w.trim()).filter(Boolean);
  } catch {
    wordOptions = ["apple", "banan", "heyyy", "boooo", "tomat", "frogi", "tomal"];
  }
  try {
    const response = await fetch('valid-words.txt');
    const text = await response.text();
    wordList = text.split('\n').map(w => w.trim()).filter(Boolean);
    wordSet = new Set(wordList);
  } catch {
    wordList = ["apple", "banan", "heyyy", "boooo", "tomat", "frogi", "tomal"];
    wordSet = new Set(wordList);
  }
  updateWordsLeft();
}

function generateWord() {
  word = wordOptions[Math.floor(Math.random() * wordOptions.length)].split("");
  generateCTS();
}

function generateDailyWord() {
  word = wordOptions[getRandomDaySeeded() % wordOptions.length].split("");
  generateCTS();
}

function getRandomDaySeeded() {
  let date = new Date();
  let n = date.getUTCDay() * 4 + date.getUTCFullYear() + date.getUTCMonth() * 2;
  n = ((n >>> 16) ^ n) * 0x45d9f3b;
  n = ((n >>> 16) ^ n) * 0x45d9f3b;
  n = (n >>> 16) ^ n;
  return n >>> 0;
}

function generateCTS() {
  cts = {};
  word.forEach((letter, i) => {
    if (cts[letter])
      cts[letter] += 1;
    else
      cts[letter] = 1;
  })
}

function generateRows() {
  const grid = document.getElementById('wordle-grid');

  for (let i = 0; i < guesses; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    for (let j = 0; j < wordLength; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

function selectTab(new_mode) {
  document.getElementById('daily-tab').classList.toggle('active', new_mode === 'daily');
  document.getElementById('infinite-tab').classList.toggle('active', new_mode === 'infinite');

  mode = new_mode;
  document.getElementById('reset-button').style.visibility = false
  resetGame();
  if (mode === "daily") {
    renderDaily(switching = true);
    document.getElementById('reset-button').hidden = true;
    document.getElementById('countdown').hidden = false;
  }
  else {
    renderInfinite(switching = true);
    document.getElementById('reset-button').hidden = false
    document.getElementById('countdown').hidden = true;
  }
}

function popupStats() {
  document.getElementById("stats-popup").style.display = 'flex';
  let total = 0;
  statsDaily = pastDailyGames.reduce((count, item) => {
    count[item] = (count[item] || 0) + 1;
    total += item
    return count;
  }, {})
  
  winsDaily = pastDailyGames.length - (statsDaily[0] || 0);
  text = "Wins: " + winsDaily + "/" + pastDailyGames.length;
  document.getElementById("daily-wins").textContent = text;
  text = "Average Guesses: " + (total / winsDaily).toFixed(1)
  if (!total) text = "Average Guesses: N/A"
  document.getElementById("daily-average").textContent = text;

  // Update graph bars
  const maxCountDaily = Math.max(...[1,2,3,4,5,6].map(i => statsDaily[i] || 0), 1);
  for (let i = 1; i <= 6; i++) {
    const count = statsDaily[i] || 0;
    const bar = document.getElementById('daily-bar-' + i);
    bar.style.width = (count / maxCountDaily * 100) + '%';
    bar.textContent = count;
  }
  

  total = 0;
  statsInf = pastInfGames.reduce((count, item) => {
    count[item] = (count[item] || 0) + 1;
    total += item;
    return count;
  }, {})
  winsInf = pastInfGames.length - (statsInf[0] || 0);
  text = "Wins: " + winsInf + "/" + pastInfGames.length;
  document.getElementById("inf-wins").textContent = text;
  text = "Average Guessees: " + (total / winsInf).toFixed(1)
  if (!total) text = "Average Guesses: N/A"
  document.getElementById("inf-average").textContent = text;

  // Update graph bars
  const maxCountInf = Math.max(...[1,2,3,4,5,6].map(i => statsInf[i] || 0), 1);
  for (let i = 1; i <= 6; i++) {
    const count = statsInf[i] || 0;
    const bar = document.getElementById('inf-bar-' + i);
    bar.style.width = (count / maxCountInf * 100) + '%';
    bar.textContent = count;
  }
}

function closeStats() {
  document.getElementById("stats-popup").style.display = 'none';
}

function popupEnd() {
  document.getElementById("end-popup").style.display = 'flex';
  if (mode === "infinite")
    document.getElementById('reset-button-popup').hidden = false;
  else
    document.getElementById('reset-button-popup').hidden = true;
}

function closeEnd() {
  document.getElementById("end-popup").style.display = 'none';
}

function updateWordsLeft() {
  let wordsLeft = [];
  let greenRegex = colorsKnown[0].join("")
  const regex = new RegExp("^" + greenRegex + "$")
  wordOptions.forEach((tmpWord) => {
    if (!regex.test(tmpWord))
      return;
    
    
    // Yellows: colorsKnown[1] is array of [pos, letter]
    for (const [pos, letter] of colorsKnown[1]) {
      if (!tmpWord.includes(letter) || tmpWord[pos] === letter) return;
    }
    // Grays: colorsKnown[2] is array of letters
    for (const letter of colorsKnown[2]) {
      // If the letter is not green or yellow anywhere, it must not appear
      if (tmpWord.includes(letter) && !colorsKnown[0].includes(letter) && !colorsKnown[1].some(([_, l]) => l === letter)) {
        return;
      }
    }
    console.log(tmpWord)
    wordsLeft.push(tmpWord);




  })
  document.getElementById('words-left').textContent = "Options left: " + wordsLeft.length
}

function toggleColorblindMode() {
  console.log('hiefef')
  colorblindMode = !colorblindMode;
  document.getElementById('colorblind-mode').textContent = "Colorblind Mode " + (colorblindMode ? "ON" : "OFF")
  if (!colorblindMode) {
    document.getElementById('colorblind-indicator').hidden = true;
    GREEN = "#ade201ff";
    YELLOW = "#e5d600ff";
    GRAY = "#737373ff";
    GREEN_SQUARE = '🟩'
    YELLOW_SQUARE = '🟨'
  }
  else {
    document.getElementById('colorblind-indicator').hidden = false;
    GREEN = "#e29e01ff";
    YELLOW = "#88fae7ff";
    GRAY = "#737373ff";
    GREEN_SQUARE = '🟧'
    YELLOW_SQUARE = '🟦'
  }
  console.log('hi')
  resetGame();
  if (mode === "daily")
    renderDaily();
  else 
    renderInfinite();
}

async function copyEmojis() {
  emojiGraph = pastColors.map(row =>
  row.map(clr => 
    clr === 2 ? GREEN_SQUARE :
    clr === 1 ? YELLOW_SQUARE :
    GRAY_SQUARE
  ).join('')
  ).join('\n');

  let date = new Date();
  let dateText = date.getUTCMonth()+1 + "/" + date.getUTCDay() + "/" + date.getUTCFullYear()
  text = "Shdwy's Ripoff Wordle\n" + dateText + "\n" + emojiGraph
  await navigator.clipboard.writeText(text);
  const copyText = document.getElementById('copy-text')
  copyText.textContent = "Copied!"
  setTimeout(() => {
    copyText.textContent = ""
  }, 1500); // clears after 1.5 seconds
}

async function start() {
  await loadWords();
  resetGame();
  renderDaily();
  
}

start();

function updateCountdown() {
  const now = new Date();
  // Next UTC midnight
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const diff = next - now;
  const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  if (hours === 0 && minutes === 0 && seconds <= 1) {
    clearDailyGame();
  }
  document.getElementById('countdown').textContent = `Next daily word in: ${hours}:${minutes}:${seconds}`;
}


setInterval(updateCountdown, 1000);
updateCountdown();

/*
We need a function to draw the daily and to draw the infinite
The game should be saved to whichever mode as soon as its loaded and every time enter is pressed or a game is won

renderDaily
renderInfinite
resetInfinite

switching to the daily tab should show the daily load and should not be resetable


*/