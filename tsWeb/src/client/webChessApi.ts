import {FigureTypes, GameFieldResponse} from "./models/GameField";
import {ChessGameField} from "./move_calculator";

export namespace WebChessApi {
    export interface MovePiece {
        fromX: number
        toX: number
        fromY: number
        toY: number
    }

    export interface ConvertPawn {
        toFigure: string
    }

    export async function createNewGame(): Promise<ChessGameField> {
        const response = await fetch('/api/new', {
            method: 'POST',
        });
        return getDataOrThrow(response);
    }

    export async function getGameStatus(): Promise<ChessGameField> {
        const response = await fetch('/api/status', {
            method: 'GET',
        });
        return getDataOrThrow(response);
    }

    export async function movePiece(req: MovePiece): Promise<ChessGameField> {
        const response = await fetch('/api/move', {
            method: 'POST',
            body: JSON.stringify(req)
        })
        return getDataOrThrow(response);
    }

    export async function undoMove(): Promise<ChessGameField> {
        const response = await fetch('/api/undo', {
            method: 'POST'
        });
        return getDataOrThrow(response);
    }

    export async function convertPawn(toFigure: ConvertPawn) {
        const response = await fetch('/api/convertPawn', {
            method: 'POST',
            body: JSON.stringify(toFigure)
        });
        return getDataOrThrow(response);
    }

    async function getDataOrThrow(response: Response): Promise<ChessGameField> {
        if (response.ok) {
            const data = await response.json();
            return new ChessGameField(data as GameFieldResponse);
        }

        throw new Error('Response is invalid');
    }
}