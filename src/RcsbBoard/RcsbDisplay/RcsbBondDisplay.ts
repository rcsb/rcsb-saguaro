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

export class RcsbBondDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface {

    private yScale: ScaleLinear<number,number> = scaleLinear();
    private radius: number = 5;
    private _yDomain: [number, number] = [0,1];
    private definedScale: boolean = false;

    constructor(boardId: string) {
        super(boardId);
        this.elementClickCallBack = (d?:RcsbFvTrackDataElementInterface) => {
            if(d!=undefined)d.isEmpty = true;
        };
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
        RcsbD3BondManager.plot(config);
    }

    move(): void{
        const pins: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = this.getElements();
        const config: MoveBondInterface = {
            elements: pins,
            xScale: this.xScale,
            yScale: this.yScale,
            height: this._height,
        };
        RcsbD3BondManager.move(config);
    }
}