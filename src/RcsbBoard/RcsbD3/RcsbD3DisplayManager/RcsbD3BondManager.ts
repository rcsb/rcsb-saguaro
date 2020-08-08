import {Selection, BaseType, select} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";
import {LineDecoratorInterface} from "./RcsbD3BlockManager";

export interface PlotBondInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    radius: number;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    height: number;
    color?: string;addLine?: boolean;
}

export interface MoveBondInterface {
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    height: number;
    addLine?: boolean;
}

export class RcsbD3BondManager {

    private beginCircleElements: Selection<SVGCircleElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = select<SVGCircleElement, RcsbFvTrackDataElementInterface>(RcsbD3Constants.EMPTY);
    private endCircleElements: Selection<SVGCircleElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = select<SVGCircleElement, RcsbFvTrackDataElementInterface>(RcsbD3Constants.EMPTY);
    private lineElements: Selection<SVGLineElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = select<SVGLineElement, RcsbFvTrackDataElementInterface>(RcsbD3Constants.EMPTY);

    plot(config: PlotBondInterface): void{
        const elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = config.elements;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const yScale: ScaleLinear<number,number> = config.yScale;
        const height: number = config.height;
        const color: string = config.color != undefined ? config.color : "#CCCCCC";
        const radius: number = config.radius;

        this.lineElements = elements.append(RcsbD3Constants.LINE);
        this.lineElements.style(RcsbD3Constants.STROKE_WIDTH,2)
            .style(RcsbD3Constants.STROKE, (d:RcsbFvTrackDataElementInterface) => {
                if (d.color === undefined) {
                    return color;
                } else {
                    return d.color;
                }
            })
            .attr(RcsbD3Constants.X1, (d: RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .attr(RcsbD3Constants.Y1, (d: RcsbFvTrackDataElementInterface) => {
                return height - yScale(0.5);
            })
            .attr(RcsbD3Constants.X2, (d: RcsbFvTrackDataElementInterface) => {
                if(d.end == undefined)
                    throw "Element end position not found";
                return xScale(d.end);
            })
            .attr(RcsbD3Constants.Y2, (d: RcsbFvTrackDataElementInterface) => {
                return height - yScale(0.5);
            });

        this.beginCircleElements = elements.append(RcsbD3Constants.CIRCLE);
        this.beginCircleElements.classed("bondBegin",true)
            .attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                return height - yScale(0.5);
            })
            .transition()
            .duration(500)
            .attr(RcsbD3Constants.R, radius)
            .attr(RcsbD3Constants.FILL, (d:RcsbFvTrackDataElementInterface) => {
                if(typeof d.color === "string")
                    return d.color;
                return color;
            });

        this.endCircleElements = elements.append(RcsbD3Constants.CIRCLE);
        this.endCircleElements.classed("bondEnd",true)
            .attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                if(d.end == undefined)
                    throw "Element end position not found";
                return xScale(d.end);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                return height - yScale(0.5);
            })
            .transition()
            .duration(500)
            .attr(RcsbD3Constants.R, radius)
            .attr(RcsbD3Constants.FILL, (d:RcsbFvTrackDataElementInterface) => {
                if(typeof d.color === "string")
                    return d.color;
                return color;
            });
    }

    move(config: MoveBondInterface): void{
        const xScale: ScaleLinear<number,number> = config.xScale;
        const yScale: ScaleLinear<number,number> = config.yScale;
        const height: number = config.height;

        this.lineElements.attr(RcsbD3Constants.X1, (d: RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .attr(RcsbD3Constants.X2, (d: RcsbFvTrackDataElementInterface) => {
                if(d.end == undefined)
                    throw "Missing bond end property";
                return xScale(d.end);
            });

        this.beginCircleElements.attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                return height - yScale(0.5);
            });

        this.endCircleElements.attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                if(d.end == undefined)
                    throw "Missing bond end property";
                return xScale(d.end);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                return height - yScale(0.5);
            });
    }
}
