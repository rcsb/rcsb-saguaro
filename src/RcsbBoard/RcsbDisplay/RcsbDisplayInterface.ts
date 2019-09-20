import {Selection} from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {RcsbD3Manager} from "../RcsbD3/RcsbD3Manager";
import {ScaleLinear} from "d3-scale";

export interface RcsbDisplayInterface {
    reset: ()=> void;
    plot:(element:Selection<SVGGElement,any,null,undefined>)=>void;
    update: (where: LocationViewInterface, compKey?: string) => void;
    move: ()=> void;
    load: (d:any) => any;
    data: (d:any) => any;
    setD3Manager: (d3Manager: RcsbD3Manager) => void;
    height: (h?: number) => number;
    trackColor: (c?: string) => string;
    init: (width: number, scale:ScaleLinear<number,number>) => void;
    highlightRegion: (x:number,y:number) => void;
}