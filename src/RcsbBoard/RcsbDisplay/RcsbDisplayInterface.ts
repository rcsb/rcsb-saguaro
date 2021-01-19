import {Selection, BaseType} from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {RcsbD3Manager} from "../RcsbD3/RcsbD3Manager";
import {ScaleLinear} from "d3-scale";
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface, RcsbFvTrackDataMap} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbFvContextManager} from "../../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";

export interface RcsbDisplayInterface {
    reset: ()=> void;
    plot?:(element:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>)=>void;
    update: (compKey?: string) => void;
    displayEmpty: () => void;
    move: ()=> void;
    load: (d: RcsbFvTrackData | RcsbFvTrackDataMap) => RcsbFvTrackData | RcsbFvTrackDataMap;
    setManagers: (d3Manager: RcsbD3Manager, contextManager: RcsbFvContextManager) => void;
    height: (h?: number) => number;
    init: (width: number, scale:ScaleLinear<number,number>, compositeFlag?: boolean, compositeHeight?: number) => void;
    highlightRegion: (d:Array<RcsbFvTrackDataElementInterface> | null, options?:{color?:string, rectClass?: string;}) => void;
    moveSelection: (mode:'select'|'hover')=> void;
    setBoardHighlight: (f:(d:RcsbFvTrackDataElementInterface, mode:'select'|'hover', propFlag?: boolean) => void) => void;
    trackColor: (c?: string) => string;
    mouseoutCallBack: ()=>void;
    mouseoverCallBack: ()=>void;
    mousemoveCallBack: (n:number)=>void;
    readonly elementClickCallBack: (d?:RcsbFvTrackDataElementInterface)=>void;
    readonly elementEnterCallBack: (d?:RcsbFvTrackDataElementInterface)=>void;
    setElementClickCallBack: (f:(d?:RcsbFvTrackDataElementInterface)=>void)=>void;
    setElementEnterCallBack: (f:(d?:RcsbFvTrackDataElementInterface)=>void)=>void;
    setUpdateDataOnMove:( f:(d:LocationViewInterface)=>Promise<RcsbFvTrackData> )=> void;
    readonly includeTooltip: boolean;
    setTooltip: (flag: boolean)=>void;
    setMinRatio: (ratio: number) => void;
    setSelectDataInRange: (flag: boolean) => void;
    setHideEmptyTrack: (flag: boolean) => void;
}