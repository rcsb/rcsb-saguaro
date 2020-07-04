import {
    HighlightRegionInterface,
    MoveSelectedRegionInterface,
    RcsbD3Manager,
    TrackConfInterface
} from "./RcsbD3/RcsbD3Manager";
import {Selection} from "d3-selection";
import * as classes from "./scss/RcsbBoard.module.scss";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {
    RcsbFvTrackData,
    RcsbFvTrackDataElementGapInterface,
    RcsbFvTrackDataElementInterface,
    RcsbFvTrackDataMap
} from "../RcsbDataManager/RcsbDataManager";

export class RcsbTrack {
    d3Manager: RcsbD3Manager;
    private _bgColor: string = "#FFFFFF";
    _height: number;
    private _width: number;
    _data: RcsbFvTrackData;
    xScale: ScaleLinear<number,number> = scaleLinear();
    g: Selection<SVGGElement,any,null,undefined>;
    private boardHighlight: (d: RcsbFvTrackDataElementInterface, propFlag?: boolean) => void;
    mouseoutCallBack: ()=>void;
    mouseoverCallBack: ()=>void;
    mousemoveCallBack: ()=>void;

    height(h?: number): number{
        if(typeof h === "number"){
            this._height = h;
        }
        return this._height;
    }

    trackColor(c?: string): string{
        if(typeof c === "string"){
            this._bgColor = c;
        }
        return this._bgColor;
    }

    init(width: number, scale:ScaleLinear<number,number>, compositeFlag?: boolean, compositeHeight?: number): void{
        this._width = width;
        this.xScale = scale;
    	if(this.g != null) {
            this.g.remove();
        }
    	let height:number = this._height;
        let compH:number = 0;
    	if(compositeFlag === true){
    	    height = 0;
    	    if(typeof compositeHeight === "number")
                compH = compositeHeight;
    	    else
    	        height = 0;
        }
        const config: TrackConfInterface = {
            trackClass: classes.rcsbTrack,
            height: height,
            compositeHeight:compH,
            bgColor: this._bgColor
        };
        this.g = this.d3Manager.addTrack(config);
    }

    load(d?:  RcsbFvTrackData | RcsbFvTrackDataMap): RcsbFvTrackData {
        if(d!=null) {
            const e: RcsbFvTrackData = d as RcsbFvTrackData;
            if (e != null) {
                this._data = e;
            }
        }
        return this._data;
    }

    getData(): RcsbFvTrackData{
        return this._data;
    }

    setBoardHighlight(f: (d:RcsbFvTrackDataElementInterface, propFlag?: boolean) => void){
        this.boardHighlight = f;
    }

    getBoardHighlight(): (d:RcsbFvTrackDataElementInterface, propFlag?: boolean) => void {
        return this.boardHighlight;
    }

    setD3Manager(d3Manager: RcsbD3Manager){
        this.d3Manager= d3Manager;
    }

    highlightRegion(d:RcsbFvTrackDataElementInterface): void {

        this.g.selectAll("."+classes.rcsbSelectRect).remove();

        const height: number = this._height;
        const xScale: ScaleLinear<number,number> = this.xScale;

        if(typeof(height)==="number" && (d!= null && typeof(d.begin)==="number") ) {
            let _end: number = d.begin;
            if(typeof(d.end)==="number")
                _end = d.end;
            let _isEmpty:boolean = false;
            if(d.isEmpty)
                _isEmpty=true;
            const highlightRegConfig: HighlightRegionInterface = {
                trackG: this.g,
                height: height,
                begin: d.begin,
                end: _end,
                xScale: xScale,
                isEmpty: _isEmpty,
                rectClass: classes.rcsbSelectRect,
                gaps: d.gaps != undefined ? d.gaps : new Array<RcsbFvTrackDataElementGapInterface>()
            };
            this.d3Manager.highlightRegion(highlightRegConfig);
        }

    }

    moveSelection(): void{

        const xScale: ScaleLinear<number,number> = this.xScale;
        const moveSelectionConfig: MoveSelectedRegionInterface = {
            trackG: this.g,
            xScale: xScale,
            rectClass: classes.rcsbSelectRect
        };

        this.d3Manager.moveSelection(moveSelectionConfig);
    }

}
