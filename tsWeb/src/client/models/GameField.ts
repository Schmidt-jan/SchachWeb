export enum FigureTypes {
    Pawn = "Pawn",
    Rook = "Rook",
    Knight = "Knight",
    Bishop = "Bishop",
    Queen = "Queen",
    King = "King"
}

export enum Player {
    White = "WHITE",
    Black = "BLACK"
}

export interface Figure {
    figure: FigureTypes,
    color: Player,
    x: number,
    y: number
}

export interface GameFieldResponse {
    currentPlayer: string,
    status: string,
    gameField: Figure[]
}

export type GameField = Array<Array<Figure | null>>

export type Field = [x: number, y: number]