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
    readonly trackSubject: {
        mousemove: Subject<{e: MouseEvent, n: number}>;
        mouseenter: Subject<MouseEvent>;
        mouseleave: Subject<MouseEvent>;
    };
}

export interface RcsbDisplayInterface extends RcsbTrackInterface{
    reset: ()=> void;
    plot:(element:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>)=>void;
    update: (compKey?: string) => void;
    displayEmpty: () => void;
    move: ()=> void;
    readonly elementSubject: {
        mouseclick: Subject<{d:RcsbFvTrackDataElementInterface; e:MouseEvent}>
        mouseenter: Subject<{d:RcsbFvTrackDataElementInterface; e:MouseEvent}>
        mouseleave: Subject<{d:RcsbFvTrackDataElementInterface; e:MouseEvent}>
    };
    subscribeElementHighlight: (action: {enter: (d:RcsbFvTrackDataElementInterface)=>void; leave: (d:RcsbFvTrackDataElementInterface)=>void})=>void;
    setMinRatio: (ratio: number) => void;
    setSelectDataInRange: (flag: boolean) => void;
    setHideEmptyTrack: (flag: boolean) => void;
    setDisplayColor: (color: string  | RcsbFvColorGradient)=>void;
}