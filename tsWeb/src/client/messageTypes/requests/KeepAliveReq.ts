import {RequestMessage, RequestMessageTypes} from "./RequestMessage";

export class KeepAliveReq implements RequestMessage<null>{
    data: null;
    type: RequestMessageTypes;

    constructor() {
        this.type = 'KeepAlive';
        this.data = null;
    }
}