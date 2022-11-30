import {RequestMessage, RequestMessageTypes} from "./RequestMessage";

export class NewGameReq implements RequestMessage<null>{
    data: null;
    type: RequestMessageTypes;

    constructor() {
        this.type = 'NewGame';
        this.data = null;
    }
}