import {Subject, Subscription} from 'rxjs';
import {RcsbFvTrackData} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvBoardFullConfigInterface} from "../RcsbFvBoard/RcsbFvBoard";

/**rxjs Event Handler Object. It allows objects to subscribe methods and then, get(send) events to(from) other objects*/
export class RcsbFvContextManager {
    private readonly subject: any = new Subject();
    /**Call other subscribed methods
     * @param obj Event Data Structure Interface
     * */
    public next( obj: RcsbFvContextManagerInterface ):void {
        this.subject.next(obj);
    }
    /**Subscribe method
     * @return Subscription
     * */
    public subscribe(f:(x:RcsbFvContextManagerInterface)=>void):Subscription {
        return this.subject.asObservable().subscribe(f);
    }
    /**Unsubscribe all methods*/
    public unsubscribeAll():void {
        this.subject.unsubscribe();
        console.warn("unsubscribing all events completed");
    }
}

/**Event types*/
export enum EventType {
    SELECTION = "eventTypeSelection",
    SCALE = "eventTypeScale",
    ADD_DATA = "eventTypeAddData",
    UPDATE_TRACK_DATA = "eventTypeUpdateData",
    RESET = "eventTypeReset",
    ADD_TRACK = "addTrack",
    UPDATE_BOARD_CONFIG = "updateBoardConfig"
}

/**Event Data Interface used to update row configuration*/
export interface TrackInterface {
    trackConfig:RcsbFvRowConfigInterface;
    trackId:string;
}

/**Event Data Interface used to reset a board row*/
export interface ResetInterface {
    trackId:string;
}

/**Event Data Interface used to reset a board row*/
export interface DataInterface {
    loadData:RcsbFvTrackData;
    trackId:string;
}

/**Main Event Data Object Interface*/
export interface RcsbFvContextManagerInterface{
    eventType: string;
    eventData: string|DataInterface|ResetInterface|RcsbFvRowConfigInterface|RcsbFvBoardFullConfigInterface|TrackInterface;
}

