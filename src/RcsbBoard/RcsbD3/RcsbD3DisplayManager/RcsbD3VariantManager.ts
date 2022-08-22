import {Selection, BaseType, select} from "d3-selection";
import {ScalePoint} from "d3-scale";
import {axisLeft, Axis} from "d3-axis";
import {RcsbD3Constants} from "../RcsbD3Constants";
import classes from "../../scss/RcsbBoard.module.scss";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";
import {RcsbScaleInterface} from "../RcsbD3ScaleFactory";

export interface PlotVariantInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    radius: number;
    xScale: RcsbScaleInterface;
    yScale: RcsbScaleInterface<string,ScalePoint<string>>;
    height: number;
    color?: string;
    trackG: Selection<SVGGElement,any,null,undefined>;
}

export interface MoveVariantInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    xScale: RcsbScaleInterface;
    yScale: RcsbScaleInterface<string,ScalePoint<string>>;
    height: number;
    trackG: Selection<SVGGElement,any,null,undefined>;
}

export class RcsbD3VariantManager {

    private circleElements: Selection<SVGCircleElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = select<SVGCircleElement, RcsbFvTrackDataElementInterface>(RcsbD3Constants.EMPTY);

    plot(config: PlotVariantInterface): void{
        this.circleElements = config.elements.append(RcsbD3Constants.CIRCLE);
        this.circleElements.attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                if(d.begin == undefined )
                    throw "Position element not found";
                return config.xScale(d.begin) ?? 0;
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                if(d.value == undefined)
                    throw "Variant value not found";
                const y: number | undefined = config.yScale((d.value as string));
                if(y == undefined)
                    throw "Variant value ("+d.value+") not available";
                return y;
            })
            .attr(RcsbD3Constants.R, config.radius)
            .attr(RcsbD3Constants.FILL, (d:RcsbFvTrackDataElementInterface) => {
                if(typeof d.color === "string"){
                    return d.color;
                }else if(typeof config.color === "string"){
                    return config.color;
                }else{
                    console.warn("Config color noy found");
                    return "#CCCCCC";
                }
            });
        RcsbD3VariantManager.includeAxis(config.trackG, config.xScale, config.yScale, config.height)
    }

    move(config: MoveVariantInterface): void{
        this.circleElements.attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface) => {
                if(d.begin == undefined )
                    throw "Position element not found";
                return config.xScale(d.begin) ?? 0;
            })
            .attr(RcsbD3Constants.CY, (d:RcsbFvTrackDataElementInterface) => {
                if(d.value == undefined)
                    throw "Variant value not found";
                const y: number | undefined = config.yScale((d.value as string));
                if(y == undefined)
                    throw "Variant value ("+d.value+") not available";
                return y;
            });
        RcsbD3VariantManager.includeAxis(config.trackG, config.xScale, config.yScale, config.height)
    }

    private static includeAxis (trackG: Selection<SVGGElement,any,BaseType,undefined>, xScale:RcsbScaleInterface, yScale:RcsbScaleInterface<string,ScalePoint<string>>, height: number){
        trackG.selectAll("."+classes.rcsbAxis).remove();
        trackG.selectAll("."+classes.rcsbVariantGrid).remove();
        trackG.append(RcsbD3Constants.G).classed(classes.rcsbVariantGrid, true);
        yScale.domain().forEach((aa:string) => {
            const aaY: number | undefined = yScale(aa);
            if(aaY != undefined)
                trackG.selectAll("."+classes.rcsbVariantGrid).append(RcsbD3Constants.LINE)
                    .attr(RcsbD3Constants.LINE,"stroke:#EEEEEE;")
                    .attr(RcsbD3Constants.X1, xScale.range()[0])
                    .attr(RcsbD3Constants.Y1, aaY)
                    .attr(RcsbD3Constants.X2, xScale.range()[1])
                    .attr(RcsbD3Constants.Y2, aaY)
            else
                console.warn("Variation ("+aa+") not found");
        });
        trackG.selectAll<SVGGElement,RcsbFvTrackDataElementInterface>("."+classes.rcsbElement).each(function(){
            if( this.parentNode != undefined)
                this.parentNode.append(this);
        });
        const variantAxis:Axis<string> = axisLeft(yScale.getScale());
        const gAxis: Selection<SVGGElement, any, BaseType, undefined> = trackG.append(RcsbD3Constants.G);
        gAxis.classed(classes.rcsbAxis,true)
            .attr(RcsbD3Constants.TRANSFORM, "translate(20,0)")
            .append(RcsbD3Constants.RECT)
            .attr(RcsbD3Constants.FILL,"white")
            .attr(RcsbD3Constants.X,-20)
            .attr(RcsbD3Constants.Y,0)
            .attr(RcsbD3Constants.HEIGHT, height)
            .attr(RcsbD3Constants.WIDTH,15);
        gAxis.call(variantAxis);
    }
}