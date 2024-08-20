import {zoom, ZoomBehavior, zoomIdentity, ZoomTransform} from "d3-zoom";

import {
    MainGConfInterface,
    PaneConfInterface,
    RcsbD3Manager,
    SVGConfInterface,
    ZoomConfigInterface
} from "./RcsbD3/RcsbD3Manager";

import * as classes from "../scss/RcsbBoard.module.scss";
import {MOUSE} from "./RcsbD3/RcsbD3Constants";
import {
    CONDITIONAL_FLAG,
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerType
} from "../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";
import {RcsbDisplayInterface, RcsbTrackInterface} from "./RcsbDisplay/RcsbDisplayInterface";
import {RcsbD3EventDispatcher} from "./RcsbD3/RcsbD3EventDispatcher";
import {RcsbFvTrackDataElementInterface} from "../RcsbDataManager/RcsbDataManager";
import {RcsbFvDefaultConfigValues} from "../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbSelection} from "./RcsbSelection";
import {asyncScheduler, Subject, Subscription} from "rxjs";
import {RcsbScaleInterface} from "./RcsbD3/RcsbD3ScaleFactory";
import {D3ZoomEvent} from "d3";
import {RcsbWindowEventManager} from "./RcsbWindowEventManager";

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
    private readonly boardDiv: HTMLElement;
    private _width: number = 920;
    private _bgColor: string = "#FFFFFF";
    private _innerPadding: number = 10;
    private tracks: Array<RcsbDisplayInterface> = new Array<RcsbDisplayInterface>();
    private highlightHoverElementFlag: boolean = false;
    private readonly selection: RcsbSelection;
    private readonly _xScale: RcsbScaleInterface;


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

    private updateTask: Subscription | null = null;
    private updateDelay: number = 300;

    private upToDate: boolean = true;
    private isIntersecting: boolean = true;

    private zoomEventHandler:ZoomBehavior<Element, any> = zoom();

    private readonly boardSubject: RcsbTrackInterface["trackSubject"] = {
        mousemove: new Subject<{e: MouseEvent, n: number}>(),
        mouseenter: new Subject<MouseEvent>(),
        mouseleave: new Subject<MouseEvent>()
    }

    private readonly mouseHoverSubject: Subject<Array<RcsbFvTrackDataElementInterface>> = new Subject<Array<RcsbFvTrackDataElementInterface>>();
    public readonly elementClickSubject: Subject<{d?:RcsbFvTrackDataElementInterface; e?: MouseEvent;}> = new Subject();

    private readonly contextManager: RcsbFvContextManager;

    private readonly scrollEvent = (isIntersecting: boolean)=>{
        this.isIntersecting = isIntersecting;
        if(!this.upToDate && this.isIntersecting)
            this.updateAndMove();
    };

    constructor(elementId: string, xScale: RcsbScaleInterface, selection: RcsbSelection, contextManager: RcsbFvContextManager) {
        this.domId = elementId;
        this.contextManager = contextManager;
        this._xScale = xScale;
        this.selection = selection;
        const boardDiv: HTMLElement | null = document.getElementById(this.domId);
        if(boardDiv == null){
            throw "Board DOM ["+this.domId+"] element not found. Removing scroll event handler from window";
        }
        this.boardDiv = boardDiv;
        RcsbWindowEventManager.intersectionObserve(this.boardDiv, this.scrollEvent);
    }

    public removeScrollEvent(){
        RcsbWindowEventManager.intersectionUnobserve(this.boardDiv);
    }

    private addSVG():void {
        const svgConfig: SVGConfInterface = {
            elementId: this.domId,
            svgClass: classes.rcsbSvg,
            domClass: classes.rcsbDom,
            width: this._width,
            pointerEvents: "all",
            boardSubject: this.boardSubject,
            xScale: this._xScale
        };
        this.d3Manager.buildSvgNode(svgConfig);
        this.addMainG();
    }

    private addMainG():void{
        const innerConfig: MainGConfInterface ={
            masterClass: classes.rcsbMasterG,
            innerClass: classes.rcsbInnerG,
            mouseUp:(event: MouseEvent)=>{
                if(event.button === MOUSE.RIGHT) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    RcsbD3EventDispatcher.boardMouseup(event, this);
                }
            },
            mouseDown:(event: MouseEvent)=>{
                if(event.button === MOUSE.RIGHT) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    RcsbD3EventDispatcher.boardMousedown(event, this);
                }
            },
            dblClick:(event: MouseEvent)=>{
                this.highlightRegion(null, 'set','select', false);
                this.elementClickSubject.next({});
            },
            mouseEnter:(event: MouseEvent)=>{
                if(RcsbD3EventDispatcher.keepSelectingFlag) {
                    RcsbD3EventDispatcher.changeTrack(event, this);
                }
            },
            mouseLeave:(event: MouseEvent)=>{
                if(RcsbD3EventDispatcher.keepSelectingFlag) {
                    RcsbD3EventDispatcher.leavingTrack(event, this);
                }
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

    public setElementClickCallback(f:(d?:RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void){
       this.elementClickSubject.subscribe(({d,e})=>f(d,e));
    }

    public setHighlightHoverPosition(){
        this.boardSubject.mousemove.subscribe((d: {e: MouseEvent, n:number})=>{
            if(this.contextManager.getCondition(CONDITIONAL_FLAG.STOP_MOUSE_MOVE_HOVERING_HIGHLIGHT))
                return;
            this.highlightRegion({begin:d.n,nonSpecific:true},'set','hover')
        });
    }

    public addHoverCallback(f:(n:Array<RcsbFvTrackDataElementInterface>)=>void){
        this.mouseHoverSubject.subscribe(f);
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

    public setSelection(boardId: string, mode:'select'|'hover'): void{
        if(this.domId != boardId)
            this.highlightRegion(null, 'set', mode, true);
    }

    public highlightRegion(d:RcsbFvTrackDataElementInterface | null, operation: 'set'|'add'|'replace-last', mode:'select'|'hover', propFlag?: boolean): void{
        if(d!=null) {
            if(operation === 'set')
                this.selection.setSelected({rcsbFvTrackDataElement: d, domId: this.domId}, mode);
            else if(operation === 'add' || operation === 'replace-last')
                this.selection.addSelected({rcsbFvTrackDataElement: d, domId: this.domId}, mode, operation === 'replace-last')
        } else if(propFlag === false) {
            this.selection.clearSelection(mode);
        }

        if(propFlag!=true) {
            this.triggerSelectionEvent({
                eventType:EventType.SELECTION,
                eventData:{
                    trackId:this.domId,
                    mode: mode
                }
            });
            if(mode === 'hover')
                this.mouseHoverSubject.next(this.selection.getSelected('hover').map(r=>r.rcsbFvTrackDataElement))
        }

        if(this.selection.getSelected(mode).length > 0) {
            this.tracks.forEach((track) => {
                track.highlightRegion(
                    this.selection.getSelected(mode).map(d=>d.rcsbFvTrackDataElement),
                    mode === 'hover' ? {color:"#FFCCCC", rectClass:classes.rcsbHoverRect} : undefined
                    );
            });
        }else{
            this.tracks.forEach((track) => {
                track.highlightRegion(null, mode === 'hover' ? {color:"#FFCCCC", rectClass:classes.rcsbHoverRect} : undefined);
            });
        }
    }

    private moveSelection(): void{
        if(this.selection.getSelected('select').length > 0) {
            this.tracks.forEach((track) => {
                track.moveSelection('select');
            });
        }
        if(this.selection.getSelected('hover').length > 0) {
            this.tracks.forEach((track) => {
                track.moveSelection('hover');
            });
        }
    }

    public startBoard(): void {
        if ((this.currentLocationView.to - this.currentLocationView.from) < this.limits.minZoom) {
            this.currentLocationView.to = this.currentLocationView.from + this.limits.minZoom;
        }else if((this.currentLocationView.to - this.currentLocationView.from) > this.limits.maxZoom){
            this.currentLocationView.to = this.currentLocationView.from + this.limits.maxZoom;
        }
        this.addSVG();
        if(
            !this.xScale().checkAndSetScale(
            [this.currentLocationView.from, this.currentLocationView.to],
            [this._innerPadding, this._width - this._innerPadding]
            )
            && this.selection.getSelected("select").length > 0
        ){
            this.selection.clearSelection("select");
        }
        this.d3Manager.addZoom({
            zoomEventHandler: this.zoomEventHandler,
            zoomCallback: this.moveBoard.bind(this)
        } as ZoomConfigInterface);

        this.startTracks();
    }

    private startTracks(): void{
    	this.tracks.forEach(track=>{
            track.init(this._xScale);
        });
    	this.setBoardHeight();
        this.tracks.forEach((track)=> {
            track.update();
        });

    }

    public reset(): void{
        this.tracks = new Array<RcsbDisplayInterface>();
        this.d3Manager.resetAllTracks();
    }

    public setHighlightHoverElement(flag: boolean): void{
        this.highlightHoverElementFlag = flag;
    }

    private addHighlightHoverElement(t: RcsbDisplayInterface){
        t.subscribeElementHighlight({
            enter: (d: RcsbFvTrackDataElementInterface)=>{
                this.contextManager.setCondition(CONDITIONAL_FLAG.STOP_MOUSE_MOVE_HOVERING_HIGHLIGHT, true);
                this.highlightRegion(d,'set', 'hover');
            },
            leave: (d:RcsbFvTrackDataElementInterface)=>{
                this.highlightRegion(null, 'set', 'hover', false);
                this.contextManager.setCondition(CONDITIONAL_FLAG.STOP_MOUSE_MOVE_HOVERING_HIGHLIGHT, false);
            }
        });
    }

    public addTrack(track: RcsbDisplayInterface|Array<RcsbDisplayInterface>, options?:{}): void{
        if (track instanceof Array) {
            track.forEach((t) => {
                this.addTrackCallbacks(t);
            });
        }else{
            this.addTrackCallbacks(track);
        }
    }

    private addTrackCallbacks(t: RcsbDisplayInterface){
        t.setManagers(this.d3Manager, this.contextManager);
        t.setBoardHighlight(this.highlightRegion.bind(this));
        if(this.highlightHoverElementFlag)
            this.addHighlightHoverElement(t);
        this.boardSubject.mouseleave.subscribe(e=>t.trackSubject.mouseleave.next(e));
        this.boardSubject.mouseenter.subscribe(e=>t.trackSubject.mouseenter.next(e));
        this.boardSubject.mousemove.subscribe(d=> t.trackSubject.mousemove.next(d));
        this.tracks.push(t);
    }

    private setBoardHeight(): void{
        let h = 0;
        this.tracks.forEach(track=>{
            h += track.height();
        });
        this.d3Manager.setBoardHeight(h);
    }

    public setBoardWidth(w: number): void{
        this._width = w;
    }

    private setLocation(from: number, to: number): void {
        this.currentLocationView = {
            from: from,
            to: to
        };
    }

    private updateAllTracks(): void {
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

    public xScale(): RcsbScaleInterface{
        return this._xScale;
    }

    private moveBoard(event: D3ZoomEvent<SVGGElement,null>, newTransform: ZoomTransform, propFlag: boolean): void {

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

        let newDomain:number[] = transform.rescaleX(this._xScale.getScale()).domain();
        let length: number = newDomain[1] - newDomain[0];

        if( length < this.limits.minZoom ){
            this.d3Manager.zoomG().call(this.zoomEventHandler.transform, zoomIdentity);
            return;
        }

        if(length > this.limits.maxZoom){
            newDomain = [this.limits.min, this.limits.max]
        }else if(newDomain[0] < this.limits.min){
            newDomain = [this.limits.min, this.limits.min+length];
        }else if(newDomain[1] > this.limits.max){
            newDomain = [this.limits.max-length, this.limits.max];
        }

        this._xScale.domain(newDomain);
        this.d3Manager.zoomG().call(this.zoomEventHandler.transform, zoomIdentity);

        this.updateAndMove();

        if(!propFlag){
            this.triggerScaleEvent({
                    eventType:EventType.SCALE,
                    eventData:this.domId
            } as RcsbFvContextManagerType);
        }
    };

    private updateAndMove(): void{
        if(this.isIntersecting) {
            this.moveAllTracks();
            this.moveSelection();
            this.updateWithDelay();
            this.upToDate = true;
        }else{
            this.upToDate = false;
        }
    }

    private updateWithDelay(): void {
        this.updateTask?.unsubscribe();
        this.updateTask = asyncScheduler.schedule(() => {
            this.updateAllTracks();
        }, this.updateDelay);
    };

    public setScale(domId: string){
        if(domId != this.domId){
            this.updateAndMove();
        }
    }

    public getSelection(): RcsbSelection {
        return this.selection;
    }

    private triggerScaleEvent(geoTrans: RcsbFvContextManagerType){
        this.contextManager.next(geoTrans);
    }

    private triggerSelectionEvent(selection: RcsbFvContextManagerType){
        this.contextManager.next(selection);
    }

}