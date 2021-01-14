import {Selection, BaseType, select} from "d3-selection";
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
    xScale: ScaleLinear<number,number>;
    intervalRatio: [number,number];
}

export class RcsbD3SequenceManager {
    private textElements: Selection<SVGTextElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = select<SVGTextElement, RcsbFvTrackDataElementInterface>(RcsbD3Constants.EMPTY);

    plot(config: PlotSequenceInterface){
        const xScale = config.xScale;
        const yScale = config.yScale;

        this.textElements = config.elements.select(RcsbD3Constants.TEXT);
        this.textElements
            .attr(RcsbD3Constants.X, (d:RcsbFvTrackDataElementInterface) => {
                return xScale(d.begin) ?? 0;
            })
            .attr(RcsbD3Constants.Y, yScale(Math.floor(config.height*0.5)+4) ?? 0)
            .transition()
            .duration(500)
            .attr(RcsbD3Constants.FONT_SIZE, "10")
            .attr(RcsbD3Constants.FONT_FAMILY,"Arial")
            .attr(RcsbD3Constants.TEXT_ANCHOR, "middle")
            .attr(RcsbD3Constants.FILL, (d:RcsbFvTrackDataElementInterface) => {
                if (typeof d.color === "string"){
                    return d.color;
                } else if(typeof config.color === "string"){
                    return config.color;
                }else{
                    console.warn("Config color noy found");
                    return "#CCCCCC";
                }
            }).text((d:RcsbFvTrackDataElementInterface) => {
                return d.label || "";
            }).attr(RcsbD3Constants.FILL_OPACITY,()=>{
                return RcsbD3SequenceManager.opacity(xScale,config.intervalRatio)
            })

    }

    static plotSequenceLine(config: PlotSequenceLineInterface): void{
        config.g.select(RcsbD3Constants.LINE).remove();
        config.g.append(RcsbD3Constants.LINE)
            .style(RcsbD3Constants.STROKE_WIDTH,2)
            .style(RcsbD3Constants.STROKE, "#DDDDDD")
            .attr(RcsbD3Constants.STROKE_DASH,"2")
            .attr(RcsbD3Constants.X1, config.xScale.range()[0])
            .attr(RcsbD3Constants.Y1, config.yScale(config.height*0.5) ?? 0)
            .attr(RcsbD3Constants.X2, config.xScale.range()[1])
            .attr(RcsbD3Constants.Y2, config.yScale(config.height*0.5) ?? 0);
    }

    move(config: MoveSequenceInterface){
        setTimeout(()=>{
            const xScale = config.xScale;
            this.textElements
                .attr(RcsbD3Constants.X, (d:RcsbFvTrackDataElementInterface) => {
                    return xScale(d.begin) ?? 0;
                })
                .attr(RcsbD3Constants.FILL_OPACITY,()=>{
                    return RcsbD3SequenceManager.opacity(xScale,config.intervalRatio)
                });
        });
    }

    private static opacity (xScale: ScaleLinear<number,number>, intervalRatio: [number,number]): number {
        const r = (xScale.range()[1]-xScale.range()[0])/(xScale.domain()[1]-xScale.domain()[0]);
        const o_min = 0.2;
        const a = intervalRatio[0];
        const b = intervalRatio[1];
        if(r<b) {
            return (1-o_min)/(b-a)*(r-a)+o_min;

        } else {
            return 1;
        }
    }
}