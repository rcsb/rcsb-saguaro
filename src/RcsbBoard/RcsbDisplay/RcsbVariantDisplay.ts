import {RcsbAbstractDisplay} from "./RcsbAbstractDisplay";
import {BaseType, Selection} from "d3-selection";
import {
    MoveVariantInterface,
    PlotVariantInterface,
    RcsbD3VariantManager
} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3VariantManager";
import {ScalePoint} from "d3-scale";
import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbScaleFactory, RcsbScaleInterface} from "../RcsbScaleFactory";

export class RcsbVariantDisplay extends RcsbAbstractDisplay {

    private aaList: Array<string> = ['G', 'A', 'V', 'L', 'I', 'S', 'T', 'C', 'M', 'D', 'N', 'E', 'Q', 'R', 'K', 'H', 'F', 'Y', 'W', 'P', '≡', '⊖'];
    private yScale: RcsbScaleInterface<string,ScalePoint<string>> = RcsbScaleFactory.getPointScale();
    private radius: number = 5;
    private definedScale: boolean = false;

    private rcsbD3VariantManager = new RcsbD3VariantManager();

    private setScale(): void{
        if(typeof this.height() === "number") {
            this.yScale
                .domain(this.aaList)
                .range([2*this.radius,this.height() - 2*this.radius]);
            this.definedScale = true;
        }else{
            throw "FATAL ERROR: d3 scale unknown format";
        }
    }

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void{
        super.plot(elements);
        if(!this.definedScale)
            this.setScale();

        const config: PlotVariantInterface = {
            elements: elements,
            radius: this.radius,
            xScale: this.xScale,
            yScale: this.yScale,
            height: this.height(),
            color: this._displayColor as string,
            trackG: this.g
        };
        this.rcsbD3VariantManager.plot(config);
    }

    move(): void{
        const config: MoveVariantInterface = {
            elements: this.getElements(),
            xScale: this.xScale,
            yScale: this.yScale,
            height: this.height(),
            trackG: this.g
        };
        this.rcsbD3VariantManager.move(config);
    }
}