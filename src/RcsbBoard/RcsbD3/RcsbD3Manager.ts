import {RcsbD3Constants} from "./RcsbD3Constants";
import {Selection, select, BaseType} from "d3-selection";
import {ZoomBehavior, ZoomedElementBaseType} from "d3-zoom";
import {ScaleLinear} from "d3-scale";
import {MoveBlockInterface, PlotBlockInterface, RcsbD3BlockManager} from "./RcsbD3DisplayManager/RcsbD3BlockManager";
import {MovePinInterface, PlotPinInterface, RcsbD3PinManager} from "./RcsbD3DisplayManager/RcsbD3PinManager";

export interface SVGConfInterface  {
    elementId: string,
    domClass: string;
    svgClass: string;
    width: number;
    pointerEvents: string;
    contextMenu: () => void;
}

export interface MainGConfInterface  {
    masterClass: string;
    innerClass: string;
    dblClick: () =>void;
    mouseDown: () => void;
    mouseUp: () => void;
}

export interface PainConfInterface {
    paneClass: string;
    bgColor: string;
    elementId: string;
}

export interface TrackConfInterface {
    trackClass: string;
    rectClass: string;
    bgColor: string;
    height: number;
    width: number;
    pointerEvents: string;
}

export interface ZoomConfigInterface {
    zoomEventHandler:ZoomBehavior<ZoomedElementBaseType, any>;
    xScale: ScaleLinear<number,number>;
    scaleExtent: [number,number];
    zoomCallBack: () => void;

}

export interface HighlightRegionInterface {
    trackG: Selection<SVGGElement,any,null,undefined>;
    height: number;
    begin: number;
    end: number;
    xScale: ScaleLinear<number,number>;
    rectClass: string;
}

export class RcsbD3Manager {

    _dom: Selection<HTMLElement,any,null,undefined> = null;
    _svg: Selection<SVGSVGElement,any,null,undefined> = null;
    _svgG: Selection<SVGGElement,any,null,undefined> = null;
    _pane: Selection<SVGRectElement,any,null,undefined> = null;

    _width: number = null;

    buildSvgNode(config:SVGConfInterface): void{
        this._dom = select(document.getElementById(config.elementId));
        this._dom.classed(config.domClass, true)
            .style(RcsbD3Constants.WIDTH, config.width+"px" );

    	this._svg = this._dom.append<SVGSVGElement>(RcsbD3Constants.SVG)
    	    .attr(RcsbD3Constants.CLASS, config.svgClass)
    	    .attr(RcsbD3Constants.WIDTH, config.width)
    	    .attr(RcsbD3Constants.POINTER_EVENTS, config.pointerEvents)
            .on(RcsbD3Constants.CONTEXT_MENU,config.contextMenu);

    	this._width = config.width;
    }

    addMainG(config:MainGConfInterface): void{
        this._svgG = this._svg.append<SVGGElement>(RcsbD3Constants.G)
            .attr(RcsbD3Constants.CLASS, config.masterClass)
            .append("g")
    	    .attr(RcsbD3Constants.CLASS, config.innerClass)
            .on(RcsbD3Constants.DBL_CLICK,config.dblClick)
    	    .on(RcsbD3Constants.MOUSE_DOWN,config.mouseDown)
            .on(RcsbD3Constants.MOUSE_UP,config.mouseUp);
    }

    addPane(config:PainConfInterface): void{
        this._pane = this._svgG
    	    .append<SVGRectElement>(RcsbD3Constants.RECT)
    	    .attr(RcsbD3Constants.CLASS, config.paneClass)
    	    .attr(RcsbD3Constants.ID, config.elementId)
    	    .attr(RcsbD3Constants.WIDTH, this._width)
    	    .style(RcsbD3Constants.FILL, config.bgColor)
    }

    addTrack(config: TrackConfInterface): Selection<SVGGElement,any,null,undefined>{
        const trackG:Selection<SVGGElement,any,null,undefined> = this._svgG
    	    .append<SVGGElement>(RcsbD3Constants.G)
    	    .attr(RcsbD3Constants.CLASS, config.trackClass);

    	// Rect for the background color
    	trackG.append<SVGRectElement>(RcsbD3Constants.RECT)
    	    .attr(RcsbD3Constants.X, 0)
    	    .attr(RcsbD3Constants.Y, 0)
    	    .attr(RcsbD3Constants.WIDTH, config.width)
    	    .attr(RcsbD3Constants.HEIGHT, config.height)
            .attr(RcsbD3Constants.CLASS, config.rectClass)
    	    .style(RcsbD3Constants.FILL, config.bgColor)
    	    .style(RcsbD3Constants.POINTER_EVENTS, config.pointerEvents);

    	return trackG;
    }

    setBoardHeight(height: number): void {
        this._dom.style(RcsbD3Constants.HEIGHT, height+"px");
        this._svg.attr(RcsbD3Constants.HEIGHT, height);
        this._pane.attr(RcsbD3Constants.HEIGHT, height);
    }

    addZoom(config: ZoomConfigInterface): void{
        //TODO I DONT REALLY KNOW HOW xScale FITS IN d3 v5
        this._svgG.call(
            config.zoomEventHandler.scaleExtent(config.scaleExtent)
                .on(RcsbD3Constants.ZOOM, config.zoomCallBack)
        ).on(RcsbD3Constants.DBLCLIK_ZOOM, null);
    }

    highlightRegion(config: HighlightRegionInterface): void{
        config.trackG.append<SVGRectElement>(RcsbD3Constants.RECT)
            .attr(RcsbD3Constants.X, config.xScale(config.begin))
            .attr(RcsbD3Constants.Y, 0)
            .attr(RcsbD3Constants.WIDTH, config.xScale(config.end)-config.xScale(config.begin))
            .attr(RcsbD3Constants.HEIGHT, config.height)
            .attr(RcsbD3Constants.FILL, "#faf3c0")
            .attr(RcsbD3Constants.FILL_OPACITY,0.75)
            .attr(RcsbD3Constants.CLASS, config.rectClass);
    }

    plotBlockDisplay(config: PlotBlockInterface): void{
        const block: RcsbD3BlockManager = new RcsbD3BlockManager();
        return block.plotBlockDisplay(config);
    }

    moveBlockDisplay(config: MoveBlockInterface){
        const block: RcsbD3BlockManager = new RcsbD3BlockManager();
        return block.moveBlockDisplay(config);
    }

    plotPinDisplay(config: PlotPinInterface): void{
        const block: RcsbD3PinManager = new RcsbD3PinManager();
        return block.plotPinDisplay(config);
    }

    movePinDisplay(config: MovePinInterface): void{
        const block: RcsbD3PinManager = new RcsbD3PinManager();
        return block.movePinDisplay(config);
    }
}

