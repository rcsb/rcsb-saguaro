import {Selection, BaseType} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export interface PlotSequenceInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    color?: string;
    height:number;
    intervalRatio: [number,number];
}

export interface PlotSequenceLineInterface {
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    g:Selection<SVGGElement,any,null,undefined>;
    height:number;
    color?: string;
}

export interface MoveSequenceInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    xScale: ScaleLinear<number,number>;
    intervalRatio: [number,number];
}

export class RcsbD3SequenceManager {

    static plot(config: PlotSequenceInterface){
        const xScale = config.xScale;
        const yScale = config.yScale;

        config.elements
            .append(RcsbD3Constants.TEXT)
            .attr(RcsbD3Constants.FONT_SIZE, "10")
            .attr(RcsbD3Constants.FONT_FAMILY,"Arial")
            .attr(RcsbD3Constants.X, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .attr(RcsbD3Constants.Y, yScale(Math.floor(config.height*0.5)+4))
            .style(RcsbD3Constants.TEXT_ANCHOR, "middle")
            .style(RcsbD3Constants.FILL, (d:RcsbFvTrackDataElementInterface) => {
                if (typeof d.color === "string"){
                    return d.color;
                } else {
                    return config.color;
                }
            })
            .text((d:RcsbFvTrackDataElementInterface) => {
                return d.label || "";
            })
            .call(RcsbD3SequenceManager.opacity, xScale, config.intervalRatio);

    }

    static plotSequenceLine(config: PlotSequenceLineInterface): void{
        config.g.select(RcsbD3Constants.LINE).remove();
        config.g.append(RcsbD3Constants.LINE)
            .style(RcsbD3Constants.STROKE_WIDTH,2)
            .style(RcsbD3Constants.STROKE, "#DDDDDD")
            .attr(RcsbD3Constants.STROKE_DASH,"2")
            .attr(RcsbD3Constants.X1, config.xScale.range()[0])
            .attr(RcsbD3Constants.Y1, config.yScale(config.height*0.5))
            .attr(RcsbD3Constants.X2, config.xScale.range()[1])
            .attr(RcsbD3Constants.Y2, config.yScale(config.height*0.5));
    }

    static move(config: MoveSequenceInterface){
        const xScale = config.xScale;
        config.elements.select(RcsbD3Constants.TEXT)
            .attr(RcsbD3Constants.X, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .text((d:RcsbFvTrackDataElementInterface) => {
                return d.label || "";
            })
            .call(RcsbD3SequenceManager.opacity, xScale, config.intervalRatio);
    }

    private static opacity (elems: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>, xScale: ScaleLinear<number,number>, intervalRatio: [number,number]): void {
        const r = (xScale.range()[1]-xScale.range()[0])/(xScale.domain()[1]-xScale.domain()[0]);
        const o_min = 0.2;
        const a = intervalRatio[0];
        const b = intervalRatio[1];
        if(r<a) {
            elems.remove();
        }else if(r>=a && r<b) {
            var o = (1-o_min)/(b-a)*(r-a)+o_min;
            elems.attr("fill-opacity",o);
        } else {
            elems.attr("fill-opacity", "1");
        }
    }
}