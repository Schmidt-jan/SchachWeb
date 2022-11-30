import {FigureTypes, GameFieldResponse} from "./models/GameField";
import {ChessGameField} from "./move_calculator";
import {NewGameReq} from "./messageTypes/requests/NewGameReq";
import {ConvertPawnReq} from "./messageTypes/requests/ConvertPawnReq";
import {MovePieceMessage} from "./messageTypes/requests/MovePieceReq";

export namespace WebChessApiWs {
    export interface MovePiece {
        fromX: number
        toX: number
        fromY: number
        toY: number
    }

    export interface ConvertPawn {
        toFigure: string
    }

    export function createNewGame(ws: WebSocket) {
        console.log("create new game")
        ws.send(JSON.stringify(new NewGameReq()));
    }

    export function movePiece(ws: WebSocket, move: MovePiece) {
        ws.send(JSON.stringify(new MovePieceMessage(move)));
    }

    export function convertPawn(ws: WebSocket, toFigure: string) {
        ws.send(JSON.stringify(new ConvertPawnReq(toFigure)))
    }
}