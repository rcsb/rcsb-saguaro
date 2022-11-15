import {Subject, Subscription} from 'rxjs';
import {RcsbFvTrackData} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvBoardFullConfigInterface} from "../RcsbFvBoard/RcsbFvBoard";

/**rxjs Event Handler Object. It allows objects to subscribe methods and then, get(send) events to(from) other objects*/
export class RcsbFvContextManager {
    private readonly conditionalFlag: Map<CONDITIONAL_FLAG,boolean> = new Map<CONDITIONAL_FLAG, boolean>();
    private readonly subject: Subject<RcsbFvContextManagerInterface> = new Subject<RcsbFvContextManagerInterface>();
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
        return this.subject.subscribe(f);
    }
    /**Unsubscribe all methods*/
    public unsubscribeAll():void {
        this.subject.unsubscribe();
    }

    public getCondition(flag: CONDITIONAL_FLAG): boolean{
        return this.conditionalFlag.get(flag) ?? false;
    }

    public setCondition(flag: CONDITIONAL_FLAG, value?: boolean): void{
        this.conditionalFlag.set(flag, value ?? true);
    }
}

export enum CONDITIONAL_FLAG {
    STOP_MOUSE_MOVE_HOVERING_HIGHLIGHT
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
    DOMAIN_VIEW = "domainView",
    BOARD_HOVER = "boardHover",
    ROW_READY = "rowReady",
    BOARD_READY = "boardReady",
    SET_SELECTION = "eventTypeSetSelection",
    ADD_SELECTION = "eventTypeAddSelection",
    ROW_HOVER = "rowHover",
    MOVE_TRACK = "moveTrack"
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

export interface SetSelectionInterface {
    elements: Array<{begin:number; end?:number; isEmpty?:boolean;}>|{begin:number; end?:number; isEmpty?:boolean;}|null;
    mode:'select'|'hover';
}

export interface SelectionInterface {
    trackId: string;
    mode:'select'|'hover';
}

export interface RowReadyInterface {
    rowId:string;
    rowNumber:number;
}

export interface MoveTrackInterface {
    oldIndex:number;
    newIndex:number;
}

/**Main Event Data Object Interface*/
export interface RcsbFvContextManagerInterface {
    eventType: EventType;
    eventResolve?: ()=>void;
    eventData: string|boolean|MoveTrackInterface|RowReadyInterface|SelectionInterface|TrackVisibilityInterface|TrackDataInterface|RcsbFvRowConfigInterface|RcsbFvBoardFullConfigInterface|TrackConfigInterface|DomainViewInterface|SetSelectionInterface|null;
}

