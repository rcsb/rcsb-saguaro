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
    load: (d:string | RcsbFvTrackData | RcsbFvTrackDataMap) => string | RcsbFvTrackData | RcsbFvTrackDataMap;
    setD3Manager: (d3Manager: RcsbD3Manager) => void;
    setBoardHighlight: (f:(begin: number, end: number, propFlag?: boolean) => void) => void;
    height: (h?: number) => number;
    init: (width: number, scale:ScaleLinear<number,number>, compositeFlag?: boolean) => void;
    highlightRegion: (x:number,y:number) => void;
    trackColor: (c?: string) => string;
}