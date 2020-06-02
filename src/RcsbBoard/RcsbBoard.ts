import {event} from "d3-selection";
import {ScaleLinear, scaleLinear} from "d3-scale";
import {zoom, ZoomBehavior, ZoomedElementBaseType, ZoomTransform, zoomIdentity} from "d3-zoom";

import {
    MainGConfInterface,
    PaneConfInterface,
    RcsbD3Manager,
    SVGConfInterface, ZoomConfigInterface
} from "./RcsbD3/RcsbD3Manager";

import * as classes from "./scss/RcsbBoard.module.scss";
import {MOUSE} from "./RcsbD3/RcsbD3Constants";
import {
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, ScaleTransformInterface, SelectionInterface
} from "../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";
import {RcsbDisplayInterface} from "./RcsbDisplay/RcsbDisplayInterface";
import {RcsbD3EventDispatcher} from "./RcsbD3/RcsbD3EventDispatcher";
import {RcsbFvTrackDataElementInterface} from "../RcsbDataManager/RcsbDataManager";
import {RcsbFvDefaultConfigValues} from "../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";

export interface LocationViewInterface {
    from: number;
    to: number;
}

interface RegionLimitsInterface {
    max: number;
    min: number;
    maxZoom: number;
    minZoom: number;
}

export class RcsbBoard {
    d3Manager: RcsbD3Manager = new RcsbD3Manager();
    private readonly domId: string = null;
    private _width: number = 920;
    private _bgColor: string = "#FFFFFF";
    private _innerPadding: number = 10;
    private tracks: Array<RcsbDisplayInterface> = new Array<RcsbDisplayInterface>();
    onHighLightCallBack:(d?:RcsbFvTrackDataElementInterface) => void = null;
    private currentSelection: SelectionInterface = {
        rcsbFvTrackDataElement: null,
        domId: null
    };
    xScale: ScaleLinear<number,number> = scaleLinear();
    private limits: RegionLimitsInterface = {
        max: 1000000000,
        min: -1.5,
        maxZoom: 1000000000,
        minZoom: 20
    };
    private currentLocationView: LocationViewInterface = {
        from:1,
        to:500
    };

    private updateId: number = 0;
    private updateDelay: number = 300;

    private zoomEventHandler:ZoomBehavior<ZoomedElementBaseType, any> = zoom();

    private mouseoverCallBack: Array<()=>void> = new Array<()=> void>();
    private mouseoutCallBack: Array<()=>void> = new Array<()=> void>();
    private mousemoveCallBack: Array<()=>void> = new Array<()=> void>();

    private readonly contextManager: RcsbFvContextManager;

    constructor(elementId: string, contextManager: RcsbFvContextManager) {
        this.domId = elementId;
        this.contextManager = contextManager;
    }

    private addSVG():void {
        const svgConfig: SVGConfInterface = {
            elementId: this.domId,
            svgClass: classes.rcsbSvg,
            domClass: classes.rcsbDom,
            width: this._width,
            pointerEvents: "all",
            mouseoutCallBack: this.mouseoutCallBack,
            mouseoverCallBack: this.mouseoverCallBack,
            mousemoveCallBack: this.mousemoveCallBack
        };
        this.d3Manager.buildSvgNode(svgConfig);
        this.addMainG();
    }

    private addMainG():void{
        const innerConfig: MainGConfInterface ={
            masterClass: classes.rcsbMaterG,
            innerClass: classes.rcsbInnerG,
            mouseUp:()=>{
                if(event.which === MOUSE.LEFT) {
                    event.stopImmediatePropagation();
                }
                RcsbD3EventDispatcher.boardMouseup(this);
            },
            mouseDown:()=>{
                if(event.which === MOUSE.LEFT) {
                    event.stopImmediatePropagation();
                }
                RcsbD3EventDispatcher.boardMousedown(this);
            },
            dblClick:()=>{
                this.highlightRegion(null,false);
            }
        };
        this.d3Manager.addMainG(innerConfig);

        const paneConfig: PaneConfInterface = {
            bgColor: this._bgColor,
            elementId: this.domId+"_pane",
            paneClass: classes.rcsbPane
        };
        this.d3Manager.addPane(paneConfig);
    }

    public setHighLightCallBack(f:(d?:RcsbFvTrackDataElementInterface)=>void){
       this.onHighLightCallBack = f;
    }

    public setRange(from: number, to: number): void{
        this.currentLocationView.from = from;
        this.currentLocationView.to = to;
        this.limits.min = from;
        this.limits.max = to;
        if(this.limits.minZoom > (to-from)){
            const delta: number = RcsbFvDefaultConfigValues.increasedView*0.5;
            this.currentLocationView.from = from+delta;
            this.currentLocationView.to = to-delta;
            this.limits.min = from+delta;
            this.limits.max = to-delta;
            this.limits.minZoom = this.limits.max - this.limits.min;
        }
        if ((this.limits.max - this.limits.min) < this.limits.maxZoom) {
            this.limits.maxZoom = this.limits.max - this.limits.min;

        }
    }

    public setSelection(selection: SelectionInterface): void{
        if(selection.domId !== this.domId){
            this.highlightRegion(selection.rcsbFvTrackDataElement,true);
        }
    }

    highlightRegion(d:RcsbFvTrackDataElementInterface, propFlag?: boolean): void{
        if(d === null  || (d!== undefined && typeof(d.begin) === "number") ){
            this.currentSelection = {rcsbFvTrackDataElement:d, domId: this.domId} as SelectionInterface;
            if(propFlag!==true) {
                this.triggerSelectionEvent({
                    eventType:EventType.SELECTION,
                    eventData:this.currentSelection
                } as RcsbFvContextManagerInterface);
            }
        }else if(this.currentSelection.rcsbFvTrackDataElement != null && typeof(this.currentSelection.rcsbFvTrackDataElement.begin) === "number" ){
            d = this.currentSelection.rcsbFvTrackDataElement;
        }

        if(d!==undefined) {
            this.tracks.forEach((track) => {
                track.highlightRegion(d);
            });
        }
    }

    startBoard(): void {

        if ((this.currentLocationView.to - this.currentLocationView.from) < this.limits.minZoom) {
            this.currentLocationView.to = this.currentLocationView.from + this.limits.minZoom;
        }else if((this.currentLocationView.to - this.currentLocationView.from) > this.limits.maxZoom){
            this.currentLocationView.to = this.currentLocationView.from + this.limits.maxZoom;
        }

        this.addSVG();
        this.xScale = scaleLinear()
            .domain([this.currentLocationView.from, this.currentLocationView.to])
            .range([this._innerPadding, this._width - this._innerPadding]);

        this.d3Manager.addZoom({
            zoomEventHandler: this.zoomEventHandler,
            zoomCallBack: this.moveBoard.bind(this)
        } as ZoomConfigInterface);

        this.startTracks();
    }

    startTracks(): void{
    	this.tracks.forEach(track=>{
            track.init(this._width, this.xScale);
        });
    	this.setBoardHeight();
        this.tracks.forEach((track)=> {
            track.update({from: this.currentLocationView.from, to: this.currentLocationView.to} as LocationViewInterface);
        });

    }

    updateBoard(): void{
        this.tracks.forEach((track)=> {
            track.update({from: this.currentLocationView.from, to: this.currentLocationView.to} as LocationViewInterface);
        })
    }

    reset(): void{
        this.tracks = new Array<RcsbDisplayInterface>();
        this.d3Manager.resetAllTracks();
    }

    public addTrack(track: RcsbDisplayInterface|Array<RcsbDisplayInterface>): void{
        if (track instanceof Array) {
            track.forEach((t) => {
                this.addCallBacks(t);
            });
        }else{
            this.addCallBacks(track);
        }
    }

    private addCallBacks(t: RcsbDisplayInterface){
        t.setD3Manager(this.d3Manager);
        t.setBoardHighlight(this.highlightRegion.bind(this));
        if(typeof t.mouseoutCallBack === "function"){
            this.mouseoutCallBack.push(t.mouseoutCallBack.bind(t))
        }
        if(typeof t.mouseoverCallBack === "function"){
            this.mouseoverCallBack.push(t.mouseoverCallBack.bind(t))
        }
        if(typeof t.mousemoveCallBack === "function"){
            this.mousemoveCallBack.push(t.mousemoveCallBack.bind(t))
        }
        this.tracks.push(t);
    }

    setBoardHeight(): void{
        let h = 0;
        this.tracks.forEach(track=>{
            h += track.height();
        });
        this.d3Manager.setBoardHeight(h);
    }

    setBoardWidth(w: number): void{
        this._width = w;
    }

    private setLocation(from: number, to: number): void {
        this.currentLocationView = {
            from: from,
            to: to
        };
    }

    updateAllTracks(): void {
        const location = this.xScale.domain();
    	this.setLocation(~~location[0],~~location[1]);
        this.tracks.forEach(track=> {
            track.update(this.currentLocationView);
        });
    }

    private moveAllTracks():void{
        this.tracks.forEach(track=> {
            track.move();
        });
    }

    private moveBoard(newTransform: ZoomTransform, propFlag: boolean): void {

        let transform: ZoomTransform = null;
        const isNotIdentity = (transform: ZoomTransform): boolean => {
            return !(transform.x === 0 && transform.y === 0 && transform.k === 1);
        };

        if(typeof newTransform === "object"){
            transform = newTransform;
        }else if(isNotIdentity(event.transform)) {
            transform = event.transform;
        }else{
            return;
        }

        let newDomain:number[] = transform.rescaleX(this.xScale).domain();
        let length: number = newDomain[1] - newDomain[0];

        if(length > this.limits.maxZoom){
            length = this.limits.maxZoom;
        }else if(length < this.limits.minZoom){
            this.d3Manager.zoomG().call(this.zoomEventHandler.transform, zoomIdentity);
            return;
        }

        if(newDomain[0] < this.limits.min){
            newDomain = [this.limits.min , this.limits.min + length];
        }else if(newDomain[1] > this.limits.max){
            newDomain = [this.limits.max - length , this.limits.max];
        }

        this.xScale.domain(newDomain);
        this.d3Manager.zoomG().call(this.zoomEventHandler.transform, zoomIdentity);

        this.updateWithDelay();
    	this.moveAllTracks();

        this.highlightRegion(undefined );

        if(propFlag !== true){
            const data:ScaleTransformInterface = {
                transform:transform,
                domId:this.domId
            };
            this.triggerScaleEvent({
                    eventType:EventType.SCALE,
                    eventData:data
            } as RcsbFvContextManagerInterface);
        }
    };

    private updateWithDelay(): void {
        if(typeof window!== "undefined") {
            window.clearTimeout(this.updateId);
            this.updateId = window.setTimeout(() => {
                this.updateAllTracks();
            }, this.updateDelay);
        }
    };

    public setScale(transformEvent: ScaleTransformInterface){
        if(transformEvent.domId !== this.domId){
    	    this.moveBoard(transformEvent.transform,true);
        }
    }

    private triggerScaleEvent(geoTrans: RcsbFvContextManagerInterface){
        this.contextManager.next(geoTrans);
    }

    private triggerSelectionEvent(selection: RcsbFvContextManagerInterface){
        this.contextManager.next(selection);
    }
}