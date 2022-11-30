import {ChessGameField} from "./move_calculator";
import {ChessBoard} from "./chessBoard";
import {GameFieldResponse, Player} from "./models/GameField";
import {KeepAliveReq} from "./messageTypes/requests/KeepAliveReq";
import {ResponseMessage} from "./messageTypes/responses/ResponseMessage";
import {GameFieldRes} from "./messageTypes/responses/GameFieldRes";
import {StatusUpdate, StatusUpdateRes} from "./messageTypes/responses/StatusUpdateRes";
import {WebChessApiWs} from "./webChessApiWs";

let toggle3d: HTMLElement | null;

let clickAudio = new Audio('assets/audio/Click.wav');
let attackingAudio = new Audio('assets/audio/attacking.wav')
let underAttackAudio = new Audio('assets/audio/underAttack.wav')
let gameWinAudio = new Audio('assets/audio/gameWin.wav');
let gameLoseAudio = new Audio('assets/audio/gameLose.wav');

let toggleAutoRotate : HTMLElement | null;
let toggleHints: HTMLElement | null;
let toggleSound: HTMLElement | null;
let labelPlayer: HTMLElement | null;
let labelState : HTMLElement | null;
let figuresLoaded = false;

let you: Player;
let currPlayer: Player;

const ws = new WebSocket('ws://localhost:9000/ws');

export function selectWhitePlayer() {
    ChessBoard.stopAnimation()
    ChessBoard.setPlayer(Player.White)
}

export function selectBlackPlayer() {
    ChessBoard.stopAnimation()
    ChessBoard.setPlayer(Player.White)
}

function init() {
    initButtons();
    const ok = confirm("Are you the white?");
    you = ok ? Player.White : Player.Black;

    const parent = document.getElementById('3dGame');
    if (!parent) {
        throw new Error('Couldnt find id "3dGame"');
    }
    ChessBoard.init(you, parent, ws, true);
    //ChessBoard.startAnimation();

    ChessBoard.loadFigures().then(() => {
        return ChessBoard.loadFigures();
    }).then(() => {
        figuresLoaded = true;
        //return new ChessGameField(require('./response.json'))
        WebChessApiWs.createNewGame(ws);
    });

    document.getElementById('3dGame')?.addEventListener('click', ChessBoard.onClick);
    window.addEventListener('resize', ChessBoard.onWindowResize)

}

function initButtons() {
    toggle3d = document.getElementById('toggle3d')
    if (toggle3d) {
        toggle3d.addEventListener('click', () => {
            // @ts-ignore
            if (toggle3d.checked) {
                ChessBoard.setView3D();
            } else {
                ChessBoard.setView2D();
            }
        })
    } else {
        console.log('no toggle')
    }
}


window.onload = init;
document.getElementById('view')?.addEventListener('click', ChessBoard.setView3D)
//document.getElementById('playerBlack')?.addEventListener('click', selectBlackPlayer)



ws.onmessage = function (event) {
    let message = JSON.parse(event.data) as ResponseMessage<any>;

    switch (message.type) {
        case "GameField":
            message = message as GameFieldRes
            updateGameField(message.data);
            break;
        case "StatusUpdate":
            message = message as StatusUpdateRes;
            updateStatus(message.data)
            break;
    }

    toggleAutoRotate = document.getElementById('toggleAutoRotate');
    toggleHints = document.getElementById('toggleHints');
    toggleSound = document.getElementById('toggleSound');
    labelPlayer = document.getElementById('labelPlayer');
    labelState = document.getElementById('labelState');

}

setInterval(() => {
    const keepAlive: KeepAliveReq = new KeepAliveReq();
    ws.send(JSON.stringify(keepAlive))
}, 10000)

async function updateGameField(response: GameFieldResponse) {
    if (!figuresLoaded) {
        return
    }
    const chessField = new ChessGameField(response);
    currPlayer = chessField.player;
    if (labelPlayer) {
        labelPlayer.innerHTML = chessField.player.toString();
    }
    if (labelState) {
        labelState.innerHTML = chessField.status
    }

    ChessBoard.updateField(chessField);

    await updateStatus(response as StatusUpdate)
}

async function updateStatus(data: StatusUpdate) {
    switch (data.status) {
        case "RUNNING":
            if (labelPlayer) {
                labelPlayer.innerHTML = (currPlayer === you) ? "It's your turn" : "It's the others turn";
            }
            if (labelState) {
                labelState.innerHTML = data.status
            }
            break;
        case "CHECKMATE":
            if (currPlayer === you) {
                // @ts-ignore
                if (toggleSound?.checked) {
                    await gameLoseAudio.play();
                }
                alert('You lost');
            } else {
                // @ts-ignore
                if (toggleSound?.checked) {
                    await gameWinAudio.play();
                }
                alert('You won');
            }
            break;
        case "PAWN HAS REACHED THE END":
            if (data.currentPlayer === currPlayer) {
                let figure = prompt("Pawn has reached end. You can convert it. Enter the figure you want to change it to. \nFigures: 'rook', 'bishop', 'knight', 'queen'");
                if (figure) {
                    WebChessApiWs.convertPawn(ws, figure);
                }
            }
            break;
        case "CHECKED":
            if (data.currentPlayer === you) {
                // @ts-ignore
                if (toggleSound?.checked) {
                    await underAttackAudio.play();
                }
                alert(`You are under attack`);
            } else {
                // @ts-ignore
                if (toggleSound?.checked) {
                    await attackingAudio.play();
                }
                alert(`You are attacking`);
            }
            break;
        case "INVALID CONVERSION": {
            if (data.currentPlayer === you) {
                let figure = prompt("Pawn has reached end. You can convert it. Enter the figure you want to change it to. \nFigures: 'rook', 'bishop', 'knight', 'queen'");
                if (figure) {
                    WebChessApiWs.convertPawn(ws, figure);
                }
            }
            break;
        }
        case "INVALID MOVE": {
            if (labelPlayer && data.currentPlayer === you) {
                labelPlayer.innerHTML = currPlayer.toString();
            }
            if (labelState && data.currentPlayer === you) {
                labelState.innerHTML = data.status
            }
        }
    }
}