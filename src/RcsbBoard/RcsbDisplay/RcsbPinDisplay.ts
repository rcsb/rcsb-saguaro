import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {BaseType, Selection} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {MovePinInterface, PlotPinInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3PinManager";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";

export class RcsbPinDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface {

    private yScale: ScaleLinear<number,number> = scaleLinear();
    private radius: number = 5;
    private labelShift: number = 10;
    private _yDomain: [number, number];
    private definedScale: boolean = false;

    yDomain(domain: [number,number]):void {
        this._yDomain = domain;
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

        const config: PlotPinInterface = {
            elements: elements,
            radius: this.radius,
            labelShift: this.labelShift,
            xScale: this.xScale,
            yScale: this.yScale,
            height: this._height,
            color: this._displayColor
        };
        this.d3Manager.plotPinDisplay(config);
    }

    move(): void{
        const pins: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = this.getElements();
        const config: MovePinInterface = {
            elements: pins,
            xScale: this.xScale,
            labelShift: this.labelShift,
            yScale: this.yScale,
            height: this._height,
        };
        this.d3Manager.movePinDisplay(config);
    }
}