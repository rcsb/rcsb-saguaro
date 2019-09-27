import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {BaseType, Selection} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {MoveVariantInterface, PlotVariantInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3VariantManager";
import {scalePoint, ScalePoint} from "d3-scale";

export class RcsbVariantDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface {

    aaList: Array<string> = ['G', 'A', 'V', 'L', 'I', 'S', 'T', 'C', 'M', 'D', 'N', 'E', 'Q', 'R', 'K', 'H', 'F', 'Y', 'W', 'P', '≡', '⊖'];
    yScale: ScalePoint<string> = scalePoint();
    radius: number = 5;
    definedScale: boolean = false;

    private setScale(): void{
        if(typeof this._height === "number") {
            this.yScale
                .domain(this.aaList)
                .range([2*this.radius,this._height - 2*this.radius]);
            this.definedScale = true;
        }else{
            throw "FATAL ERROR: d3 scale unknown format";
        }
    }

    plot(elements:Selection<SVGGElement,any,BaseType,undefined>): void{
        super.plot(elements);
        if(!this.definedScale)
            this.setScale();

        const config: PlotVariantInterface = {
            elements: elements,
            radius: this.radius,
            xScale: this.xScale,
            yScale: this.yScale,
            height: this._height,
            color: this._displayColor,
            trackG: this.g
        };
        this.d3Manager.plotVariantDisplay(config);
    }

    move(): void{
        const elements: Selection<SVGGElement,any,BaseType,undefined> = this.getElements();
        const config: MoveVariantInterface = {
            elements: elements,
            xScale: this.xScale,
            yScale: this.yScale,
            height: this._height,
            trackG: this.g
        };
        this.d3Manager.moveVariantDisplay(config);
    }
}