import { Subject } from 'rxjs';
import {RcsbFvTrackData} from "../RcsbFvDataManager/RcsbFvDataManager";
import {ZoomTransform} from "d3-zoom";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";

const subject = new Subject();
const RcsbFvContextManager = {
    next: (obj: RcsbFvContextManagerInterface) => subject.next(obj),
    asObservable: () => subject.asObservable(),
    unsubscribeAll: () => subject.unsubscribe()
};

export enum EVENT_TYPE {
    SELECTION = "eventTypeSelection",
    SCALE = "eventTypeScale",
    ADD_DATA = "eventTypeAddData",
    UPDATE_DATA = "eventTypeUpdateData",
    RESET = "eventTypeReset",
    ADD_TRACK = "addTrack",
}

export interface TrackInterface {
    trackConfig:RcsbFvRowConfigInterface;
    trackId:string;
}

export interface ResetInterface {
    trackId:string;
}

export interface DataInterface {
    loadData:RcsbFvTrackData|string;
    trackId:string;
}

export interface SelectionInterface {
    begin: number;
    end: number;
    domId: string;
}

export interface ScaleTransformInterface {
    transform:ZoomTransform;
    domId: string;
}

export interface RcsbFvContextManagerInterface{
    eventType: string;
    eventData: SelectionInterface|ScaleTransformInterface|DataInterface|ResetInterface|RcsbFvRowConfigInterface;
}

export {RcsbFvContextManager};

