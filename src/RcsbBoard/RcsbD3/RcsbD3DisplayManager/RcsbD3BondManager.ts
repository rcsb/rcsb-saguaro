import {Selection, BaseType} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbD3DisplayManagerInterface} from "./RcsbD3DisplayManagerInterface"
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export interface PlotBondInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    radius: number;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    height: number;
    color?: string;addLine?: boolean;
}

export interface MoveBondInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    height: number;
    addLine?: boolean;
}

export class RcsbD3BondManager implements RcsbD3DisplayManagerInterface{

    plot(config: PlotBondInterface): void{
        const elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = config.elements;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const yScale: ScaleLinear<number,number> = config.yScale;
        const height: number = config.height;
        const color: string = config.color;
        const radius: number = config.radius;

        elements.append(RcsbD3Constants.LINE)
            .style(RcsbD3Constants.STROKE_WIDTH,2)
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
                return xScale(d.end);
            })
            .attr(RcsbD3Constants.Y2, (d: RcsbFvTrackDataElementInterface) => {
                return height - yScale(0.5);
            });

        elements.append(RcsbD3Constants.CIRCLE)
            .classed("bondBegin",true)
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

        elements.append(RcsbD3Constants.CIRCLE)
            .classed("bondEnd",true)
            .attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
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
        const pins: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = config.elements;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const yScale: ScaleLinear<number,number> = config.yScale;
        const height: number = config.height;

        pins.select(RcsbD3Constants.LINE)
            .attr(RcsbD3Constants.X1, (d: RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .attr(RcsbD3Constants.X2, (d: RcsbFvTrackDataElementInterface) => {
                return xScale(d.end);
            });

        pins.select(RcsbD3Constants.CIRCLE+".bondBegin")
            .attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                return height - yScale(0.5);
            });

        pins.select(RcsbD3Constants.CIRCLE+".bondEnd")
            .attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.end);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                return height - yScale(0.5);
            });
    }
}
