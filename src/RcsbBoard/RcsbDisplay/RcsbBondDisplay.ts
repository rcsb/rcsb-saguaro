import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {BaseType, Selection} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {
    MoveBondInterface,
    PlotBondInterface,
    RcsbD3BondManager
} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3BondManager";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";

export class RcsbBondDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface {

    private yScale: ScaleLinear<number,number> = scaleLinear();
    private radius: number = 5;
    private _yDomain: [number, number] = [0,1];
    private definedScale: boolean = false;

    private rcsbD3BondManager: RcsbD3BondManager = new RcsbD3BondManager();

    constructor(boardId: string, trackId: string) {
        super(boardId, trackId);
    }

    private setScale(): void{
        if(typeof this._height === "number" && this._yDomain.length == 2 && typeof this._yDomain[0] === "number" && typeof this._yDomain[1] === "number") {
            this.yScale
                .domain(this._yDomain)
                .range([this.radius, this._height - this.radius]);
            this.definedScale = true;
        }else{
            throw "FATAL ERROR: d3 scale unknown format";
        }
    }

    enter(e: Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined>): void{
        e.append<SVGLineElement>(RcsbD3Constants.LINE);
        e.append<SVGCircleElement>(RcsbD3Constants.CIRCLE).classed(RcsbD3Constants.BOND_BEGIN,true);
        e.append<SVGCircleElement>(RcsbD3Constants.CIRCLE).classed(RcsbD3Constants.BOND_END,true);
    }

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void{
        super.plot(elements);
        if(!this.definedScale)
            this.setScale();

        const config: PlotBondInterface = {
            elements: elements,
            radius: this.radius,
            xScale: this.xScale,
            yScale: this.yScale,
            height: this._height,
            color: this._displayColor as string
        };
        this.rcsbD3BondManager.plot(config);
    }

    move(): void{
        const config: MoveBondInterface = {
            xScale: this.xScale,
            yScale: this.yScale,
            height: this._height,
        };
        this.rcsbD3BondManager.move(config);
    }
}