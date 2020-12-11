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
    RcsbFvContextManagerInterface
} from "../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";
import {RcsbDisplayInterface} from "./RcsbDisplay/RcsbDisplayInterface";
import {RcsbD3EventDispatcher} from "./RcsbD3/RcsbD3EventDispatcher";
import {RcsbFvTrackDataElementInterface} from "../RcsbDataManager/RcsbDataManager";
import {RcsbFvDefaultConfigValues} from "../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbSelection} from "./RcsbSelection";

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
    readonly d3Manager: RcsbD3Manager = new RcsbD3Manager();
    private readonly domId: string;
    private _width: number = 920;
    private _bgColor: string = "#FFFFFF";
    private _innerPadding: number = 10;
    private tracks: Array<RcsbDisplayInterface> = new Array<RcsbDisplayInterface>();
    onHighLightCallBack:(d?:RcsbFvTrackDataElementInterface) => void;

    private readonly _xScale: ScaleLinear<number,number> = scaleLinear();
    private readonly selection: RcsbSelection;

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

    private upToDate: boolean = true;

    private zoomEventHandler:ZoomBehavior<ZoomedElementBaseType, any> = zoom();

    private mouseoverCallBack: Array<()=>void> = new Array<()=> void>();
    private mouseoutCallBack: Array<()=>void> = new Array<()=> void>();
    private mousemoveCallBack: Array<()=>void> = new Array<()=> void>();

    private readonly contextManager: RcsbFvContextManager;

    private readonly scrollEvent = ()=>{
        if(!this.upToDate)
            this.updateAndMove();
    };

    constructor(elementId: string, xScale: ScaleLinear<number,number>, selection: RcsbSelection, contextManager: RcsbFvContextManager) {
        this.domId = elementId;
        this.contextManager = contextManager;
        this._xScale = xScale;
        this.selection = selection;
        window.addEventListener("scroll", this.scrollEvent);
    }

    public removeScrollEvent(){
        window.removeEventListener("scroll", this.scrollEvent);
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
            masterClass: classes.rcsbMasterG,
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
                if(typeof this.onHighLightCallBack === "function")
                    this.onHighLightCallBack();
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

    public setSelection(boardId: string): void{
        if(this.domId != boardId)
            this.highlightRegion(null,true);
    }

    highlightRegion(d:RcsbFvTrackDataElementInterface | null, propFlag?: boolean): void{
        if(d!=null)
            this.selection.setSelected({rcsbFvTrackDataElement:d,domId:this.domId});
        else if(propFlag === false)
            this.selection.clearSelection();

        if(propFlag!=true) {
            this.triggerSelectionEvent({
                eventType:EventType.SELECTION,
                eventData:this.domId
            });
        }

        if(this.selection.getSelected().length > 0) {
            this.tracks.forEach((track) => {
                track.highlightRegion(this.selection.getSelected().map(d=>d.rcsbFvTrackDataElement));
            });
        }else{
            this.tracks.forEach((track) => {
                track.highlightRegion(null);
            });
        }
    }

    moveSelection(): void{
        if(this.selection.getSelected().length > 0) {
            this.tracks.forEach((track) => {
                track.moveSelection();
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
        if(this.xScale().domain()[0] === 0 && this.xScale().domain()[1] === 1)
            this.xScale().domain([this.currentLocationView.from, this.currentLocationView.to])
                         .range([this._innerPadding, this._width - this._innerPadding]);

        this.d3Manager.addZoom({
            zoomEventHandler: this.zoomEventHandler,
            zoomCallBack: this.moveBoard.bind(this)
        } as ZoomConfigInterface);

        this.startTracks();
    }

    startTracks(): void{
    	this.tracks.forEach(track=>{
            track.init(this._width, this._xScale);
        });
    	this.setBoardHeight();
        this.tracks.forEach((track)=> {
            track.update();
        });

    }

    updateBoard(): void{
        this.tracks.forEach((track)=> {
            track.update();
        })
    }

    reset(): void{
        this.tracks = new Array<RcsbDisplayInterface>();
        this.d3Manager.resetAllTracks();
    }

    public addTrack(track: RcsbDisplayInterface|Array<RcsbDisplayInterface>): void{
        if (track instanceof Array) {
            track.forEach((t) => {
                this.addTrackCallBacks(t);
            });
        }else{
            this.addTrackCallBacks(track);
        }
    }

    private addTrackCallBacks(t: RcsbDisplayInterface){
        t.setManagers(this.d3Manager, this.contextManager);
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
        const location = this.xScale().domain();
    	this.setLocation(~~location[0],~~location[1]);
        this.tracks.forEach(track=> {
            track.update();
        });
    }

    private moveAllTracks():void{
        this.tracks.forEach(track=> {
            track.move();
        });
    }

    xScale(): ScaleLinear<number,number>{
        return this._xScale;
    }

    private moveBoard(newTransform: ZoomTransform, propFlag: boolean): void {

        let transform: ZoomTransform;
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

        let newDomain:number[] = transform.rescaleX(this._xScale).domain();
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

        this._xScale.domain(newDomain);
        this.d3Manager.zoomG().call(this.zoomEventHandler.transform, zoomIdentity);

        this.updateAndMove();

        if(!propFlag){
            this.triggerScaleEvent({
                    eventType:EventType.SCALE,
                    eventData:this.domId
            } as RcsbFvContextManagerInterface);
        }
    };

    private updateAndMove(): void{
        if(this.boardInViewport()) {
            this.moveAllTracks();
            this.moveSelection();
            this.updateWithDelay();
            this.upToDate = true;
        }else{
            this.upToDate = false;
        }
    }

    private updateWithDelay(): void {
        if(window != null) {
            window.clearTimeout(this.updateId);
            this.updateId = window.setTimeout(() => {
                this.updateAllTracks();
            }, this.updateDelay);
        }
    };

    public setScale(domId: string){
        if(domId != this.domId){
            this.updateAndMove();
        }
    }

    private triggerScaleEvent(geoTrans: RcsbFvContextManagerInterface){
        this.contextManager.next(geoTrans);
    }

    private triggerSelectionEvent(selection: RcsbFvContextManagerInterface){
        this.contextManager.next(selection);
    }

    private boardInViewport():boolean {
        const boardDiv: HTMLElement | null = document.getElementById(this.domId);
        if(boardDiv == null){
            console.warn("Board DOM ["+this.domId+"] element not found. Removing scroll event handler from window");
            this.removeScrollEvent();
            return false;
        }
        const rect:DOMRect = boardDiv.getBoundingClientRect();
        return (
            rect.top >= -10 &&
            rect.bottom <= ((window.innerHeight || document.documentElement.clientHeight)+10)
        );
    }
}