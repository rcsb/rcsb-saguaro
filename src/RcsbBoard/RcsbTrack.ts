import {RcsbD3Manager, TrackConfInterface} from "./RcsbD3/RcsbD3Manager";
import {Selection, BaseType} from "d3-selection";
import * as classes from "./scss/RcsbBoard.module.scss";
import {scaleLinear, ScaleLinear} from "d3-scale";

export class RcsbTrack {
    d3Manager: RcsbD3Manager = null;
    _bgColor: string = null;
    _height: number = null;
    _width: number = null;
    _data: any = null;
    xScale: ScaleLinear<number,number> = scaleLinear();
    g: Selection<SVGGElement,any,null,undefined> = null;

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

    init(width: number, scale:ScaleLinear<number,number>): void{
        this._width = width;
        this.xScale = scale;
    	if(this.g !== null) {
            this.g.remove();
        }

        const config: TrackConfInterface = {
            trackClass: classes.rcsbTrack,
            rectClass: classes.rcsbTrackRect,
            height: this._height,
            width: this._width,
            bgColor: this._bgColor,
            pointerEvents: "none"
        };
        this.g = this.d3Manager.addTrack(config);
    }

    data(d?: any): any{
        if(d !== undefined) {
            this._data = d;
        }
        return this._data;
    }

    load(d?: any): any{
        if(d !== undefined) {
            this._data = d;
        }
        return this._data;
    }

    setD3Manager(d3Manager: RcsbD3Manager){
        this.d3Manager= d3Manager;
    }

}
