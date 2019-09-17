import {event} from "d3-selection";
import {ScaleLinear, scaleLinear} from "d3-scale";
import {zoom, ZoomBehavior, ZoomedElementBaseType} from "d3-zoom";

import {
    MainGConfInterface,
    PainConfInterface,
    RcsbD3Manager,
    SVGConfInterface,
    TrackConfInterface
} from "./RcsbD3/RcsbD3Manager";

import * as classes from "./scss/RcsbBoard.module.scss";
import {MOUSE} from "./RcsbD3/RcsbD3Constants";
import {RcsbFvContextManager} from "../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";

export interface SelectionInterface {
    begin: number;
    end: number;
    domId: string;
}

interface LocationViewInterface {
    from: number;
    to: number;
}

interface RegionLimitsInterface {
    max: number;
    min: number;
    maxZoom: number;
    minZoom: number;
}

export interface ScaleTransform {
    scale:[number,number];
    tr:[[number,number],[number,number]];
    domId: string;
}

export class RcsbBoard {
    d3Manager: RcsbD3Manager = new RcsbD3Manager();
    domId: string = null;
    _width: number = 920;
    _bgColor: string = "#FFFFFF";
    _innerPadding: number = 10;
    tracks: Array<any> = null;
    currentSelection: SelectionInterface;
    xScale: ScaleLinear<number,number> = scaleLinear();
    limits: RegionLimitsInterface = {
        max: 10000,
        min: -1.5,
        maxZoom: 1000000,
        minZoom: 20
    };
    currentLocationView: LocationViewInterface = {
        from:1,
        to:500
    };

    zoomEventHandler:ZoomBehavior<ZoomedElementBaseType, any> = zoom();

    constructor(elementId: string){
        this.domId = elementId;

        const svgConfig: SVGConfInterface = {
            elementId: elementId,
            svgClass:classes.rcsbSvg,
            domClass:classes.rcsbDom,
            width:this._width,
            pointerEvents:"all",
            contextMenu:()=>{
                event.preventDefault();
            }
        };
        this.d3Manager.buildSvgNode(svgConfig);

        const innerConfig: MainGConfInterface ={
            masterClass: classes.rcsbMaterG,
            innerClass: classes.rcsbInnerG,
            mouseUp:()=>{
                if(event.which === MOUSE.LEFT) {
                    event.stopImmediatePropagation();
                }
                //brush_selection.mouseup.call(this,track_vis,svg_g,xScale);
            },
            mouseDown:()=>{
                if(event.which === MOUSE.LEFT) {
                    event.stopImmediatePropagation();
                }
    	        //brush_selection.mousedown.call(this,track_vis,svg_g,xScale);
            },
            dblClick:()=>{
                //this.selectRegion(null,null,false);
            }
        };
        this.d3Manager.addMainG(innerConfig);

        const paneConfig: PainConfInterface = {
            bgColor: this._bgColor,
            elementId: this.domId+"_pane",
            paneClass: classes.rcsbPane
        };
        this.d3Manager.addPane(paneConfig);

    }

    public setRange(from: number, to: number): void{
        this.currentLocationView.from = from;
        this.currentLocationView.to = to;
    }

    public setSelection(selection: SelectionInterface): void{
        if(selection.domId === this.domId){
            this.highlightRegion(selection.begin,selection.end,true);
        }
    }

    highlightRegion(begin: number, end: number, propFlag: boolean): void{
        if((typeof(begin) === "number" && typeof(end)==="number") || (begin === null && end===null)){
            this.currentSelection = {begin:begin, end:end, domId: this.domId} as SelectionInterface;
            if(propFlag!==true) {
                this.triggerSelectionEvent(this.currentSelection);
            }
        }else if(typeof(this.currentSelection.begin) === "number" && typeof(this.currentSelection.end)==="number"){
            begin = this.currentSelection.begin;
            end = this.currentSelection.end;
        }

        //TODO Track class needs to be reformat
        this.tracks.forEach((track)=>{
            if(track.g){
                if(typeof(track.display().displays) === "function"){
                    const display = track.display().displays()[0];
                    display.select_region.call(track, begin, end);
                }else {
                    if(typeof track.display().select_region === "function") {
                        track.display().select_region.call(track, begin, end);
                    }
                }
            }
        });


    }

    startBoard(): void{
        if ((this.limits.max - this.limits.min) < this.limits.maxZoom) {
            this.limits.maxZoom = this.limits.max - this.limits.min;
        }

    	this.xScale = scaleLinear()
    	    .domain([this.currentLocationView.from, this.currentLocationView.to])
    	    .range([this._innerPadding, this._width-this._innerPadding]);

    	this.d3Manager.addZoom({
            zoomEventHandler: this.zoomEventHandler,
            zoomCallBack: this.moveBoard.bind(this),
            xScale: this.xScale,
            scaleExtent: [
                (this.currentLocationView.to-this.currentLocationView.from)/(this.limits.maxZoom-1),
                (this.currentLocationView.to-this.currentLocationView.from)/(this.limits.minZoom)
            ]
        });

    	this.tracks.forEach(track=>{
    	    //TODO Track class needs to be reformat
    	    if(track.g) {
                track.g.remove();
            }
    	    this.initTrack(track);
        });

    	this.setBoardHeight();

        if ((this.currentLocationView.to - this.currentLocationView.from) < this.limits.minZoom) {
            if ((this.currentLocationView.from + this.limits.minZoom) > this.limits.max) {
                this.currentLocationView.to = this.limits.max;
            } else {
                this.currentLocationView.to = this.currentLocationView.from + this.limits.minZoom;
            }
        }

        this.tracks.forEach((track)=> {
            this.updateTrack(track);
        })

    }

    updateBoard(): void{
         this.tracks.forEach((track)=> {
            this.updateTrack(track);
        })
    }

    private initTrack(track: any): void{

        const config: TrackConfInterface = {
            trackClass: classes.rcsbTrack,
            rectClass: classes.rcsbTrackRect,
            height: track.height(),
            width: this._width,
            bgColor: this._bgColor,
            pointerEvents: "none"
        };

        this.d3Manager.addTrack(config);

        //TODO Track class needs to be reformat
    	if (typeof track.display === "function") {
    	    track.display()
                .scale(this.xScale)
                .init.call(track, this._width);
    	}
    }

    private updateTrack(track: any): void {
        const where: LocationViewInterface = this.currentLocationView;
        //TODO Track class needs to be reformat
    	if (track.data()) {
    	    const track_data = track.data();
    	    track_data.call(track, {
                'loc' : where,
                'on_success' : function () {
                    track.display().update.call(track, where);
                }
    	    });
    	}
    }

    public addTrack(track: any): void{
        if (track instanceof Array) {
            track.forEach((t) => {
                this.tracks.push(t);
            });
        }else {
            this.tracks.push(track);
        }
    }

    setBoardHeight(): void{
        let h = 0;
        this.tracks.forEach(track=>{
            h += track.height();
        });
        this.d3Manager.setBoardHeight(h);
    }

    setLocation(from: number, to: number): void {
        this.currentLocationView = {
            from: from,
            to: to
        };
    }

    updateAllTracks(): void {
        const location = this.xScale.domain();
    	this.setLocation(~~location[0],~~location[1]);
        this.tracks.forEach(track=> {
            //TODO Track class needs to be reformat
            track.display().update.call(track, this.currentLocationView);
        });
    }

    moveBoard(newScale: ScaleLinear<number,number>, propFlag: boolean): void {

        //TODO update d3-zoom new mechanichs
    	//this.zoomEventHandler.x(newScale);

        // Avoid moving past the limits
    	const domain = this.xScale.domain();
    	if (domain[0] < this.limits.min) {

    	} else if (domain[1] > this.limits.max) {

    	}

    	const deferCancel = (callBack: any, waitTime: number) => {
    	    let tick = null;
    	    return () =>{
                const args = Array.prototype.slice.call(arguments);
                const self = this;
                clearTimeout();
                tick = setTimeout (function () {
                    callBack.apply(self, args);
                }, waitTime);
            };
        };
    	deferCancel(this.updateAllTracks.bind(this), 100)();

    	this.tracks.forEach(track=> {
            //TODO Track class needs to be reformat
            track.display().mover.call(track);
        });


    	//TODO this shouldnt be here
        //track_vis.select_region.call(track_vis);

        if(propFlag !== true){
            this.triggerScaleEvent({
                scale:this.zoomEventHandler.scaleExtent(),
                tr:this.zoomEventHandler.translateExtent(),
                domId:this.domId
            } as ScaleTransform);
        }
    };

    public setScale(transform: ScaleTransform){
        if(transform.domId !== this.domId){
            this.zoomEventHandler.scaleExtent(transform.scale);
    	    this.zoomEventHandler.translateExtent(transform.tr);
    	    this.moveBoard(undefined,true);
        }
    }

    private triggerScaleEvent(geoTrans: ScaleTransform){
        //TODO the event type is missing
        RcsbFvContextManager.next(geoTrans);
    }

    private triggerSelectionEvent(selection: SelectionInterface){
        RcsbFvContextManager.next(selection);
    }
}