import {Selection, BaseType} from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {RcsbD3Manager} from "../RcsbD3/RcsbD3Manager";
import {
    RcsbFvColorGradient,
    RcsbFvTrackData,
    RcsbFvTrackDataElementInterface,
    RcsbFvTrackDataMap
} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbFvContextManager} from "../../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";
import {RcsbScaleInterface} from "../RcsbD3/RcsbD3ScaleFactory";
import {Subject} from "rxjs";

export interface RcsbTrackInterface {
    height: (h?: number) => number;
    trackColor: (c?: string) => string;
    init: (scale:RcsbScaleInterface, compositeFlag?: boolean, compositeHeight?: number) => void;
    data: (d: RcsbFvTrackData | RcsbFvTrackDataMap) => RcsbFvTrackData | RcsbFvTrackDataMap;
    setUpdateDataOnMove:( f:(d:LocationViewInterface)=>Promise<RcsbFvTrackData> )=> void;
    setBoardHighlight: (f:(d:RcsbFvTrackDataElementInterface, operation:'set'|'add', mode:'select'|'hover', propFlag?: boolean) => void) => void;
    setManagers: (d3Manager: RcsbD3Manager, contextManager: RcsbFvContextManager) => void;
    highlightRegion: (d:Array<RcsbFvTrackDataElementInterface> | null, options?:{color?:string, rectClass?: string;}) => void;
    moveSelection: (mode:'select'|'hover')=> void;
    readonly mouseoutSubject: Subject<{event: MouseEvent;}>;
    readonly mouseoverSubject: Subject<{event: MouseEvent;}>;
    readonly mousemoveSubject:Subject<{position: number; event: MouseEvent;}>;
}

export interface RcsbDisplayInterface extends RcsbTrackInterface {
    reset: ()=> void;
    plot:(element:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>)=>void;
    update: (compKey?: string) => void;
    displayEmpty: () => void;
    move: ()=> void;
    setMinRatio: (ratio: number) => void;
    setSelectDataInRange: (flag: boolean) => void;
    setHideEmptyTrack: (flag: boolean) => void;
    setDisplayColor: (color: string  | RcsbFvColorGradient)=>void;

    readonly elementEnterSubject: Subject<{element:RcsbFvTrackDataElementInterface; event: MouseEvent;}>;
    readonly elementLeaveSubject: Subject<{element:RcsbFvTrackDataElementInterface; event: MouseEvent;}>;
    readonly elementClickSubject: Subject<{element:RcsbFvTrackDataElementInterface; event: MouseEvent;}>;
    readonly highlightEnterSubject: Subject<{element:RcsbFvTrackDataElementInterface; event: MouseEvent;}>;
    readonly highlightLeaveSubject: Subject<{element:RcsbFvTrackDataElementInterface; event: MouseEvent;}>;
}