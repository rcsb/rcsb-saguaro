import { Subject } from 'rxjs';
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../RcsbFvDataManager/RcsbFvDataManager";
import {ZoomTransform} from "d3-zoom";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import {RcsbFvBoardFullConfigInterface} from "../RcsbFvBoard/RcsbFvBoard";

export class RcsbFvContextManager {
    private subject: any = new Subject();
    public next( obj: RcsbFvContextManagerInterface ):void {
        this.subject.next(obj);
    }
    public asObservable():any {
        return this.subject.asObservable();
    }
    public unsubscribeAll():void {
        this.subject.unsubscribe();
        console.warn("unsubscribing all events completed");
    }
}

export enum EventType {
    SELECTION = "eventTypeSelection",
    SCALE = "eventTypeScale",
    ADD_DATA = "eventTypeAddData",
    UPDATE_TRACK_DATA = "eventTypeUpdateData",
    RESET = "eventTypeReset",
    ADD_TRACK = "addTrack",
    UPDATE_BOARD_CONFIG = "updateBoardConfig"
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
    eventData: SelectionInterface|ScaleTransformInterface|DataInterface|ResetInterface|RcsbFvRowConfigInterface|RcsbFvBoardFullConfigInterface;
}

