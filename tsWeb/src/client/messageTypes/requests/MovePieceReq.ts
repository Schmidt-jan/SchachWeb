import {RequestMessage, RequestMessageTypes} from "./RequestMessage";
import {WebChessApi} from "../../webChessApi";
import MovePiece = WebChessApi.MovePiece;

export class MovePieceMessage implements RequestMessage<MovePiece>{
    data: MovePiece;
    type: RequestMessageTypes;

    constructor(move: MovePiece) {
        this.type = 'MovePiece';
        this.data = move;
    }
}