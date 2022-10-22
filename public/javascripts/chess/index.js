"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessGameField = void 0;
const GameField_js_1 = require("./models/GameField.js");
class ChessGameField {
    constructor(data) {
        this.gameField = this.responseToGameField(data);
        this.flatGameField = data.gameField;
        this.player = data.currentPlayer;
        this.status = data.status;
    }
    responseToGameField(response) {
        for (let i = 0; i < 8; i++) {
            let row = [null, null, null, null, null, null, null, null];
            this.gameField.push(row);
        }
        for (let player of response.gameField) {
            this.gameField[player.x][player.y] = player;
        }
        return this.gameField;
    }
    getStatus() {
        return this.status;
    }
    pointInBounds(x, y) {
        let xInBounds = false;
        if (x > 0 && x < 8)
            xInBounds = true;
        let yInBounds = false;
        if (y > 0 && y < 8)
            yInBounds = true;
        return xInBounds && yInBounds;
    }
    getPossibleMoves(element, filterKing) {
        switch (element.figure) {
            case GameField_js_1.FigureTypes.Pawn:
                return this.getPossibleMovesPawn(element, filterKing);
            case GameField_js_1.FigureTypes.Queen:
                return this.getPossibleMovesQueen(element, filterKing);
            case GameField_js_1.FigureTypes.Rook:
                return this.getPossibleMovesRook(element, filterKing);
            case GameField_js_1.FigureTypes.Knight:
                return this.getPossibleMovesKnight(element, filterKing);
            case GameField_js_1.FigureTypes.Bishop:
                return this.getPossibleMovesBishop(element, filterKing);
            case GameField_js_1.FigureTypes.King:
                return this.getPossibleMovesKing(element, filterKing);
        }
    }
    isChecked(player) {
        let king = player === this.player ? this.getKing() : this.getEnemiesKing();
        if (!king) {
            return true;
        }
        let enemies = this.flatGameField.filter(field => {
            if (player === this.player) {
                return field.color !== this.player;
            }
            return field.color !== this.player;
        });
        for (let enemy of enemies) {
            let possibleMoves = this.getPossibleMoves(enemy, false);
            if (possibleMoves.includes([king.x, king.y])) {
                return true;
            }
        }
        return false;
    }
    getPossibleMovesPawn(element, filterKing) {
        let firstStep = (element.color === GameField_js_1.Player.White && element.y === 1) ||
            (element.color === GameField_js_1.Player.Black && element.y === 6);
        let stepY = element.color === GameField_js_1.Player.White ? 1 : -1;
        let possibleMoves = [];
        if (!(this.gameField[element.x][element.y + stepY])) {
            possibleMoves.push([element.x, element.y + stepY]);
        }
        if (firstStep && !(this.gameField[element.x][element.y + 2 * stepY])) {
            possibleMoves.push([element.x, element.y + 2 * stepY]);
        }
        let frontNeighbourRight = this.gameField[element.x + 1][element.y + stepY];
        if (frontNeighbourRight && frontNeighbourRight.color !== element.color) {
            possibleMoves.push([frontNeighbourRight.x, frontNeighbourRight.y]);
        }
        let frontNeighbourLeft = this.gameField[element.x - 1][element.y + stepY];
        if (frontNeighbourLeft && frontNeighbourLeft.color !== element.color) {
            possibleMoves.push([frontNeighbourLeft.x, frontNeighbourLeft.y]);
        }
        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves);
        }
        return possibleMoves;
    }
    getPossibleMovesQueen(element, filterKing) {
        let movesDiagonal = this.getPossibleMovesDiagonal(element);
        let movesStraight = this.getPossibleMovesStraight(element);
        let possibleMoves = [...movesDiagonal, ...movesStraight];
        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves);
        }
        return possibleMoves;
    }
    getPossibleMovesRook(element, filterKing) {
        let possibleMoves = this.getPossibleMovesStraight(element);
        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves);
        }
        return possibleMoves;
    }
    getPossibleMovesKnight(element, filterKing) {
        let possibleMoves = [[1, 2], [-1, 2], [1, -2], [-1, -2],
            [2, 1], [2, -1], [-2, 1], [-2, -1]];
        for (let [x, y] of possibleMoves) {
            x += element.x;
            y += element.y;
        }
        possibleMoves = possibleMoves.filter(([x, y]) => this.pointInBounds(x, y));
        possibleMoves = possibleMoves.filter(([x, y]) => {
            let field = this.gameField[x][y];
            if (field === null) {
                return true;
            }
            return field.color !== element.color && field.figure;
        });
        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves);
        }
        return possibleMoves;
    }
    getPossibleMovesBishop(element, filterKing) {
        let possibleMoves = this.getPossibleMovesDiagonal(element);
        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves);
        }
        return possibleMoves;
    }
    getPossibleMovesKing(element, filterKing) {
        let fieldsAround = [
            [element.x, element.y + 1],
            [element.x + 1, element.y + 1],
            [element.x + 1, element.y],
            [element.x + 1, element.y - 1],
            [element.x, element.y - 1],
            [element.x - 1, element.y - 1],
            [element.x - 1, element.y],
            [element.x - 1, element.y + 1],
        ];
        fieldsAround = fieldsAround.filter(point => this.pointInBounds(point[0], point[1]));
        let possibleMoves = [];
        for (let [x, y] of fieldsAround) {
            let otherFigure = this.gameField[x][y];
            if (otherFigure && otherFigure.color !== element.color)
                fieldsAround.push([x, y]);
        }
        if (filterKing) {
            return this.removeEnemiesKingPosition(possibleMoves);
        }
        return possibleMoves;
    }
    getMovesTillBound(element, stepX, stepY) {
        let possibleMoves = [];
        let boundX = stepX === -1 ? 0 : 8;
        let boundY = stepY === -1 ? 0 : 8;
        let curX = boundX + stepX;
        let curY = boundY + stepY;
        while (curX !== boundX && curY !== boundY) {
            let field = this.gameField[curX][curY];
            if (field) {
                if (field.color === element.color) {
                    break;
                }
                else {
                    if (field.figure !== "King") {
                        possibleMoves.push([curX, curY]);
                    }
                    break;
                }
            }
            curX += stepX;
            curY += stepY;
        }
        return possibleMoves;
    }
    getPossibleMovesStraight(element) {
        let movesUp = this.getMovesTillBound(element, 0, 1);
        let movesDown = this.getMovesTillBound(element, 0, -1);
        let movesRight = this.getMovesTillBound(element, 1, 0);
        let movesLeft = this.getMovesTillBound(element, -1, 0);
        return [...movesUp, ...movesDown, ...movesRight, ...movesLeft];
    }
    getPossibleMovesDiagonal(element) {
        let movesUpRight = this.getMovesTillBound(element, 1, 1);
        let movesDownRight = this.getMovesTillBound(element, 1, -1);
        let movesDownLeft = this.getMovesTillBound(element, -1, -1);
        let movesUpLeft = this.getMovesTillBound(element, -1, 1);
        return [...movesUpRight, ...movesDownRight, ...movesDownLeft, ...movesUpLeft];
    }
    getKing() {
        return this.flatGameField.find(field => field.figure === GameField_js_1.FigureTypes.King && field.color === this.player);
    }
    getEnemiesKing() {
        return this.flatGameField.find(field => field.figure === GameField_js_1.FigureTypes.King && field.color !== this.player);
    }
    removeEnemiesKingPosition(possibleMoves) {
        let king = this.getEnemiesKing();
        if (king) {
            possibleMoves = possibleMoves.filter(([x, y]) => x !== (king === null || king === void 0 ? void 0 : king.x) && y !== (king === null || king === void 0 ? void 0 : king.y));
        }
        return possibleMoves;
    }
    straightWayFree(fromX, fromY, toX, toY) {
        if (fromX === toX && fromY === toY)
            return true;
        if (fromX !== toX && fromY !== toY)
            return false;
        let stepX = 0;
        let stepY = 0;
        if (fromX === toX) {
            stepY = toY < fromY ? -1 : 1;
        }
        else {
            stepX = toX < fromX ? -1 : 1;
        }
        let curX = fromX + stepX;
        let curY = fromY + stepY;
        while (curX !== toX + stepX || curY !== toY + stepY) {
            if (this.gameField[curX][curY] !== null) {
                return false;
            }
            curX += stepX;
            curY += stepY;
        }
        return true;
    }
    diagonalWayFree(fromX, fromY, toX, toY) {
        if (fromX === toX && fromY === toY)
            return true;
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
            curX += stepX;
            curY += stepY;
        }
        return true;
    }
}
exports.ChessGameField = ChessGameField;
