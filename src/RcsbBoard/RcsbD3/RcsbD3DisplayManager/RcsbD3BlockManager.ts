import {Selection, BaseType, select} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export interface PlotBlockInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    dx: number;
    dy: number;
    y_o: number;
    xScale: ScaleLinear<number,number>;
    height: number;
    color?: string;
}

export interface MoveBlockInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    dx: number;
    xScale: ScaleLinear<number,number>;
    height: number;
}

export class RcsbD3BlockManager {

    private static minWidth: number = 2;

    static plot(config: PlotBlockInterface): void{
        const gElements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = config.elements;
        const dy: number = config.dy;
        const dx: number = config.dx;
        const y_o: number = config.y_o;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const color: string = config.color ? config.color : "#CCCCCC";
        const height: number = config.height;

        const minWidth = (begin: number, end: number)=>{
            let w: number = (xScale(end+dx) - xScale(begin-dx));
            if(w<RcsbD3BlockManager.minWidth){
                w=RcsbD3BlockManager.minWidth;
            }
            return w;
        };

        const plotBlock = (g:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>, begin: number, end: number)=>{
            g.append(RcsbD3Constants.RECT)
                .attr(RcsbD3Constants.X, xScale(begin-dx))
                .attr(RcsbD3Constants.Y, y_o)
                .attr(RcsbD3Constants.WIDTH,  minWidth(begin,end))
                .attr(RcsbD3Constants.HEIGHT, dy)
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
        };

        const plotLine = (g:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>, begin: number, end: number)=>{
            g.append(RcsbD3Constants.LINE)
                .style(RcsbD3Constants.STROKE_WIDTH,2)
                .style(RcsbD3Constants.STROKE_DASH,4)
                .style(RcsbD3Constants.STROKE, (d:RcsbFvTrackDataElementInterface) => {
                    if (d.color === undefined) {
                        return color;
                    } else {
                        return d.color;
                    }
                })
                .attr(RcsbD3Constants.X1, (d: RcsbFvTrackDataElementInterface) => {
                    return xScale(begin+dx);
                })
                .attr(RcsbD3Constants.Y1, (d: RcsbFvTrackDataElementInterface) => {
                    return height*0.5;
                })
                .attr(RcsbD3Constants.X2, (d: RcsbFvTrackDataElementInterface) => {
                    return xScale(end-dx);
                })
                .attr(RcsbD3Constants.Y2, (d: RcsbFvTrackDataElementInterface) => {
                    return height*0.5;
                });
        };
        const plotFlag = (g:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>, pos:number, classFlag: string)=>{
            g.append(RcsbD3Constants.CIRCLE)
                .classed(classFlag,true)
                .attr(RcsbD3Constants.CX, xScale(pos))
                .attr(RcsbD3Constants.CY, 0.5*height)
                .transition()
                .duration(500)
                .attr(RcsbD3Constants.R, dy/4)
                .attr(RcsbD3Constants.FILL, "#ffffff")
                .attr(RcsbD3Constants.STROKE,(d:RcsbFvTrackDataElementInterface)=> {
                    if (d.color === undefined) {
                        return color;
                    } else {
                        return d.color;
                    }
                })
                .attr(RcsbD3Constants.STROKE_WIDTH, 2);
        };
        const plotOpen = (g:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>)=>{
            if(g.datum().openBegin){
                plotFlag(g,g.datum().begin-dx,"openBegin");
            }
            if(g.datum().openEnd){
                const end: number | undefined = g.datum().end;
                if(end!= undefined) plotFlag(g,end+dx, "openEnd");
            }
        };
        const plotCircle = (g:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>, pos:number)=>{
            g.append(RcsbD3Constants.CIRCLE)
                .attr(RcsbD3Constants.CX, xScale(pos+dx))
                .attr(RcsbD3Constants.CY, 0.5*height)
                .transition()
                .duration(500)
                .attr(RcsbD3Constants.R, dy/4)
                .attr(RcsbD3Constants.FILL, "#ffffff")
                .attr(RcsbD3Constants.STROKE,(d:RcsbFvTrackDataElementInterface)=> {
                    if (d.color === undefined) {
                        return color;
                    } else {
                        return d.color;
                    }
                })
                .attr(RcsbD3Constants.STROKE_WIDTH, 2);
        };

        gElements.each(function () {
            const g: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = select(this);
            const d:RcsbFvTrackDataElementInterface = g.datum();
            if(d.gaps!=null && d.gaps.length>0){
                let begin: number = d.begin;
                d.gaps.forEach(gap=>{
                    let end = gap.begin;
                    plotBlock(g,begin,end);
                    begin = gap.end;
                    if(end+1<begin)
                        plotLine(g,end,begin);
                    else if(end+1==begin)
                        plotCircle(g,end);
                    if(!gap.isConnected){
                        plotFlag(g,gap.begin+dx,"openGapBegin");
                        plotFlag(g,gap.end-dx,"openGapEnd");
                    }
                });
                if( d.end!= undefined ) plotBlock(g,begin,d.end);
            }else{
                if( d.end!= undefined ) plotBlock(g,d.begin,d.end);
            }
            if(d.openBegin || d.openEnd){
                plotOpen(g);
            }
            //g.selectAll<SVGCircleElement,RcsbFvTrackDataElementInterface>(RcsbD3Constants.CIRCLE).raise();
            g.selectAll<SVGCircleElement,RcsbFvTrackDataElementInterface>(RcsbD3Constants.CIRCLE).each(function(){
                if(this.parentNode != undefined) this.parentNode.append(this);
            });
        });
    }

    static move(config: MoveBlockInterface){
        var xScale = config.xScale;
        const dx = config.dx;
        const gElements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = config.elements;

        const minWidth = (begin: number, end: number)=>{
            let w: number = (xScale(end+dx) - xScale(begin-dx));
            if(w<RcsbD3BlockManager.minWidth){
                w=RcsbD3BlockManager.minWidth;
            }
            return w;
        };

        const moveBlock = (rect:Selection<SVGRectElement,RcsbFvTrackDataElementInterface,null,undefined>, begin:number, end:number)=>{
            rect.attr(RcsbD3Constants.X, xScale(begin-dx))
                .attr(RcsbD3Constants.WIDTH, minWidth(begin,end));
        };

        const moveLine = (line:Selection<SVGLineElement,RcsbFvTrackDataElementInterface,null,undefined>, begin:number, end:number)=>{
            line.attr(RcsbD3Constants.X1,xScale(begin+dx))
                .attr(RcsbD3Constants.X2,xScale(end-dx));

        };

        const moveOpen = (path: Selection<SVGCircleElement,RcsbFvTrackDataElementInterface,null,undefined>) => {
            path.attr(RcsbD3Constants.CX, (d:RcsbFvTrackDataElementInterface)=>{
                if(path.classed("openBegin")){
                    return xScale(d.begin-dx);
                }else if(path.classed("openEnd")){
                    if(d.end == undefined)
                        throw "Missing end property";
                    return xScale(d.end+dx);
                }else{
                    throw "Missing openBegin and openEnd properties";
                }
            });
        };

        const moveCircle = (circle: Selection<SVGCircleElement,RcsbFvTrackDataElementInterface,null,undefined>, pos: number) =>{
            circle.attr(RcsbD3Constants.CX, xScale(pos+dx));
        };

        gElements.each(function () {
            const g: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = select(this);
            const d:RcsbFvTrackDataElementInterface = g.datum();

            const rects: Selection<SVGRectElement,RcsbFvTrackDataElementInterface,SVGGElement,RcsbFvTrackDataElementInterface> = g.selectAll(RcsbD3Constants.RECT);
            const lines: Selection<SVGLineElement,RcsbFvTrackDataElementInterface,SVGGElement,RcsbFvTrackDataElementInterface> = g.selectAll(RcsbD3Constants.LINE);
            const openFlags: Selection<SVGCircleElement,RcsbFvTrackDataElementInterface,SVGGElement,RcsbFvTrackDataElementInterface> = g.selectAll<SVGCircleElement,RcsbFvTrackDataElementInterface>(RcsbD3Constants.CIRCLE).filter(
                function () {
                    return select(this).classed("openBegin") || select(this).classed("openEnd");
                }
            );
            const openGaps: Selection<SVGCircleElement,RcsbFvTrackDataElementInterface,SVGGElement,RcsbFvTrackDataElementInterface> = g.selectAll<SVGCircleElement,RcsbFvTrackDataElementInterface>(RcsbD3Constants.CIRCLE).filter(
                function () {
                    return select(this).classed("openGapBegin") || select(this).classed("openGapEnd");
                }
            );
            const circles: Selection<SVGCircleElement,RcsbFvTrackDataElementInterface,SVGGElement,RcsbFvTrackDataElementInterface> = g.selectAll<SVGCircleElement,RcsbFvTrackDataElementInterface>(RcsbD3Constants.CIRCLE).filter(
                function () {
                    return !(select(this).classed("openBegin") || select(this).classed("openEnd") || select(this).classed("openGapBegin") || select(this).classed("openGapEnd"));
                }
            );

            let i: number = 0;
            let j: number = 0;
            let k: number = 0;
            let begin: number = d.begin;
            let end = d.end;
            if(typeof d.gaps != "undefined" && d.gaps.length > 0){
                end = d.gaps[i].begin;
            }
            rects.each(function() {
                const rect: Selection<SVGRectElement, RcsbFvTrackDataElementInterface, null, undefined> = select(this);
                if (end != undefined){
                    moveBlock(rect, begin, end);
                    if (typeof d.gaps != "undefined" && i < d.gaps.length) {
                        begin = d.gaps[i].end;
                        if (end + 1 < begin) {
                            moveLine(select(lines.nodes()[i]), end, begin);
                        } else if (end + 1 == begin) {
                            moveCircle(select(circles.nodes()[j]), end);
                            j++;
                        }
                        if(!d.gaps[i].isConnected){
                            moveCircle(select(openGaps.nodes()[k]),d.gaps[i].begin)
                            k++;
                            moveCircle(select(openGaps.nodes()[k]),d.gaps[i].end-2*dx)
                            k++;
                        }
                    }
                    i++;
                    if (typeof d.gaps != "undefined" && i < d.gaps.length) {
                        end = d.gaps[i].begin;
                    } else {
                        end = d.end;
                    }
                }else{
                    console.warn("Missing rect end property");
                }
            });
            openFlags.each(function () {
                const path: Selection<SVGCircleElement,RcsbFvTrackDataElementInterface,null,undefined> = select(this);
                moveOpen(path)
            });
        });
    }

}
