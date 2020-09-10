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
    }
}

/**Event types*/
export enum EventType {
    SELECTION = "eventTypeSelection",
    SCALE = "eventTypeScale",
    ADD_TRACK_DATA = "eventTypeAddData",
    UPDATE_TRACK_DATA = "eventTypeUpdateData",
    RESET = "eventTypeReset",
    TRACK_VISIBILITY = "eventTypeVisibility",
    ADD_TRACK = "addTrack",
    TRACK_HIDE = "eventTypeHide",
    UPDATE_BOARD_CONFIG = "updateBoardConfig",
    DOMAIN_VIEW = "domainView"
}

/**Event Data Interface used to update row configuration*/
export interface TrackConfigInterface {
    trackConfig:RcsbFvRowConfigInterface;
    trackId:string;
}

/**Event Data Interface used to change visibility for a particular track*/
export interface TrackVisibilityInterface {
    trackId: string;
    visibility: boolean;
}

/**Event Data Interface used to reset a board row*/
export interface TrackDataInterface {
    trackData:RcsbFvTrackData;
    trackId:string;
    displayId?:string;
}

/**Event Data Interface used to change the board view range*/
export interface DomainViewInterface {
    domain: [number,number];
}

/**Main Event Data Object Interface*/
export interface RcsbFvContextManagerInterface {
    eventType: string;
    eventData: string|TrackVisibilityInterface|TrackDataInterface|RcsbFvRowConfigInterface|RcsbFvBoardFullConfigInterface|TrackConfigInterface|DomainViewInterface;
}

