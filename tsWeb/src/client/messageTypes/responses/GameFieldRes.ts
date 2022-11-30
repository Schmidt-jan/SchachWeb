import {ResponseMessage} from "./ResponseMessage";
import {GameFieldResponse} from "../../models/GameField";

export interface GameFieldRes extends ResponseMessage<GameFieldResponse>{
    type: 'GameField'
}