export type ResponseMessageTypes = "StatusUpdate" | "GameField"

export interface ResponseMessage<T> {
    type: ResponseMessageTypes
    data: T
}