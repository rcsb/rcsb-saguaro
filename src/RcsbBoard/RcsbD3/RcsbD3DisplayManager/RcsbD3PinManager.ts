import {Selection, BaseType} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export interface PlotPinInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    radius: number;
    labelShift: number;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    height: number;
    color?: string;addLine?: boolean;
}

export interface MovePinInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    labelShift: number;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    height: number;
    addLine?: boolean;
}

export class RcsbD3PinManager {

    static plot(config: PlotPinInterface): void{
        const elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = config.elements;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const yScale: ScaleLinear<number,number> = config.yScale;
        const height: number = config.height;
        const color: string = config.color;
        const radius: number = config.radius;
        const labelShift: number = config.labelShift;
        if(config.addLine) {
            elements.append(RcsbD3Constants.LINE)
                .attr(RcsbD3Constants.X1, (d: RcsbFvTrackDataElementInterface) => {
                    return xScale(d.begin);
                })
                .attr(RcsbD3Constants.Y1, (d: RcsbFvTrackDataElementInterface) => {
                    return height;
                })
                .attr(RcsbD3Constants.X2, (d: RcsbFvTrackDataElementInterface) => {
                    return xScale(d.begin);
                })
                .attr(RcsbD3Constants.Y2, (d: RcsbFvTrackDataElementInterface) => {
                    let y = 0.5;
                    if (typeof d.value === "number") {
                        y = d.value;
                    }
                    return height - yScale(y);
                });
        }


        elements.append(RcsbD3Constants.CIRCLE)
            .attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                let y = 0.5;
                if(typeof d.value === "number") {
                    y = d.value;
                }
                return height - yScale(y);
            })
            .transition()
            .duration(500)
            .attr(RcsbD3Constants.R, radius)
            .attr(RcsbD3Constants.FILL, (d:RcsbFvTrackDataElementInterface) => {
                if(typeof d.color === "string")
                    return d.color;
                return color;
            });

        elements.append(RcsbD3Constants.TEXT)
            .attr(RcsbD3Constants.FONT_SIZE, 12)
            .attr(RcsbD3Constants.X, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin)+2.5*labelShift;
            })
            .attr(RcsbD3Constants.Y, (d:RcsbFvTrackDataElementInterface) => {
                var y = 0.5;
                if(typeof d.value === "number") {
                    y = d.value;
                }
                return height - yScale(y) + 0.5*labelShift;
            })
            .style(RcsbD3Constants.TEXT_ANCHOR, "middle")
            .style(RcsbD3Constants.FILL, (d:RcsbFvTrackDataElementInterface) => {
                if(typeof d.color === "string")
                    return d.color;
                return color;
            })
            .text((d:RcsbFvTrackDataElementInterface) => {
                return d.label || "";
            });
    }

    static move(config: MovePinInterface): void{
        const pins: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = config.elements;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const yScale: ScaleLinear<number,number> = config.yScale;
        const height: number = config.height;
        const labelShift: number = config.labelShift;

        if(config.addLine) {
            pins.select(RcsbD3Constants.LINE)
                .attr(RcsbD3Constants.X1, (d: RcsbFvTrackDataElementInterface) => {
                    return xScale(d.begin);
                })
                .attr(RcsbD3Constants.Y1, (d: RcsbFvTrackDataElementInterface) => {
                    return height;
                })
                .attr(RcsbD3Constants.X2, (d: RcsbFvTrackDataElementInterface) => {
                    return xScale(d.begin);
                })
                .attr(RcsbD3Constants.Y2, (d: RcsbFvTrackDataElementInterface) => {
                    var y = 0.5;
                    if (typeof d.value === "number") {
                        y = d.value;
                    }
                    return height - yScale(y);
                });
        }

        pins.select(RcsbD3Constants.CIRCLE)
            .attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                var y = 0.5;
                if(typeof d.value === "number") {
                    y = d.value;
                }
                return height - yScale(y);
            });

        pins.select(RcsbD3Constants.TEXT)
            .attr(RcsbD3Constants.X, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin)+2.5*labelShift;
            })
            .text((d:RcsbFvTrackDataElementInterface) => {
                return d.label || "";
            });
    }
}
