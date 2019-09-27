import {Selection, BaseType} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbD3DisplayManagerInterface} from "./RcsbD3DisplayManagerInterface"

export interface PlotPinInterface {
    elements: Selection<SVGGElement,any,BaseType,undefined>;
    radius: number;
    labelShift: number;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    height: number;
    color?: string;
}

export interface MovePinInterface {
    elements: Selection<SVGGElement,any,BaseType,undefined>;
    labelShift: number;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    height: number;
}

export class RcsbD3PinManager implements RcsbD3DisplayManagerInterface{

    plot(config: PlotPinInterface): void{
        const elements: Selection<SVGGElement,any,BaseType,undefined> = config.elements;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const yScale: ScaleLinear<number,number> = config.yScale;
        const height: number = config.height;
        const color: string = config.color;
        const radius: number = config.radius;
        const labelShift: number = config.labelShift;
        elements.append(RcsbD3Constants.LINE)
            .attr(RcsbD3Constants.X1, function (d, i) {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.Y1, function (d) {
                return height;
            })
            .attr(RcsbD3Constants.X2, function (d,i) {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.Y2, function (d, i) {
                let y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return height - yScale(y);
            })
            .attr(RcsbD3Constants.STROKE, function (d) {
                return color;
            });

        elements.append(RcsbD3Constants.CIRCLE)
            .attr(RcsbD3Constants.CX, function (d, i) {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.CY, function (d, i) {
                let y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return height - yScale(y);
            })
            .attr(RcsbD3Constants.R, radius)
            .attr(RcsbD3Constants.FILL, function (d) {
                return color;
            });

        elements.append(RcsbD3Constants.TEXT)
            .attr(RcsbD3Constants.FONT_SIZE, 12)
            .attr(RcsbD3Constants.X, function (d, i) {
                return xScale(d.pos)+2.5*labelShift;
            })
            .attr(RcsbD3Constants.Y, function (d, i) {
                var y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return height - yScale(y) + 0.5*labelShift;
            })
            .style(RcsbD3Constants.TEXT_ANCHOR, "middle")
            .style(RcsbD3Constants.FILL, function (d) {
                return color;
            })
            .text(function (d) {
                return d.label || "";
            });
    }

    move(config: MovePinInterface): void{
        const pins: Selection<SVGGElement,any,BaseType,undefined> = config.elements;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const yScale: ScaleLinear<number,number> = config.yScale;
        const height: number = config.height;
        const labelShift: number = config.labelShift;

        pins.select(RcsbD3Constants.LINE)
            .attr(RcsbD3Constants.X1, function (d, i) {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.Y1, function (d) {
                return height;
            })
            .attr(RcsbD3Constants.X2, function (d,i) {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.Y2, function (d, i) {
                var y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return height - yScale(y);
            });

        pins.select(RcsbD3Constants.CIRCLE)
            .attr(RcsbD3Constants.CX, function (d, i) {
                return xScale(d.pos);
            })
            .attr(RcsbD3Constants.CY, function (d, i) {
                var y = 0.5;
                if(typeof d.val === "number") {
                    y = d.val;
                }
                return height - yScale(y);
            });

        pins.select(RcsbD3Constants.TEXT)
            .attr(RcsbD3Constants.X, function (d, i) {
                return xScale(d.pos)+2.5*labelShift;
            })
            .text(function (d) {
                return d.label || "";
            });
    }
}
