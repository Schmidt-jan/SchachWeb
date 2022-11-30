export type RequestMessageTypes = "NewGame" | "MovePiece" | "ConvertPawn" | "KeepAlive"

export interface RequestMessage<T> {
    type: RequestMessageTypes,
    data: T
}