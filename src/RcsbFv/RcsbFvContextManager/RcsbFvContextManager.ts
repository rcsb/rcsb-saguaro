import { Subject } from 'rxjs';
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../RcsbFvDataManager/RcsbFvDataManager";
import {ZoomTransform} from "d3-zoom";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";

export class RcsbFvContextManagerClass {
    private subject: any = new Subject();
    public next( obj: RcsbFvContextManagerInterface ):void {
        this.subject.next(obj);
    }
    public asObservable():any {
        return this.subject.asObservable();
    }
    public unsubscribeAll():void {
        this.subject.unsubscribe();
    }
}

const subject = new Subject();
const RcsbFvContextManager = {
    next: (obj: RcsbFvContextManagerInterface) => subject.next(obj),
    asObservable: () => subject.asObservable(),
    unsubscribeAll: () => subject.unsubscribe()
};

//const RcsbFvContextManager = new RcsbFvContextManagerClass();

export enum EventType {
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
    loadData:RcsbFvTrackData;
    trackId:string;
}

export interface SelectionInterface {
    rcsbFvTrackDataElement: RcsbFvTrackDataElementInterface;
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

//export {RcsbFvContextManager};

