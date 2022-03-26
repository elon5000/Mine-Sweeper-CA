'use strict'

// -------------------------------CONSTANTS--------------------------------------
const leftWall = 0;   
const topCeil = 0;   
const EMPTY = '';
const MINE = '💣';
const FLAG = '🚩';
const LIVES = '❤️';
const DEFAULTSMILEY = '🙂';
const WIN = '🤩';
const LOSE = '💀';
const easy = 'Easy'
const advanced = 'Advanced';
const expert = 'Expert';

// -----------------------------Global Variables-----------------------------------
var gBoard;
var gTime = 0;
var gTimeIntervalId;
var gSmiley = DEFAULTSMILEY;
var gNightModeToggle = 'off';
var gDifficultyLvl = easy;
var gLvlDifficulty = initDifficultyProps(gDifficultyLvl);
var gGame = initGameProps();


// -----------------------------Utilty Global Functions--------------------------

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function startTimer() {
    var elTimer = document.querySelector('.timer-display');
    var offset = Date.now()

    gTimeIntervalId = setInterval(function () {
        elTimer.innerText = 'TIMER: ' + Math.floor(((Date.now() - offset) / 1000).toFixed(3))
    }, 1000)
}

function stopTimer() {
    clearInterval(gTimeIntervalId);
}

function initGameProps() {
    return {
        isOn: false,
        isStarted: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        mineAmount: 0
    };
}
// -----------------------------Game's Functions-------------------------------------------------

function initDifficultyProps(difficulty) {
    if (difficulty === easy) {
        return {
            life: 3,
            boardSize: 4,
            mineAmount: 4,
        };
    } else if (difficulty === advanced) {
        return {
            life: 2,
            boardSize: 6,
            mineAmount: 10,
        }
    } else if (difficulty === expert) {
        return {
            life: 1,
            boardSize: 8,
            mineAmount: 16,
        }
    }
}


function renderCounters() {
    document.querySelector('.smiley-display').innerHTML = gSmiley;
    document.querySelector('.lives-display').innerHTML = LIVES + gLvlDifficulty.life;
    document.querySelector('.flag-count-display').innerHTML = FLAG + gGame.markedCount;

}

function createMat(ROWS, COLS) {
    ROWS = gLvlDifficulty.boardSize
    COLS = ROWS;
    var newMat = []
    for (var i = 0; i < ROWS; i++) {
        var row = [];
        for (var j = 0; j < COLS; j++) {
            var newCell = {
                cellName: 'empty',
                isShown: false,
                isMine: false,
                isMarked: false,
                minesAroundCount: 0
            };
            row.push(newCell);
        }
        newMat.push(row);
    }
    gBoard = newMat;
}

function setMines() {
    // var boardLength = gLvlDifficulty.boardSize - 1;
    var minesAmount = gLvlDifficulty.mineAmount;
    for (var mineCount = 0; mineCount < minesAmount; mineCount++) {
        var i = getRandomIntInclusive(0, gLvlDifficulty.boardSize - 1);
        var j = getRandomIntInclusive(0, gLvlDifficulty.boardSize - 1);
        if (gBoard[i][j].cellName !== MINE) {
            gBoard[i][j].cellName = MINE;
            gBoard[i][j].isMine = true;
            gBoard[i][j] = gBoard[i][j];
        } else {
            --mineCount;
        }
    }
}


function checkNumbersOfMinesAround() {
    var rightWall = gLvlDifficulty.boardSize - 1
    var bottomWall = gLvlDifficulty.boardSize - 1
    var cell, mineCounter
    // debugger
    for (var i = 0; i < gLvlDifficulty.boardSize; i++) {
        for (var j = 0; j < gLvlDifficulty.boardSize; j++) {
            mineCounter = 0
            cell = gBoard[i][j]
            // right
            if (j + 1 <= rightWall && gBoard[i][j + 1].cellName === MINE) {
                ++mineCounter;
            }
            // left
            if (0 <= j - 1 && gBoard[i][j - 1].cellName === MINE) {
                ++mineCounter;
            }
            // top
            if (0 <= i - 1 && gBoard[i - 1][j].cellName === MINE) {
                ++mineCounter;
            }
            // bottom
            if (i + 1 <= bottomWall && gBoard[i + 1][j].cellName === MINE) {
                ++mineCounter;
            }
            // cross right bottom
            if (j + 1 <= rightWall && i + 1 < bottomWall && gBoard[i + 1][j + 1].cellName === MINE) {
                ++mineCounter;
            }
            // crros left bottom
            if (0 <= j - 1 && i < bottomWall && gBoard[i + 1][j - 1].cellName === MINE) {
                ++mineCounter
            }
            // cross top right
            if (0 <= i - 1 && j + 1 <= rightWall && gBoard[i - 1][j + 1].cellName === MINE) {
                ++mineCounter;
            }
            // cross top left
            if (0 <= j - 1 && 0 <= i - 1 && gBoard[i - 1][j - 1].cellName === MINE) {
                ++mineCounter;
            }
            cell.minesAroundCount = mineCounter;
            // naming empty cells as numbers
            if (cell.cellName !== MINE) {
                cell.cellName = mineCounter;
            }
        }
    }
}

function isInBoard(i, j) {
    return (i >= 0 && i < gBoard.length) && (j >= 0 && j < gBoard.length);
}
function showOnZero(i, j) {
    if (isInBoard(i, j)) {
        if (gBoard[i][j].cellName === 0 && !gBoard[i][j].isShown) {
            gBoard[i][j].isShown = true;

            // upper left neighbour
            showOnZero(i - 1, j - 1);
            // upper center neighbour
            showOnZero(i, j - 1);
            // upper right neighbour
            showOnZero(i + 1, j - 1);

            // left neighbour
            showOnZero(i - 1, j);
            // right neighbour
            showOnZero(i + 1, j);

            // lower left neighbour
            showOnZero(i - 1, j + 1);
            // lower center neighbour
            showOnZero(i, j + 1);
            // lower right neighbour
            showOnZero(i + 1, j + 1);
        } else {
            gBoard[i][j].isShown = true;
        }
    }
    // renderBoard();
}

function onRightClick(event, i, j) {
    event.preventDefault();

    if (gGame.isOn) {
        if (!gBoard[i][j].isShown) {
            gGame.markedCount += gBoard[i][j].isMarked ? -1 : 1;
            gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
            renderBoard();
            renderCounters();
        }
    }
}

function onLeftClick(i, j) {
    if (!gGame.isOn && !gGame.isStarted) {
        onFirstClick(i, j);
    }

    if (gGame.isOn) {
        showOnZero(i, j);
        gBoard[i][j].isShown = true;

        if (gBoard[i][j].isMine) {
            gLvlDifficulty.life -= 1;
        }

        renderBoard();
        renderCounters();
    }
}

function getCellText(cell) {
    if (cell.isShown) {
        return cell.cellName;
    } else if (cell.isMarked) {
        return FLAG;
    }
    return EMPTY;
}

function renderBoard() {

    var strHTML = '<table><tbody class="table-top">';

    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gBoard[0].length; j++) {
            var className = 'cell-' + i + '-' + j;
            var currCell = gBoard[i][j];
            if (currCell.isShown) {
                className += ' shown';
                if (currCell.cellName === MINE) {
                    className += ' mine';
                }
            } else {
                className += ' unshown';
            }

            strHTML += '<td \
                    class="' + className + ' cell" \
                    onclick="onLeftClick(' + i + ', ' + j + ')" \
                    oncontextmenu="onRightClick(event, ' + i + ', ' + j + ');" \
                    > ' + getCellText(gBoard[i][j]) + '</td>';
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';

    var elBoard = document.getElementsByClassName('board-container')[0];
    elBoard.innerHTML = strHTML;

    if (checkVictory()) {
        onVictory();
    } else if (checkLose()) {
        onLose();
    }
}

function checkVictory() {
    var victory = true;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.cellName === MINE) {
                if (!currCell.isMarked) {
                    victory = false;
                }
            }
            if (currCell.cellName !== MINE) {
                if (!currCell.isShown) {
                    victory = false;
                }
            }
        }
    }
    return victory;
}

function checkLose() {
    return gLvlDifficulty.life === 0;
}

function onVictory() {
    gGame.isOn = false;
    stopTimer();
    gSmiley = WIN;
}

function onLose() {
    gGame.isOn = false;
    stopTimer();
    gSmiley = LOSE;
}


function toggleDifficulty() {
    // debugger

    if (gDifficultyLvl === easy) {
        gDifficultyLvl = advanced
        gLvlDifficulty.life = 2
        gLvlDifficulty.hints = 1
        gLvlDifficulty.boardSize = [6]
        gLvlDifficulty.mineAmount = [10]
    } else if (gDifficultyLvl === advanced) {
        gDifficultyLvl = expert;
        gLvlDifficulty.life = 1
        gLvlDifficulty.hints = 0
        gLvlDifficulty.boardSize = [8]
        gLvlDifficulty.mineAmount = [16]
    } else if (gDifficultyLvl === expert) {
        gDifficultyLvl = easy;
        gLvlDifficulty.life = 3
        gLvlDifficulty.hints = 3
        gLvlDifficulty.boardSize = [4]
        gLvlDifficulty.mineAmount = [4]

    }
    document.querySelector('.toggle-difficulty').innerHTML = gDifficultyLvl;
    resetGame();
}


function resetGame() {
    stopTimer();
    document.querySelector('.timer-display').innerText = 'TIMER: 0';

    gGame = initGameProps();
    gLvlDifficulty =  initDifficultyProps(gDifficultyLvl);
    gSmiley = DEFAULTSMILEY;

    init();
}

function toggleNightmode() {
    if (gNightModeToggle === 'off') {
        gNightModeToggle = 'on'
        document.querySelector('body').className = 'night-mode';
    } else {
        gNightModeToggle = 'off'
        document.querySelector('body').className = 'day-mode';
    }
    document.querySelector('.toggle-nightmode').innerHTML = 'NightMode: ' + gNightModeToggle;
}

function highlightCell() {
    for (var i = 0; i < gLvlDifficulty.boardSize; i++) {
        for (j = 0; j < gBoard[0]; j++) { }
    }
}

function onFirstClick(i, j) {
    gGame.isOn = true;
    gGame.isStarted = true;

    while (gBoard[i][j].cellName === MINE) {
        init();
    }

    startTimer();
}


function init() {
    createMat();
    setMines();
    checkNumbersOfMinesAround();
    renderBoard();
    renderCounters();
}
