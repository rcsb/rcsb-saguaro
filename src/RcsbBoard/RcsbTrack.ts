import {HighlightRegionInterface, RcsbD3Manager, TrackConfInterface} from "./RcsbD3/RcsbD3Manager";
import {Selection} from "d3-selection";
import * as classes from "./scss/RcsbBoard.module.scss";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {RcsbFvTrackData} from "../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbTrack {
    d3Manager: RcsbD3Manager = null;
    _bgColor: string = "#FFFFFF";
    _height: number = null;
    _width: number = null;
    _data: string | RcsbFvTrackData = null;
    xScale: ScaleLinear<number,number> = scaleLinear();
    g: Selection<SVGGElement,any,null,undefined> = null;
    _boardHighlight: (begin: number, end: number, propFlag?: boolean) => void;

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

    load(d?: string | RcsbFvTrackData): string | RcsbFvTrackData {
        if(d !== undefined) {
            this._data = d;
        }
        return this._data;
    }

    setBoardHighlight(f: (begin: number, end: number, propFlag?: boolean) => void){
        this._boardHighlight = f;
    }

    setD3Manager(d3Manager: RcsbD3Manager){
        this.d3Manager= d3Manager;
    }

    highlightRegion(begin: number, end:number): void {

        this.g.select("."+classes.rcsbSelectRect).remove();

        const height: number = this._height;
        const xScale: ScaleLinear<number,number> = this.xScale;

        if(typeof(height)==="number" && typeof(begin)==="number" && typeof(end)==="number") {
            const highlightRegConfig: HighlightRegionInterface = {
                trackG: this.g,
                height: height,
                begin: begin,
                end: end,
                xScale: xScale,
                rectClass: classes.rcsbSelectRect
            };
            this.d3Manager.highlightRegion(highlightRegConfig);
        }

        const selectRect:SVGRectElement = this.g.selectAll<SVGRectElement,any>("."+classes.rcsbSelectRect).node();
        if(selectRect) {
            this.moveToBack(selectRect);
        }
    }

    moveToFront(elem: HTMLElement|SVGElement): void {
        elem.parentNode.appendChild(elem);
    };

    moveToBack(elem: HTMLElement|SVGElement): void {
        elem.parentNode.prepend(elem);
    };

}
