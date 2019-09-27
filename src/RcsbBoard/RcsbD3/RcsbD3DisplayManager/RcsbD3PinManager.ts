import {Selection, BaseType} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbD3DisplayManagerInterface} from "./RcsbD3DisplayManagerInterface"
import {RcsbFvDataElementInterface} from "../../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export interface PlotPinInterface {
    elements: Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined>;
    radius: number;
    labelShift: number;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    height: number;
    color?: string;
}

export interface MovePinInterface {
    elements: Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined>;
    labelShift: number;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    height: number;
}

export class RcsbD3PinManager implements RcsbD3DisplayManagerInterface{

    plot(config: PlotPinInterface): void{
        const elements: Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined> = config.elements;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const yScale: ScaleLinear<number,number> = config.yScale;
        const height: number = config.height;
        const color: string = config.color;
        const radius: number = config.radius;
        const labelShift: number = config.labelShift;
        elements.append(RcsbD3Constants.LINE)
            .attr(RcsbD3Constants.X1, (d:RcsbFvDataElementInterface) => {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.Y1, (d:RcsbFvDataElementInterface) => {
                return height;
            })
            .attr(RcsbD3Constants.X2, (d:RcsbFvDataElementInterface) => {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.Y2, (d:RcsbFvDataElementInterface) => {
                let y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return height - yScale(y);
            })
            .attr(RcsbD3Constants.STROKE, (d:RcsbFvDataElementInterface) => {
                if(typeof d.color === "string")
                    return d.color;
                return color;
            });

        elements.append(RcsbD3Constants.CIRCLE)
            .attr(RcsbD3Constants.CX, (d:RcsbFvDataElementInterface) => {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvDataElementInterface) => {
                let y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return height - yScale(y);
            })
            .attr(RcsbD3Constants.R, radius)
            .attr(RcsbD3Constants.FILL, (d:RcsbFvDataElementInterface) => {
                if(typeof d.color === "string")
                    return d.color;
                return color;
            });

        elements.append(RcsbD3Constants.TEXT)
            .attr(RcsbD3Constants.FONT_SIZE, 12)
            .attr(RcsbD3Constants.X, (d:RcsbFvDataElementInterface) => {
                return xScale(d.pos)+2.5*labelShift;
            })
            .attr(RcsbD3Constants.Y, (d:RcsbFvDataElementInterface) => {
                var y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return height - yScale(y) + 0.5*labelShift;
            })
            .style(RcsbD3Constants.TEXT_ANCHOR, "middle")
            .style(RcsbD3Constants.FILL, (d:RcsbFvDataElementInterface) => {
                if(typeof d.color === "string")
                    return d.color;
                return color;
            })
            .text((d:RcsbFvDataElementInterface) => {
                return d.label || "";
            });
    }

    move(config: MovePinInterface): void{
        const pins: Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined> = config.elements;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const yScale: ScaleLinear<number,number> = config.yScale;
        const height: number = config.height;
        const labelShift: number = config.labelShift;

        pins.select(RcsbD3Constants.LINE)
            .attr(RcsbD3Constants.X1, (d:RcsbFvDataElementInterface) => {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.Y1, (d:RcsbFvDataElementInterface) => {
                return height;
            })
            .attr(RcsbD3Constants.X2, (d:RcsbFvDataElementInterface) => {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.Y2, (d:RcsbFvDataElementInterface) => {
                var y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return height - yScale(y);
            });

        pins.select(RcsbD3Constants.CIRCLE)
            .attr(RcsbD3Constants.CX, (d:RcsbFvDataElementInterface) => {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvDataElementInterface) => {
                var y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return height - yScale(y);
            });

        pins.select(RcsbD3Constants.TEXT)
            .attr(RcsbD3Constants.X, (d:RcsbFvDataElementInterface) => {
                return xScale(d.pos)+2.5*labelShift;
            })
            .text((d:RcsbFvDataElementInterface) => {
                return d.label || "";
            });
    }
}
