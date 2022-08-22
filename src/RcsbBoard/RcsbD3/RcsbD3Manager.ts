import {RcsbD3Constants} from "./RcsbD3Constants";
import {Selection, select, BaseType, pointer} from "d3-selection";
import {ZoomBehavior, ZoomedElementBaseType} from "d3-zoom";
import classes from "../scss/RcsbBoard.module.scss";
import {
    RcsbFvTrackDataElementInterface
} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbScaleInterface} from "./RcsbD3ScaleFactory";

export interface SVGConfInterface  {
    elementId: string,
    domClass: string;
    svgClass: string;
    width: number;
    pointerEvents: string;
    mouseoutCallBack: Array<()=>void>;
    mouseoverCallBack: Array<()=>void>;
    mousemoveCallBack: Array<(event: MouseEvent, n:number)=>void>;
    xScale: RcsbScaleInterface;
}

export interface MainGConfInterface  {
    masterClass: string;
    innerClass: string;
    dblClick: (event:  MouseEvent) => void;
    mouseDown: (event:  MouseEvent) => void;
    mouseUp: (event:  MouseEvent) => void;
    mouseEnter: (event:  MouseEvent) => void;
    mouseLeave: (event:  MouseEvent) => void;
}

export interface PaneConfInterface {
    paneClass: string;
    bgColor: string;
    elementId: string;
}

export interface TrackConfInterface {
    trackClass: string;
    height: number;
    compositeHeight: number;
    bgColor: string;
}

export interface ZoomConfigInterface {
    zoomEventHandler:ZoomBehavior<ZoomedElementBaseType, any>;
    zoomCallBack: () => void;
}

export interface HighlightRegionInterface {
    trackG: Selection<SVGGElement,any,null,undefined>;
    height: number;
    xScale: RcsbScaleInterface;
    rectClass: string;
    elements:Array<RcsbFvTrackDataElementInterface>;
    color?: string;
}

export interface MoveSelectedRegionInterface {
    trackG: Selection<SVGGElement,any,null,undefined>;
    xScale: RcsbScaleInterface;
    rectClass: string;
}

interface SelectedElementInterface {
    begin: number;
    end: number;
}

export class RcsbD3Manager {

    private _dom: Selection<HTMLElement | null, any, null, undefined>;
    private _svg: Selection<SVGSVGElement, any, null, undefined>;
    private _zoomG: Selection<SVGGElement, any, null, undefined>;
    private _svgG: Selection<SVGGElement, any, null, undefined>;
    private _pane: Selection<SVGRectElement, any, null, undefined>;
    private _trackHeightPosition: number = 0;
    private _width: number;

    svgG(): Selection<SVGGElement, any, null, undefined> {
        return this._svgG;
    }

    zoomG(): Selection<SVGGElement, any, null, undefined> {
        return this._zoomG;
    }

    buildSvgNode(config: SVGConfInterface): void {
        this._dom = select(document.getElementById(config.elementId));
        this._dom.classed(config.domClass, true)
            .style(RcsbD3Constants.WIDTH, config.width + "px");

        this._svg = this._dom.append<SVGSVGElement>(RcsbD3Constants.SVG)
            .attr(RcsbD3Constants.CLASS, config.svgClass)
            .attr(RcsbD3Constants.WIDTH, config.width)
            .attr(RcsbD3Constants.POINTER_EVENTS, config.pointerEvents)
            .on(RcsbD3Constants.CONTEXT_MENU, (event:MouseEvent)=>{
                event.preventDefault();
            })
            .on(RcsbD3Constants.MOUSE_WHEEL, (event:MouseEvent)=>{
                event.preventDefault();
            })
            .on(RcsbD3Constants.MOUSE_ENTER,(event:MouseEvent)=>{
                config.mouseoverCallBack.forEach(f=>{
                    f();
                });
            })
            .on(RcsbD3Constants.MOUSE_LEAVE,(event:MouseEvent)=>{
                config.mouseoutCallBack.forEach(f=>{
                    f();
                })
            }).on(RcsbD3Constants.MOUSE_MOVE,(event: MouseEvent)=>{
                const index: number = config.mousemoveCallBack.length > 0 ? Math.round(config.xScale.invert(pointer(event, this.getPane())[0])) : -1;
                config.mousemoveCallBack.forEach(f=>{
                    f(event, index);
                })
            });
        this._width = config.width;
    }

    addMainG(config: MainGConfInterface): void {
        this._zoomG = this._svg.append<SVGGElement>(RcsbD3Constants.G);
        this._svgG = this._zoomG.attr(RcsbD3Constants.CLASS, config.masterClass)
            .append<SVGGElement>(RcsbD3Constants.G)
            .attr(RcsbD3Constants.CLASS, config.innerClass)
            .on(RcsbD3Constants.DBL_CLICK, config.dblClick)
            .on(RcsbD3Constants.MOUSE_DOWN, config.mouseDown)
            .on(RcsbD3Constants.MOUSE_UP, config.mouseUp)
            .on(RcsbD3Constants.MOUSE_ENTER, config.mouseEnter)
            .on(RcsbD3Constants.MOUSE_LEAVE, config.mouseLeave);
    }

    addPane(config: PaneConfInterface): void {
        this._pane = this._svgG
            .append<SVGRectElement>(RcsbD3Constants.RECT)
            .attr(RcsbD3Constants.CLASS, config.paneClass)
            .attr(RcsbD3Constants.ID, config.elementId)
            .attr(RcsbD3Constants.WIDTH, this._width)
            .style(RcsbD3Constants.FILL, config.bgColor)
    }

    getPane(): SVGRectElement{
        const out: SVGRectElement | null =  this._pane.node();
        if( out == null)
            throw "SVG main panel is null";
        return out;
    }

    resetAllTracks(): void{
        this._trackHeightPosition = 0;
        this._svgG.selectAll("."+classes.rcsbTrack).remove();
    }

    addTrack(config: TrackConfInterface): Selection<SVGGElement, any, null, undefined> {
        //TODO why color filling is setup here ? (Line 141 should be enough)
        this._pane.style(RcsbD3Constants.FILL, config.bgColor);

        const trackG: Selection<SVGGElement, any, null, undefined> = this._svgG
            .append<SVGGElement>(RcsbD3Constants.G)
            .attr(RcsbD3Constants.CLASS, config.trackClass)
            .attr(RcsbD3Constants.TRANSFORM, "translate(0," + (this._trackHeightPosition+config.compositeHeight) + ")");

        this._trackHeightPosition += config.height;

        return trackG;
    }

    setBoardHeight(height: number): void {
        this._dom.style(RcsbD3Constants.HEIGHT, height + "px");
        this._svg.attr(RcsbD3Constants.HEIGHT, height);
        this._pane.attr(RcsbD3Constants.HEIGHT, height);
    }

    addZoom(config: ZoomConfigInterface): void {
        this._zoomG.call(
            config.zoomEventHandler.on(RcsbD3Constants.ZOOM, config.zoomCallBack)
        ).on(RcsbD3Constants.DBLCLIK_ZOOM, null);
    }

    highlightRegion(hlConfig: HighlightRegionInterface): void {

        const elementsToSelect: Array<SelectedElementInterface> = new Array<SelectedElementInterface>();
        const hlRegion:(b:number,e:number)=>SelectedElementInterface = (begin:number,end:number) => {
            return {begin:begin, end:end};
        };
        const minWidth = (begin:number, end:number)=>{
            let w: number = (hlConfig.xScale(end + 0.5) ?? 0)  - (hlConfig.xScale(begin - 0.5) ?? 0);
            if(w<2)w=2;
            return w;
        };

        hlConfig.elements.forEach(e=>{
            const end = e.end ?? e.begin;
            if(e.isEmpty) {
                elementsToSelect.push(hlRegion(e.begin, e.begin));
                elementsToSelect.push(hlRegion(end, end));
            }else if(e.gaps!=null && e.gaps.length>0){
                let begin:number = e.begin;
                e.gaps.forEach(gap=>{
                    let end: number = gap.begin;
                    elementsToSelect.push(hlRegion(begin,end));
                    begin = gap.end;
                });
                elementsToSelect.push(hlRegion(begin,end));
            }else{
                elementsToSelect.push(hlRegion(e.begin,end));
            }
        });

        const elements:Selection<SVGGElement,SelectedElementInterface,BaseType,undefined> = hlConfig.trackG
            .selectAll<SVGGElement,SelectedElementInterface>("."+hlConfig.rectClass)
            .data(elementsToSelect, (d)=>{return d.begin+":"+d.end});

        elements.enter()
            .append<SVGGElement>(RcsbD3Constants.G)
            .attr(RcsbD3Constants.CLASS, hlConfig.rectClass)
            .call((e)=>{
              e.append<SVGRectElement>(RcsbD3Constants.RECT)
                  .attr(RcsbD3Constants.X, (d:SelectedElementInterface)=>{
                      return hlConfig.xScale(d.begin - 0.5) ?? 0})
                  .attr(RcsbD3Constants.Y, 0)
                  .attr(RcsbD3Constants.WIDTH, (d:SelectedElementInterface)=>{
                      return minWidth(d.begin,d.end)})
                  .attr(RcsbD3Constants.HEIGHT, hlConfig.height)
                  .attr(RcsbD3Constants.FILL, hlConfig.color ?? "#faf3c0")
                  .attr(RcsbD3Constants.FILL_OPACITY, 0.75)
            })
            .lower();
        elements.exit().remove();
    }

    moveSelection(config: MoveSelectedRegionInterface): void{
        const minWidth = (begin:number, end:number)=>{
            let w: number = (config.xScale(end + 0.5) ?? 0) - (config.xScale(begin - 0.5) ?? 0);
            if(w<2)w=2;
            return w;
        };
        const selectRect:Selection<SVGGElement,SelectedElementInterface,SVGElement,any> = config.trackG.selectAll<SVGGElement,any>("."+config.rectClass);
        selectRect.select(RcsbD3Constants.RECT)
            .attr(RcsbD3Constants.X, (d:SelectedElementInterface)=>{
                return config.xScale(d.begin - 0.5) ?? 0
            })
            .attr(RcsbD3Constants.WIDTH, (d:SelectedElementInterface)=>{
                return minWidth(d.begin,d.end)
            });

    }
}
