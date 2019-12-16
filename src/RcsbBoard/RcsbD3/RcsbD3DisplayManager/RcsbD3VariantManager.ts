import {Selection, BaseType} from "d3-selection";
import {ScaleLinear, ScalePoint} from "d3-scale";
import {axisLeft, Axis} from "d3-axis";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbD3DisplayManagerInterface} from "./RcsbD3DisplayManagerInterface"
import * as classes from "../../scss/RcsbBoard.module.scss";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export interface PlotVariantInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    radius: number;
    xScale: ScaleLinear<number,number>;
    yScale: ScalePoint<string>;
    height: number;
    color?: string;
    trackG: Selection<SVGGElement,any,null,undefined>;
}

export interface MoveVariantInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    xScale: ScaleLinear<number,number>;
    yScale: ScalePoint<string>;
    height: number;
    trackG: Selection<SVGGElement,any,null,undefined>;
}

export class RcsbD3VariantManager implements RcsbD3DisplayManagerInterface{

    plot(config: PlotVariantInterface): void{
        config.elements.append(RcsbD3Constants.CIRCLE)
            .attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                return config.xScale(d.begin);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                return config.yScale(d.val as string);
            })
            .attr(RcsbD3Constants.R, config.radius)
            .attr(RcsbD3Constants.FILL, (d:RcsbFvTrackDataElementInterface) => {
                if(typeof d.color === "string"){
                    return d.color;
                }
                return config.color;
            });
        this.includeAxis(config.trackG, config.xScale, config.yScale, config.height)
    }

    move(config: MoveVariantInterface): void{
        config.elements.select(RcsbD3Constants.CIRCLE)
            .attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                return config.xScale(d.begin);
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                return config.yScale(d.val as string);
            });
        this.includeAxis(config.trackG, config.xScale, config.yScale, config.height)
    }

    private includeAxis (trackG: Selection<SVGGElement,any,BaseType,undefined>, xScale:ScaleLinear<number,number>, yScale:ScalePoint<string>, height: number){
        trackG.selectAll("."+classes.rcsbAxis).remove();
        trackG.selectAll("."+classes.rcsbVariantGrid).remove();
        trackG.append(RcsbD3Constants.G).classed(classes.rcsbVariantGrid, true);
        yScale.domain().forEach((aa:string) => {
            trackG.selectAll("."+classes.rcsbVariantGrid).append(RcsbD3Constants.LINE)
                .attr(RcsbD3Constants.LINE,"stroke:#EEEEEE;")
                .attr(RcsbD3Constants.X1, xScale.range()[0])
                .attr(RcsbD3Constants.Y1, yScale(aa))
                .attr(RcsbD3Constants.X2, xScale.range()[1])
                .attr(RcsbD3Constants.Y2, yScale(aa))
        });
        trackG.selectAll<SVGGElement,RcsbFvTrackDataElementInterface>("."+classes.rcsbElement).each(function(){
            this.parentNode.append(this);
        });

        const variantAxis:Axis<string> = axisLeft(yScale);
        trackG.append(RcsbD3Constants.G).classed(classes.rcsbAxis,true)
            .attr(RcsbD3Constants.TRANSFORM, "translate(20,0)")
            .append(RcsbD3Constants.RECT)
            .attr(RcsbD3Constants.FILL,"white")
            .attr(RcsbD3Constants.X,-20)
            .attr(RcsbD3Constants.Y,0)
            .attr(RcsbD3Constants.HEIGHT, height)
            .attr(RcsbD3Constants.WIDTH,15);

        trackG.selectAll("."+classes.rcsbAxis).call(variantAxis);
    }
}