import {Selection, BaseType} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbD3DisplayManagerInterface} from "./RcsbD3DisplayManagerInterface"
import {RcsbFvTrackDataElementInterface} from "../../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export interface PlotBlockInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    dx: number;
    dy: number;
    y_o: number;
    xScale: ScaleLinear<number,number>;
    color?: string;
}

export interface MoveBlockInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    dx: number;
    xScale: ScaleLinear<number,number>;
}

export class RcsbD3BlockManager implements RcsbD3DisplayManagerInterface{

    plot(config: PlotBlockInterface): void{
        const elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = config.elements;
        const dy: number = config.dy;
        const dx: number = config.dx;
        const y_o: number = config.y_o;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const color: string = config.color;
        elements.append(RcsbD3Constants.RECT)
            .attr(RcsbD3Constants.X, (d, i) => {
                return xScale(d.begin-dx);
            })
            .attr(RcsbD3Constants.Y, y_o)
            .attr(RcsbD3Constants.WIDTH, (d:RcsbFvTrackDataElementInterface) => {
                return (xScale(d.end+dx) - xScale(d.begin-dx));
            })
            .attr(RcsbD3Constants.HEIGHT, dy)
            .attr(RcsbD3Constants.FILL, color)
            .transition()
            .duration(500)
            .attr(RcsbD3Constants.FILL, (d:RcsbFvTrackDataElementInterface)=> {
                if (d.color === undefined) {
                    return color;
                } else {
                    return d.color;
                }
            })
            .attr(RcsbD3Constants.FILL_OPACITY,0.5)
            .attr(RcsbD3Constants.STROKE, (d:RcsbFvTrackDataElementInterface) => {
                if (d.color === undefined) {
                    return color;
                } else {
                    return d.color;
                }
            })
            .attr(RcsbD3Constants.STROKE_OPACITY,1)
            .attr(RcsbD3Constants.STROKE_WIDTH,2);
    }

    move(config: MoveBlockInterface){
        var xScale = config.xScale;
        const dx = config.dx;
        const blocks: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = config.elements;
        blocks.select(RcsbD3Constants.RECT)
            .attr(RcsbD3Constants.X, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin-dx);
            })
            .attr(RcsbD3Constants.WIDTH, (d:RcsbFvTrackDataElementInterface) => {
                return (xScale(d.end+dx) - xScale(d.begin-dx));
            });
    }

}
