import { Player, Field, Figure, GameField, GameFieldResponse } from "./models/GameField.js";
export declare class GameFieldClass {
    gameField: GameField;
    flatGameField: Figure[];
    player: Player;
    status: string;
    constructor(data: GameFieldResponse);
    responseToGameField(response: GameFieldResponse): GameField;
    getStatus(): string;
    pointInBounds(x: number, y: number): boolean;
    getPossibleMoves(element: Figure, filterKing?: boolean): Field[];
    isChecked(player: Player): boolean;
    getPossibleMovesPawn(element: Figure, filterKing?: boolean): Field[];
    getPossibleMovesQueen(element: Figure, filterKing?: boolean): Field[];
    getPossibleMovesRook(element: Figure, filterKing?: boolean): Field[];
    getPossibleMovesKnight(element: Figure, filterKing?: boolean): Field[];
    getPossibleMovesBishop(element: Figure, filterKing?: boolean): Field[];
    getPossibleMovesKing(element: Figure, filterKing?: boolean): Field[];
    getMovesTillBound(element: Figure, stepX: number, stepY: number): Field[];
    getPossibleMovesStraight(element: Figure): Field[];
    getPossibleMovesDiagonal(element: Figure): Field[];
    getKing(): Figure | undefined;
    getEnemiesKing(): Figure | undefined;
    removeEnemiesKingPosition(possibleMoves: Field[]): Field[];
    straightWayFree(fromX: number, fromY: number, toX: number, toY: number): boolean;
    diagonalWayFree(fromX: number, fromY: number, toX: number, toY: number): boolean;
}
