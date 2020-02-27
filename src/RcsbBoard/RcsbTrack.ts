import {HighlightRegionInterface, RcsbD3Manager, TrackConfInterface} from "./RcsbD3/RcsbD3Manager";
import {Selection} from "d3-selection";
import * as classes from "./scss/RcsbBoard.module.scss";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbTrack {
    d3Manager: RcsbD3Manager = null;
    private _bgColor: string = "#FFFFFF";
    _height: number = null;
    private _width: number = null;
    _data: RcsbFvTrackData = null;
    xScale: ScaleLinear<number,number> = scaleLinear();
    g: Selection<SVGGElement,any,null,undefined> = null;
    _boardHighlight: (d: RcsbFvTrackDataElementInterface, propFlag?: boolean) => void;
    mouseoutCallBack: ()=>void = null;
    mouseoverCallBack: ()=>void = null;

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

    init(width: number, scale:ScaleLinear<number,number>, compositeFlag?: boolean): void{
        this._width = width;
        this.xScale = scale;
    	if(this.g !== null) {
            this.g.remove();
        }

    	let height = this._height;
    	if(compositeFlag ===true){
    	    height = 0;
        }

        const config: TrackConfInterface = {
            trackClass: classes.rcsbTrack,
            height: height,
            bgColor: this._bgColor
        };
        this.g = this.d3Manager.addTrack(config);
    }

    load(d?:  RcsbFvTrackData): RcsbFvTrackData {
        if(d !== undefined) {
            this._data = d;
        }
        return this._data;
    }

    setBoardHighlight(f: (d:RcsbFvTrackDataElementInterface, propFlag?: boolean) => void){
        this._boardHighlight = f;
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
                gaps: d.gaps
            };
            this.d3Manager.highlightRegion(highlightRegConfig);
        }

        const selectRect:Selection<SVGRectElement,any,SVGElement,any> = this.g.selectAll<SVGRectElement,any>("."+classes.rcsbSelectRect);
        if(selectRect.size()>0) {
            selectRect.nodes().forEach(n=>{
                this.moveToBack(n);
            });
        }
    }

    moveToFront(elem: HTMLElement|SVGElement): void {
        elem.parentNode.appendChild(elem);
    };

    moveToBack(elem: HTMLElement|SVGElement): void {
        elem.parentNode.prepend(elem);
    };

}
