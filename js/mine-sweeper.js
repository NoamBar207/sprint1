

'use strict'

//// g setting
//// הודעת סיום
////62


var gBoard;
var gTotalSeconds = 0;
var gTimerVariable;
var gIsFirstClick = true;////glevel
var gIsHintClicked = false;
var gHintLength = 0;
var gSafeClick = 3;
var gLevel = {
    size: 4,
    MINES: 2,
};

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
};
var cell = {
    minesAroundCount: 4,
    isShown: false,
    isMine: false,
    isMarked: false,
}

const BOMB = '💣'
const FLAG = '⛳'
const noContext = document.getElementById('noContextMenu');

init();////onload

function init() {
    clearInterval(gTimerVariable)
    gTotalSeconds = 0;
    buildBoard();
}

function buildBoard() {
    gBoard = [];
    for (var i = 0; i < gLevel.size; i++) {
        gBoard[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j] = { ...cell };
        }
    }

    // console.table(gBoard);
    renderBoard(gBoard);
}

function addBombsRand(cellToAvoid) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var randI = getRandomIntInclusive(0, gBoard.length - 1);
        var randJ = getRandomIntInclusive(0, gBoard[0].length - 1);
        if (cellToAvoid.indexI === randI && randJ === cellToAvoid.indexj) continue;
        if (gBoard[randI][randJ].isMine) i = i - 1;
        else gBoard[randI][randJ].isMine = true;
    }
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            setMinesNegsCount(gBoard, i, j);
        }
    }
}

function setMinesNegsCount(board, indexI, indexJ) {
    var mineCount = 0;
    for (var i = indexI - 1; i <= indexI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = indexJ - 1; j <= indexJ + 1; j++) {
            if (i === indexI && j === indexJ) continue;
            if (j < 0 || j > board.length - 1) continue
            if (board[i][j].isMine) mineCount++
        }
    }
    board[indexI][indexJ].minesAroundCount = mineCount;
}

function renderBoard(board) {
    document.querySelector('.msg span').innerText = gGame.lives

    var strHTML = '<tr>';
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            strHTML += `<td  class= "cell" onclick="cellClicked( ${i},${j})" oncontextmenu="handleRightClick( ${i},${j})">${revealCell(board, i, j)}</td>`;
        }
        strHTML += '</tr><tr>'
    }
    var elTable = document.querySelector('table');
    elTable.innerHTML = strHTML;
}

function revealCell(board, i, j) {

    if (board[i][j].isMarked) {
        return FLAG
    }
    if (board[i][j].isMine && board[i][j].isShown) {
        return BOMB
    }
    if (board[i][j].isShown === true) {
        return board[i][j].minesAroundCount;
    }
    if (!board[i][j].isShown && !board[i][j].isMarked) return ''
}

////// short the if with משתנה
function cellClicked(indexI, indexJ) {
    if (gBoard[indexI][indexJ.isShown] || !gGame.isOn) return
    // gBoard[indexI][indexJ].isShown = true
    if (gIsFirstClick) {
        gTimerVariable = setInterval(countUpTimer, 1000);
        gIsFirstClick = false;
        addBombsRand({ indexI, indexJ });
        // console.log(gBoard);
    }
    if (gBoard[indexI][indexJ].isMarked) return;
    if (gIsHintClicked) hintGenarete(indexI, indexJ);
    else {
        if (gBoard[indexI][indexJ].isMine) {
            gBoard[indexI][indexJ].isShown = true
            gGame.lives--;
        } else neigLoop(indexI, indexJ);

        // } else if (!gBoard[indexI][indexJ].isMine && gBoard[indexI][indexJ].minesAroundCount === 0) {
        //     for (var i = indexI - 1; i < indexI + 2; i++) {
        //         if (i < 0 || i >= gBoard.length) continue;
        //         for (var j = indexJ - 1; j < indexJ + 2; j++) {
        //             if (j < 0 || j > gBoard[i].length - 1) continue
        //             if (i === indexI && j === indexJ) gBoard[indexI][indexJ].isShown = true;
        //             if (gBoard[indexI][indexJ].isMine === false) gBoard[i][j].isShown = true;//// try nighbor func
        //             // if (gBoard[i][j].minesAroundCount === 0) neigLoop(i,j)
        //         }
        //     }
        // }
        // else gBoard[indexI][indexJ].isShown = true;
    }
    checkGameOver();
    // userLost();
    renderBoard(gBoard)
}


function neigLoop(indexI, indexJ) {
    // gBoard[indexI][indexJ].isShown = true;{
    if (gBoard[indexI][indexJ].minesAroundCount > 0) gBoard[indexI][indexJ].isShown = true;
    else {
        gBoard[indexI][indexJ].isShown = true;
        for (var i = indexI - 1; i < indexI + 2; i++) {
            if (i < 0 || i > gBoard.length - 1) continue;
            for (var j = indexJ - 1; j < indexJ + 2; j++) {
                if (j < 0 || j > gBoard[i].length - 1) continue;
                if (i === indexI && j === indexJ) continue;
                if (gBoard[i][j].minesAroundCount > 0) gBoard[i][j].isShown = true;
                if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isShown) neigLoop(i, j);

            }
        }
    }

}

function handleRightClick(i, j) {
    if (gIsFirstClick) gTimerVariable = setInterval(countUpTimer, 1000);
    gIsFirstClick = false;
    if (gBoard[i][j].isShown) return;
    if (gBoard[i][j].isMarked) gBoard[i][j].isMarked = false;
    else gBoard[i][j].isMarked = true;
    checkGameOver();
    renderBoard(gBoard)
}


function checkGameOver() {
    var countB = 0;//Bombs
    var countF = 0;//Flags
    var countC = 0;// Cells
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
                countB++;
                countF++;
                // console.log("B", countB, " F", countF)
            } else if (gBoard[i][j].isShown && !gBoard[i][j].isMine) countC++;
        }
    }
    winOrLose(countC, countB, countF);
}

function Reset() {
    gGame.isOn = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gTotalSeconds = 0;
    gGame.lives = 3;
    gGame.isOn = true;
    gIsFirstClick = true;
    gSafeClick=3;
    gHintLength=0;
    var elMsg = document.querySelector('.win');
    elMsg.style.display = 'none'
    clearInterval(gTimerVariable)
    var elBtnHint =document.querySelectorAll('.hint')
    for(var i=0;i<elBtnHint.length;i++){
        elBtnHint[i].style.display=''

    }
    document.querySelector(".smily").innerText = '😀';
    init();
}

function pickNum(sizeMat, mines) {
    gLevel.MINES = mines;
    gLevel.size = sizeMat;
    gIsFirstClick = true;
    gGame.lives = 3;
    document.querySelector(".smily").innerText = '😀';
    Reset();
    // init();
}

function countUpTimer() {
    ++gTotalSeconds;
    var hour = Math.floor(gTotalSeconds / 3600);
    var minute = Math.floor((gTotalSeconds - hour * 3600) / 60);
    var seconds = gTotalSeconds - (hour * 3600 + minute * 60);
    document.querySelector(".count-up-timer").innerHTML = hour + ":" + minute + ":" + seconds;
}

function winOrLose(countC, countB, countF) {
    if (gGame.lives === 0) {
        document.querySelector(".smily").innerText = '😭';
        clearInterval(gTimerVariable);
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
            }
        }
        var eMsgW = document.querySelector(".win")
        eMsgW.innerText = "You Lost!";
        eMsgW.style.display = 'block';
        gGame.isOn = false;
        renderBoard(gBoard);
    }
    else if ((gGame.lives > 0 || countB === gLevel.MINES) && (gLevel.size ** 2 - gLevel.MINES) === countC) {
        document.querySelector(".smily").innerText = '😎';
        var elMsg = document.querySelector('.win');
        elMsg.innerText = 'You Won!';
        elMsg.style.display = 'block';
        clearInterval(gTimerVariable);
    }
}
///////////
function getHint(elBtn) {
    gIsHintClicked = true;
    // elBtn=document.querySelectorAll('.hint')
    elBtn.style.display = 'none'
    // gHintLength++;
    // this.style.display = 'none'
}

function hintGenarete(indexI, indexJ) {
    var notShowedBefore = [];
    if (gIsHintClicked) {
        for (var i = indexI - 1; i < indexI + 2; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = indexJ - 1; j < indexJ + 2; j++) {
                if (j < 0 || j > gBoard[i].length - 1) continue
                if (!gBoard[i][j].isShown && gIsHintClicked) notShowedBefore.push({ idxI: i, idxJ: j })
                // console.log(notShowedBefore);
                gBoard[i][j].isShown = true;
            }
        }
        gIsHintClicked = false;
        // console.log(notShowedBefore);
        setTimeout(hintBack, 1000, indexI, indexJ, notShowedBefore);
    }
}


function hintBack(indexI, indexJ, NotShowedBefore) {
    for (var i = indexI - 1; i < indexI + 2; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = indexJ - 1; j < indexJ + 2; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue
            for (var k = 0; k < NotShowedBefore.length; k++) {
                // console.log(i,'  i    ', NotShowedBefore[k].idxI,' ARR ' , '   J   ',j , ' Arr ',NotShowedBefore[k].idxJ)
                if (i === NotShowedBefore[k].idxI && j === NotShowedBefore[k].idxJ) gBoard[i][j].isShown = false;
            }
        }
    }
    renderBoard(gBoard);
}

function prevent(event) {
    event.preventDefault();
}


function safeClickOp() {
    if (gSafeClick > 0) {
        var emptyLocs = [];
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                if (!gBoard[i][j].isShow && !gBoard[i][j].isMarked && !gBoard[i][j].isMine&&gBoard[i][j].minesAroundCount!==0) {
                    emptyLocs.push({ idxI: i, idxJ: j, });
                }
            }
        }
        var indexToWork = getRandomIntInclusive(0, emptyLocs.length - 1);
        var arrPos = emptyLocs[indexToWork]
        // console.log(arrPos);
        gBoard[arrPos.idxI][arrPos.idxJ].isShown = true;
        renderBoard(gBoard);
        setTimeout(function() {
            console.log(gBoard[arrPos.idxI][arrPos.idxJ]);
            gBoard[arrPos.idxI][arrPos.idxJ].isShown = false;
            renderBoard(gBoard);
        }, 3000)
    }
    gSafeClick--;
    var elSafeBtn=document.querySelector('.safe-button span');
    elSafeBtn.innerText=gSafeClick

 }
///////
//////
//////S
//////

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}