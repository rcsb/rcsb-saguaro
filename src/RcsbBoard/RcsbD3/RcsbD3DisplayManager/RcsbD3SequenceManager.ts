import {Selection, BaseType} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbD3DisplayManagerInterface} from "./RcsbD3DisplayManagerInterface"
import {RcsbFvTrackDataElementInterface} from "../../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export interface PlotSequenceInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    xScale: ScaleLinear<number,number>;
    yScale: ScaleLinear<number,number>;
    color?: string;
    height:number;
    intervalRatio: [number,number];
    hideFlag: boolean;
}

export interface MoveSequenceInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    xScale: ScaleLinear<number,number>;
    intervalRatio: [number,number];
    hideFlag: boolean;
}

export class RcsbD3SequenceManager implements RcsbD3DisplayManagerInterface{

    plot(config: PlotSequenceInterface){
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
        if(config.hideFlag == true){
            config.elements.style("display","none");
        }
    }

    move(config: MoveSequenceInterface){
        const xScale = config.xScale;

        config.elements.select(RcsbD3Constants.TEXT)
            .attr(RcsbD3Constants.X, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin);
            })
            .text((d:RcsbFvTrackDataElementInterface) => {
                return d.label || "";
            })
            .call(RcsbD3SequenceManager.opacity, xScale, config.intervalRatio);
        if(config.hideFlag == true){
            config.elements.style("display","none");
        }
    }

    private static opacity (elems: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>, xScale: ScaleLinear<number,number>, intervalRatio: [number,number]): void {
        const r = (xScale.range()[1]-xScale.range()[0])/(xScale.domain()[1]-xScale.domain()[0]);
        const o_min = 0.01;
        const a = intervalRatio[0];
        const b = intervalRatio[1];
        if(r<a) {
            elems.attr("display", "none");
        }else if(r>=a && r<b) {
            elems.attr("display", "");
            var o = (1-o_min)/(b-a)*(r-a)+o_min;
            elems.attr("fill-opacity",o);
        } else {
            elems.attr("display", "");
            elems.attr("fill-opacity", "1");
        }
    }
}