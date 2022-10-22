export declare enum FigureTypes {
    Pawn = "Pawn",
    Rook = "Rook",
    Knight = "Knight",
    Bishop = "Bishop",
    Queen = "Queen",
    King = "King"
}
export declare enum Player {
    White = "WHITE",
    Black = "BLACK"
}
export interface Figure {
    figure: FigureTypes;
    color: Player;
    x: number;
    y: number;
}
export interface GameFieldResponse {
    currentPlayer: string;
    status: string;
    gameField: Figure[];
}
export declare type GameField = Array<Array<Figure | null>>;
export declare type Field = [x: number, y: number];
