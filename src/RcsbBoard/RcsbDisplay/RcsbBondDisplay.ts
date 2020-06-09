import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {BaseType, Selection} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {MoveBondInterface, PlotBondInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3BondManager";
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
            d.isEmpty = true;
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
            color: this._displayColor
        };
        this.d3Manager.plotBondDisplay(config);
    }

    move(): void{
        const pins: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = this.getElements();
        const config: MoveBondInterface = {
            elements: pins,
            xScale: this.xScale,
            yScale: this.yScale,
            height: this._height,
        };
        this.d3Manager.moveBondDisplay(config);
    }
}