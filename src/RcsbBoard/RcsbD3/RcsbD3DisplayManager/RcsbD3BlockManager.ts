import {Selection, BaseType, select} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export interface PlotBlockInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    dy: number;
    dx: number;
    y_o: number;
    xScale: ScaleLinear<number,number>;
    height: number;
    color: string;
}

export interface PlotCircleInterface {
    elements: Selection<SVGGElement,CircleDecoratorInterface,BaseType,undefined>;
    dy: number;
    dx: number;
    xScale: ScaleLinear<number,number>;
    height: number;
    color: string;
}

export interface PlotLineInterface {
    elements: Selection<SVGGElement,LineDecoratorInterface,BaseType,undefined>;
    dy: number;
    dx: number;
    y_o: number;
    xScale: ScaleLinear<number,number>;
    height: number;
    color: string;
}

export interface MoveBlockInterface {
    dx: number;
    xScale: ScaleLinear<number,number>;
    height: number;
}

export interface CircleDecoratorInterface {
    position: number;
    shift: 1|-1;
    color?: string;
}

export interface LineDecoratorInterface {
    begin: number;
    end: number;
    color?: string;
}

export class RcsbD3BlockManager {

    private static readonly minWidth: number = 2;

    private rectElements: Selection<SVGRectElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = select<SVGRectElement, RcsbFvTrackDataElementInterface>(RcsbD3Constants.EMPTY);
    private lineElements: Selection<SVGLineElement, LineDecoratorInterface, BaseType, undefined> = select<SVGLineElement, LineDecoratorInterface>(RcsbD3Constants.EMPTY);
    private circleElements: Selection<SVGCircleElement, CircleDecoratorInterface, BaseType, undefined> = select<SVGCircleElement, CircleDecoratorInterface>(RcsbD3Constants.EMPTY);

    plot(config: PlotBlockInterface): void{
        this.rectElements = config.elements.append<SVGRectElement>(RcsbD3Constants.RECT);
        this.rectElements.attr(RcsbD3Constants.X, (d: RcsbFvTrackDataElementInterface)=>{
                const begin: number = d.rectBegin ?? d.begin;
                return config.xScale(begin-config.dx)
            })
            .attr(RcsbD3Constants.Y, config.y_o)
            .attr(RcsbD3Constants.WIDTH,  (d: RcsbFvTrackDataElementInterface)=>{
                if(d.end != null) {
                    const begin: number = d.rectBegin ?? d.begin;
                    const end: number = d.rectEnd ?? d.end;
                    return RcsbD3BlockManager.getMinWidth(begin, end, config.xScale, config.dx);
                }
                else
                    return RcsbD3BlockManager.minWidth;
            })
            .attr(RcsbD3Constants.HEIGHT, config.dy)
            .transition()
            .duration(500)
            .attr(RcsbD3Constants.FILL, (d:RcsbFvTrackDataElementInterface)=> {
                if (d.color === undefined) {
                    return config.color;
                } else {
                    return d.color;
                }
            })
            .attr(RcsbD3Constants.FILL_OPACITY,0.5)
            .attr(RcsbD3Constants.STROKE, (d:RcsbFvTrackDataElementInterface) => {
                if (d.color === undefined) {
                    return config.color;
                } else {
                    return d.color;
                }
            })
            .attr(RcsbD3Constants.STROKE_OPACITY,1)
            .attr(RcsbD3Constants.STROKE_WIDTH,2);
    }

    plotDecorators(circles: PlotCircleInterface, lines:PlotLineInterface): void {
        this.plotLine(lines);
        this.plotCircles(circles);
    }

    move(config: MoveBlockInterface){
        this.moveBlock(config.xScale,config.dx);
        this.moveLine(config.xScale,config.dx);
        this.moveCircle(config.xScale,config.dx);
    }

    private static getMinWidth(begin: number, end: number, xScale: ScaleLinear<number,number>, dx: number): number{
        let w: number = (xScale(end+dx) - xScale(begin-dx));
        if(w<this.minWidth){
            w=this.minWidth;
        }
        return w;
    }

    private plotCircles (config:PlotCircleInterface): void{
        this.circleElements = config.elements.append<SVGCircleElement>(RcsbD3Constants.CIRCLE);
        this.circleElements.attr(RcsbD3Constants.CX, (d: CircleDecoratorInterface)=>{
                return config.xScale(d.position+d.shift*config.dx)
            })
            .attr(RcsbD3Constants.CY, 0.5*config.height)
            .transition()
            .duration(500)
            .attr(RcsbD3Constants.R, config.dy/4)
            .attr(RcsbD3Constants.FILL, "#ffffff")
            .attr(RcsbD3Constants.STROKE,(d:CircleDecoratorInterface)=> {
                if (d.color === undefined) {
                    return config.color;
                } else {
                    return d.color;
                }
            })
            .attr(RcsbD3Constants.STROKE_WIDTH, 2);
    }

    private plotLine(config:PlotLineInterface): void{
        this.lineElements = config.elements.append<SVGLineElement>(RcsbD3Constants.LINE);
        this.lineElements.style(RcsbD3Constants.STROKE_WIDTH,2)
            .style(RcsbD3Constants.STROKE_DASH,4)
            .style(RcsbD3Constants.STROKE, (d:LineDecoratorInterface) => {
                if (d.color === undefined) {
                    return config.color;
                } else {
                    return d.color;
                }
            })
            .attr(RcsbD3Constants.X1, (d: LineDecoratorInterface) => {
                return config.xScale(d.begin+config.dx);
            })
            .attr(RcsbD3Constants.Y1, (d: LineDecoratorInterface) => {
                return config.height*0.5;
            })
            .attr(RcsbD3Constants.X2, (d: LineDecoratorInterface) => {
                return config.xScale(d.end-config.dx);
            })
            .attr(RcsbD3Constants.Y2, (d: LineDecoratorInterface) => {
                return config.height*0.5;
            });
    }

    private moveBlock(xScale: ScaleLinear<number,number>, dx: number): void{
        this.rectElements.attr(RcsbD3Constants.X, (d: RcsbFvTrackDataElementInterface)=>{
                const begin: number = d.rectBegin ?? d.begin;
                return xScale(begin-dx)
            })
            .attr(RcsbD3Constants.WIDTH,  (d: RcsbFvTrackDataElementInterface)=>{
                if(d.end != null) {
                    const begin: number = d.rectBegin ?? d.begin;
                    const end: number = d.rectEnd ?? d.end;
                    return RcsbD3BlockManager.getMinWidth(begin, end, xScale, dx);
                }else {
                    return RcsbD3BlockManager.minWidth;
                }
            })
    }

    private moveLine(xScale: ScaleLinear<number,number>, dx: number ): void{
        this.lineElements.attr(RcsbD3Constants.X1,(d: LineDecoratorInterface) => {
                return xScale(d.begin+dx);
            })
            .attr(RcsbD3Constants.X2,(d: LineDecoratorInterface) => {
                return xScale(d.end-dx);
            });

    };

    private moveCircle(xScale: ScaleLinear<number,number>, dx: number): void{
        this.circleElements.attr(RcsbD3Constants.CX, (d: CircleDecoratorInterface)=>{
                return xScale(d.position+d.shift*dx)
            });
    }

}
