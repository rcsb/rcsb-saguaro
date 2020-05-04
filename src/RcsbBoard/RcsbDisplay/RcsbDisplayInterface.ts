import {Selection, BaseType} from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {RcsbD3Manager} from "../RcsbD3/RcsbD3Manager";
import {ScaleLinear} from "d3-scale";
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface, RcsbFvTrackDataMap} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export interface RcsbDisplayInterface {
    reset: ()=> void;
    plot?:(element:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>)=>void;
    update: (where: LocationViewInterface, compKey?: string) => void;
    move: ()=> void;
    load: (d: RcsbFvTrackData | RcsbFvTrackDataMap) => RcsbFvTrackData | RcsbFvTrackDataMap;
    setD3Manager: (d3Manager: RcsbD3Manager) => void;
    height: (h?: number) => number;
    init: (width: number, scale:ScaleLinear<number,number>, compositeFlag?: boolean, compositeHeight?: number) => void;
    highlightRegion: (d:RcsbFvTrackDataElementInterface) => void;
    setBoardHighlight: (f:(d:RcsbFvTrackDataElementInterface, propFlag?: boolean) => void) => void;
    trackColor: (c?: string) => string;
    mouseoutCallBack: ()=>void;
    mouseoverCallBack: ()=>void;
    readonly elementClickCallBack: (d?:RcsbFvTrackDataElementInterface)=>void;
    readonly elementEnterCallBack: (d?:RcsbFvTrackDataElementInterface)=>void;
    setElementClickCallBack: (f:(d?:RcsbFvTrackDataElementInterface)=>void)=>void;
    setElementEnterCallBack: (f:(d?:RcsbFvTrackDataElementInterface)=>void)=>void;
    setUpdateDataOnMove:( f:(d:LocationViewInterface)=>Promise<RcsbFvTrackData> )=> void;
    readonly includeTooltip: boolean;
    setTooltip: (flag: boolean)=>void;
}