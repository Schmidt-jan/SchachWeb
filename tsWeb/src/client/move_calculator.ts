import {Field, Figure, FigureTypes, GameField, GameFieldResponse, Player} from "./models/GameField";
import {Color} from "three";

export class ChessGameField {
    gameField: GameField = new Array<Array<Figure | null>>();
    flatGameField: Figure[];
    player: Player
    status: string

    constructor(data: GameFieldResponse) {
        this.gameField = this.responseToGameField(data);
        this.flatGameField = data.gameField;
        this.player = data.currentPlayer as Player;
        this.status = data.status
    }

    responseToGameField(response: GameFieldResponse): GameField {
        for (let i = 0; i < 8; i++) {
            let row = [null, null, null, null, null, null, null, null]
            this.gameField.push(row);
        }

        for (let player of response.gameField) {
            this.gameField[player.x][player.y] = player;
        }

        return this.gameField;
    }

    public getStatus(): string {
        return this.status;
    }

    public pointInBounds(x: number, y: number) {
        let xInBounds = false
        if (x >= 0 && x < 8)
            xInBounds = true

        let yInBounds = false
        if (y >= 0 && y < 8)
            yInBounds = true

        return xInBounds && yInBounds
    }

    public getPossibleMoves(element: Figure, filterKing?: boolean) {
        switch (element.figure) {
            case FigureTypes.Pawn:
                return this.getPossibleMovesPawn(element, filterKing)
            case FigureTypes.Queen:
                return this.getPossibleMovesQueen(element, filterKing)
            case FigureTypes.Rook:
                return this.getPossibleMovesRook(element, filterKing)
            case FigureTypes.Knight:
                return this.getPossibleMovesKnight(element, filterKing)
            case FigureTypes.Bishop:
                return this.getPossibleMovesBishop(element, filterKing)
            case FigureTypes.King:
                return this.getPossibleMovesKing(element, filterKing)
        }
    }

    public isChecked(player: Player): boolean {
        let king = player === this.player ? this.getKing(this.player) : this.getEnemiesKing(this.player);
        if (!king) {
            return true;
        }

        let enemies: Figure[] = this.flatGameField.filter(field => {
            if (player === this.player) {
                return field.color !== this.player
            }
            return field.color !== this.player
        });

        for (let enemy of enemies) {
            let possibleMoves = this.getPossibleMoves(enemy, false);
            for (const [x, y] of possibleMoves) {
                if (x == king.x && y == king.y) {
                    return true;
                }
            }
        }

        return false;
    }

    getPossibleMovesPawn(element: Figure, filterKing?: boolean): Field[] {
        let firstStep = (element.color === Player.White && element.y === 1) ||
            (element.color === Player.Black && element.y === 6);
        let stepY = element.color === Player.White ? 1 : -1

        let possibleMoves: Field[] = [];
        let [x, y] = [element.x, element.y + stepY]
        if (this.pointInBounds(x, y) && (this.gameField[x][y] === null)) {
            possibleMoves.push([x, y])
        }

        [x, y] = [element.x, element.y + 2 * stepY];
        if (firstStep && this.pointInBounds(x, y) && (this.gameField[x][y] === null)) {
            possibleMoves.push([x, y]);
        }

        [x, y] = [element.x + 1, element.y + stepY];
        if (this.pointInBounds(x, y)) {
            let otherFigure = this.gameField[x][y];
            if (otherFigure && otherFigure.color !== element.color) {
                possibleMoves.push([x, y]);
            }
        }

        [x, y] = [element.x - 1, element.y + stepY];
        if (this.pointInBounds(x, y)) {
            let otherFigure = this.gameField[x][y];
            if (otherFigure && otherFigure.color !== element.color) {
                possibleMoves.push([x, y]);
            }
        }

        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves, element.color);
        }

        return possibleMoves;
    }

    getPossibleMovesQueen(element: Figure, filterKing?: boolean): Field[] {
        let movesDiagonal = this.getPossibleMovesDiagonal(element);
        let movesStraight = this.getPossibleMovesStraight(element);
        let possibleMoves = [...movesDiagonal, ...movesStraight];

        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves, element.color);
        }

        return possibleMoves
    }

    getPossibleMovesRook(element: Figure, filterKing?: boolean): Field[] {
        let possibleMoves = this.getPossibleMovesStraight(element);

        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves, element.color);
        }

        return possibleMoves
    }

    getPossibleMovesKnight(element: Figure, filterKing?: boolean): Field[] {
        let possibleMoves: Field[] = [[1, 2], [-1, 2], [1, -2], [-1, -2],
            [2, 1], [2, -1], [-2, 1], [-2, -1]];
        for (let move of possibleMoves) {
            move[0] += element.x;
            move[1] += element.y;
        }
        possibleMoves = possibleMoves.filter(([x, y]) => this.pointInBounds(x, y));
        possibleMoves = possibleMoves.filter(([x, y]) => {
            let field = this.gameField[x][y];
            if (field === null) {
                return true;
            }
            return field.color !== element.color && field.figure;
        })

        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves, element.color);
        }

        return possibleMoves;
    }

    getPossibleMovesBishop(element: Figure, filterKing?: boolean): Field[] {
        let possibleMoves = this.getPossibleMovesDiagonal(element);

        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves, element.color);
        }

        return possibleMoves
    }

    getPossibleMovesKing(element: Figure, filterKing?: boolean): Field[] {
        let fieldsAround = [
            [element.x, element.y + 1],
            [element.x + 1, element.y + 1],
            [element.x + 1, element.y],
            [element.x + 1, element.y - 1],
            [element.x, element.y - 1],
            [element.x - 1, element.y - 1],
            [element.x - 1, element.y],
            [element.x - 1, element.y + 1],
        ]

        fieldsAround = fieldsAround.filter(point => this.pointInBounds(point[0], point[1]));
        let possibleMoves: Field[] = []
        for (let [x, y] of fieldsAround) {
            let otherFigure = this.gameField[x][y];
            if (!otherFigure) {
                possibleMoves.push([x, y]);
            }
            if (otherFigure && otherFigure.color !== element.color) {
                possibleMoves.push([x, y])
            }
        }

        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves, element.color);
        }

        return possibleMoves
    }

    getMovesTillBound(element: Figure, stepX: number, stepY: number): Field[] {
        let possibleMoves: Field[] = []
        let boundX = stepX === -1 ? 0 : 8
        let boundY = stepY === -1 ? 0 : 8

        let curX = element.x + stepX;
        let curY = element.y + stepY;

        while (this.pointInBounds(curX, curY)) {
            let field = this.gameField[curX][curY];

            if (field) {
                if (field.color === element.color) {
                    break;
                } else {
                    possibleMoves.push([curX, curY]);
                    break;
                }
            } else {
                possibleMoves.push([curX, curY])
            }

            curX += stepX;
            curY += stepY;
        }

        return possibleMoves
    }

    getPossibleMovesStraight(element: Figure): Field[] {
        let movesUp = this.getMovesTillBound(element, 0, 1);
        let movesDown = this.getMovesTillBound(element, 0, -1);
        let movesRight = this.getMovesTillBound(element, 1, 0);
        let movesLeft = this.getMovesTillBound(element, -1, 0);

        return [...movesUp, ...movesDown, ...movesRight, ...movesLeft]
    }

    getPossibleMovesDiagonal(element: Figure): Field[] {
        let movesUpRight = this.getMovesTillBound(element, 1, 1);
        let movesDownRight = this.getMovesTillBound(element, 1, -1);
        let movesDownLeft = this.getMovesTillBound(element, -1, -1);
        let movesUpLeft = this.getMovesTillBound(element, -1, 1);

        return [...movesUpRight, ...movesDownRight, ...movesDownLeft, ...movesUpLeft]
    }

    getKing(player: Player): Figure | undefined {
        return this.flatGameField.find(field => (field.figure === FigureTypes.King && field.color === player));
    }

    getEnemiesKing(player: Player): Figure | undefined {
        return this.flatGameField.find(field => (field.figure === FigureTypes.King && field.color !== player));
    }

    removeEnemiesKingPosition(possibleMoves: Field[], player: Player): Field[] {
        let king = this.getEnemiesKing(player);
        possibleMoves = possibleMoves.filter(([x, y]) => x !== king?.x || y !== king.y)
        return possibleMoves
    }

    straightWayFree(fromX: number, fromY: number, toX: number, toY: number): boolean {
        if (fromX === toX && fromY === toY)
            return true

        if (fromX !== toX && fromY !== toY)
            return false

        let stepX = 0
        let stepY = 0

        if (fromX === toX) {
            stepY = toY < fromY ? -1 : 1;
        } else {
            stepX = toX < fromX ? -1 : 1;
        }

        let curX = fromX + stepX
        let curY = fromY + stepY
        while (curX !== toX + stepX || curY !== toY + stepY) {
            if (this.gameField[curX][curY] !== null) {
                return false;
            }

            curX += stepX;
            curY += stepY;
        }

        return true;
    }

    diagonalWayFree(fromX: number, fromY: number, toX: number, toY: number): boolean {
        if (fromX === toX && fromY === toY)
            return true

        const deltaX = toX - fromX;
        const deltaY = toY - fromY;
        if (Math.abs(deltaX) !== Math.abs(deltaY))
            return false;

        let stepX = toX < fromX ? -1 : 1;
        let stepY = toY < fromY ? -1 : 1;

        let curX = fromX + stepX;
        let curY = fromY + stepY;
        while (curY !== toY + stepY) {
            if (this.gameField[curX][curY] !== null) {
                return false;
            }

            curX += stepX
            curY += stepY
        }

        return true
    }
}
