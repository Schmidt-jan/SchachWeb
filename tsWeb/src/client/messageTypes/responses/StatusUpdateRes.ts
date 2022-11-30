import {ResponseMessage, ResponseMessageTypes} from "./ResponseMessage";

export type StatusTypes = "RUNNING" | "CHECKED" | "CHECKMATE" | "INVALID CONVERSION" | "PAWN HAS REACHED THE END" | "INVALID MOVE"

export interface StatusUpdate {
    "currentPlayer": string,
    "status": StatusTypes,
}

export interface StatusUpdateRes extends ResponseMessage<StatusUpdate> {
    type: "StatusUpdate"
}