const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('statusMessage');
const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');

const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreTieEl = document.getElementById('scoreTie');

let options = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; // X: Oyuncu, O: Bilgisayar
let isRunning = false;
let difficulty = "hard"; // "easy", "medium", "hard" (Çok Zor)

// Kazanma Kombinasyonları
const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let scores = {
    X: 0,
    O: 0,
    tie: 0
};

// Arayüze Zorluk Seçim Butonlarını Ekleyelim
addDifficultyControls();
initializeGame();

function addDifficultyControls() {
    const container = document.querySelector('.game-container');
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'difficulty-controls';
    controlsDiv.style.marginBottom = '15px';
    controlsDiv.style.display = 'flex';
    controlsDiv.style.gap = '5px';

    controlsDiv.innerHTML = `
        <button class="diff-btn" data-diff="easy" style="background:#e0e0e0; color:#333; font-size:12px; padding:6px;">Kolay</button>
        <button class="diff-btn" data-diff="medium" style="background:#e0e0e0; color:#333; font-size:12px; padding:6px;">Orta</button>
        <button class="diff-btn active-diff" data-diff="hard" style="background:#0277bd; color:white; font-size:12px; padding:6px;">Çok Zor</button>
    `;

    const scoreboard = document.querySelector('.scoreboard');
    container.insertBefore(controlsDiv, scoreboard);

    // Zorluk Butonu Dinleyicileri
    const diffButtons = document.querySelectorAll('.diff-btn');
    diffButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            diffButtons.forEach(b => {
                b.style.background = '#e0e0e0';
                b.style.color = '#333';
            });
            e.target.style.background = '#0277bd';
            e.target.style.color = 'white';
            difficulty = e.target.getAttribute('data-diff');
            restartGame();
        });
    });
}

function initializeGame() {
    cells.forEach(cell => cell.addEventListener('click', cellClicked));
    restartBtn.addEventListener('click', restartGame);
    resetScoreBtn.addEventListener('click', resetScores);
    statusMessage.textContent = `Sıra Sende (X)`;
    isRunning = true;
}

function cellClicked() {
    const cellIndex = this.getAttribute('data-index');

    if (options[cellIndex] !== "" || !isRunning || currentPlayer === "O") {
        return;
    }

    makeMove(this, cellIndex, "X");
    
    if (checkWinner()) return;

    currentPlayer = "O";
    statusMessage.textContent = `Sıra Rakipte (O)`;
    
    setTimeout(computerMove, 500);
}

function makeMove(cell, index, player) {
    options[index] = player;
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
}

function computerMove() {
    if (!isRunning) return;

    let bestSpot;

    if (difficulty === "easy") {
        bestSpot = getRandomMove();
    } else if (difficulty === "medium") {
        bestSpot = getMediumMove();
    } else {
        // Çok Zor (Minimax Algoritması - Yenilmez)
        bestSpot = minimax(options, "O").index;
    }

    let selectedCell = cells[bestSpot];
    makeMove(selectedCell, bestSpot, "O");

    if (checkWinner()) return;

    currentPlayer = "X";
    statusMessage.textContent = `Sıra Sende (X)`;
}

// 1. Kolay Seviye: Rastgele Hamle
function getRandomMove() {
    let emptyCells = [];
    options.forEach((val, index) => {
        if (val === "") emptyCells.push(index);
    });
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// 2. Orta Seviye: Kazanmayı ve Engellemeyi Bilir
function getMediumMove() {
    // Önce bilgisayar kazanabiliyor mu bak
    let winningMove = findBestWinningMove("O");
    if (winningMove !== null) return winningMove;

    // Oyuncu kazanacaksa engelle
    let blockingMove = findBestWinningMove("X");
    if (blockingMove !== null) return blockingMove;

    // Yoksa rastgele
    return getRandomMove();
}

function findBestWinningMove(player) {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        let line = [options[a], options[b], options[c]];
        if (line.filter(val => val === player).length === 2 && line.includes("")) {
            if (options[a] === "") return a;
            if (options[b] === "") return b;
            if (options[c] === "") return c;
        }
    }
    return null;
}

// 3. Çok Zor Seviye: Minimax Algoritması (Yenilmez Yapay Zeka)
function minimax(newBoard, player) {
    let availSpots = newBoard.reduce((acc, val, idx) => val === "" ? acc.concat(idx) : acc, []);

    if (checkWinState(newBoard, "X")) {
        return { score: -10 };
    } else if (checkWinState(newBoard, "O")) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    let moves = [];

    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === "O") {
            let result = minimax(newBoard, "X");
            move.score = result.score;
        } else {
            let result = minimax(newBoard, "O");
            move.score = result.score;
        }

        newBoard[availSpots[i]] = "";
        moves.push(move);
    }

    let bestMove;
    if (player === "O") {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWinState(board, player) {
    return winConditions.some(combination => {
        return combination.every(index => board[index] === player);
    });
}

function checkWinner() {
    let roundWon = false;

    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        const cellA = options[condition[0]];
        const cellB = options[condition[1]];
        const cellC = options[condition[2]];

        if (cellA === "" || cellB === "" || cellC === "") continue;
        if (cellA === cellB && cellB === cellC) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        let winnerName = (currentPlayer === "X") ? "Sen Kazandın!" : "Rakip Kazandı!";
        statusMessage.textContent = winnerName;
        scores[currentPlayer]++;
        updateScoreboard();
        isRunning = false;
        return true;
    } else if (!options.includes("")) {
        statusMessage.textContent = `Berabere!`;
        scores.tie++;
        updateScoreboard();
        isRunning = false;
        return true;
    }
    return false;
}

function updateScoreboard() {
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreTieEl.textContent = scores.tie;
}

function restartGame() {
    currentPlayer = "X";
    options = ["", "", "", "", "", "", "", "", ""];
    statusMessage.textContent = `Sıra Sende (X)`;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('x', 'o');
    });
    isRunning = true;
}

function resetScores() {
    scores.X = 0;
    scores.O = 0;
    scores.tie = 0;
    updateScoreboard();
    restartGame();
}
