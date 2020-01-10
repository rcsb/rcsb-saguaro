import {event} from "d3-selection";
import {ScaleLinear, scaleLinear} from "d3-scale";
import {zoom, ZoomBehavior, ZoomedElementBaseType, ZoomTransform, zoomIdentity} from "d3-zoom";

import {
    MainGConfInterface,
    PainConfInterface,
    RcsbD3Manager,
    SVGConfInterface, ZoomConfigInterface
} from "./RcsbD3/RcsbD3Manager";

import * as classes from "./scss/RcsbBoard.module.scss";
import {MOUSE} from "./RcsbD3/RcsbD3Constants";
import {
    EVENT_TYPE,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, ScaleTransformInterface, SelectionInterface
} from "../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";
import {RcsbDisplayInterface} from "./RcsbDisplay/RcsbDisplayInterface";
import {RcsbD3EventDispatcher} from "./RcsbD3/RcsbD3EventDispatcher";
import {RcsbFvTrackDataElementInterface} from "../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

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
    domId: string = null;
    _width: number = 920;
    _bgColor: string = "#FFFFFF";
    _innerPadding: number = 10;
    tracks: Array<RcsbDisplayInterface> = new Array<RcsbDisplayInterface>();
    onHighLightCallBack:(d?:RcsbFvTrackDataElementInterface) => void = null;
    currentSelection: SelectionInterface = {
        rcsbFvTrackDataElement: null,
        domId: null
    };
    xScale: ScaleLinear<number,number> = scaleLinear();
    limits: RegionLimitsInterface = {
        max: 10000,
        min: -1.5,
        maxZoom: 1000000,
        minZoom: 30
    };
    currentLocationView: LocationViewInterface = {
        from:1,
        to:500
    };

    zoomEventHandler:ZoomBehavior<ZoomedElementBaseType, any> = zoom();

    mouseoverCallBack: Array<()=>void> = new Array<()=> void>();
    mouseoutCallBack: Array<()=>void> = new Array<()=> void>();

    constructor(elementId: string) {
        this.domId = elementId;
    }

    private addSVG():void {
        const svgConfig: SVGConfInterface = {
            elementId: this.domId,
            svgClass: classes.rcsbSvg,
            domClass: classes.rcsbDom,
            width: this._width,
            pointerEvents: "all",
            mouseoutCallBack: this.mouseoutCallBack,
            mouseoverCallBack: this.mouseoverCallBack
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

        const paneConfig: PainConfInterface = {
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
        this.limits.max = to;
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
                RcsbBoard.triggerSelectionEvent({
                    eventType:EVENT_TYPE.SELECTION,
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
        this.addSVG();
        if ((this.limits.max - this.limits.min) < this.limits.maxZoom) {
            this.limits.maxZoom = this.limits.max - this.limits.min;
        }

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

        if ((this.currentLocationView.to - this.currentLocationView.from) < this.limits.minZoom) {
            if ((this.currentLocationView.from + this.limits.minZoom) > this.limits.max) {
                this.currentLocationView.to = this.limits.max;
            } else {
                this.currentLocationView.to = this.currentLocationView.from + this.limits.minZoom;
            }
        }

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
                t.setD3Manager(this.d3Manager);
                t.setBoardHighlight(this.highlightRegion.bind(this));
                if(typeof t.mouseoutCallBack === "function"){
                    this.mouseoutCallBack.push(t.mouseoutCallBack.bind(t))
                }
                if(typeof t.mouseoverCallBack === "function"){
                    this.mouseoverCallBack.push(t.mouseoverCallBack.bind(t))
                }
                this.tracks.push(t);
            });
        }else{
            track.setD3Manager(this.d3Manager);
            track.setBoardHighlight(this.highlightRegion.bind(this));
            if(typeof track.mouseoutCallBack === "function"){
                this.mouseoutCallBack.push(track.mouseoutCallBack.bind(track))
            }
            if(typeof track.mouseoverCallBack === "function"){
                this.mouseoverCallBack.push(track.mouseoverCallBack.bind(track))
            }
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

    setBoardWidth(w: number): void{
        this._width = w;
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
            track.update(this.currentLocationView);
        });
    }

    moveBoard(newTransform: ZoomTransform, propFlag: boolean): void {

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
            const midPoint: number = 0.5*(newDomain[1] + newDomain[0]);
            newDomain = [midPoint-0.5*length,midPoint+0.5*length];
        }else if(length<this.limits.minZoom){
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

        const deferCancel = (callBack: () => void, waitTime: number) => {
            let tick:number = null;
            return () =>{
                const args = Array.prototype.slice.call(arguments);
                const self = this;
                window.clearTimeout(tick);
                tick = window.setTimeout (function () {
                    callBack.apply(self, args);
                }, waitTime);
            };
        };

        deferCancel(this.updateAllTracks.bind(this), 500)();

    	this.tracks.forEach(track=> {
            track.move();
        });

        this.highlightRegion(undefined );

        if(propFlag !== true){
            const data:ScaleTransformInterface = {
                transform:transform,
                domId:this.domId
            };
            RcsbBoard.triggerScaleEvent({
                    eventType:EVENT_TYPE.SCALE,
                    eventData:data
            } as RcsbFvContextManagerInterface);
        }
    };

    public setScale(transformEvent: ScaleTransformInterface){
        if(transformEvent.domId !== this.domId){
    	    this.moveBoard(transformEvent.transform,true);
        }
    }

    private static triggerScaleEvent(geoTrans: RcsbFvContextManagerInterface){
        RcsbFvContextManager.next(geoTrans);
    }

    private static triggerSelectionEvent(selection: RcsbFvContextManagerInterface){
        RcsbFvContextManager.next(selection);
    }
}