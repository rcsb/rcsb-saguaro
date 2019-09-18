import {RcsbD3Manager, TrackConfInterface} from "./RcsbD3/RcsbD3Manager";
import {Selection, BaseType} from "d3-selection";
import * as classes from "./scss/RcsbBoard.module.scss";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {LocationViewInterface} from "./RcsbBoard";

export interface RcsbTrackInterface  {
    width: number;
    d3Manager: RcsbD3Manager;
}

export class RcsbTrack {
    d3Manager: RcsbD3Manager = null;
    _bgColor: string = "#FFFFFF";
    _height: number = 20;
    _width: number = 920;
    _data: any = null;
    _display: any = null;
    xScale: ScaleLinear<number,number> = scaleLinear();
    g: Selection<BaseType,any,null,undefined> = null;

    constructor(){
    }

    height(h?: number): number{
        if(typeof h === "number"){
            this._height = h;
        }
        return this._height;
    }

    color(c?: string): string{
        if(typeof c === "string"){
            this._bgColor = c;
        }
        return this._bgColor;
    }

    display(newDisplay?: any): any {
        if (arguments.length==0) {
            return this._display;
        }
        this._display = newDisplay;
        if (typeof (this._display) === 'function' && typeof(this._display.layout) === 'function' ) {
             this._display.layout().height(this._height);
        } else {
            for (const key in this._display) {
                if (this._display.hasOwnProperty(key) && typeof(this._display[key].layout) === 'function') {
                    this._display[key].layout().height(this._height);
                }
            }
        }
        return this;
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

        //TODO Display class needs to be reformat
        this.display().scale(this.xScale).init.call(this, this._width);
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

    updateTrack(where: LocationViewInterface): void {
    	if (this._data!==null) {
            this.display().update.call(this, where);
    	}
    }

    setD3Manager(d3Manager: RcsbD3Manager){
        this.d3Manager= d3Manager;
    }

}
