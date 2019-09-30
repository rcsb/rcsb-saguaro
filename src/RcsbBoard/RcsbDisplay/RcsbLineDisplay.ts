import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Selection, BaseType} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {MoveLineInterface, PlotLineInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3LineManager";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {line, Line, curveStep, curveCardinal, curveBasis, curveLinear} from "d3-shape";
import {modeMedian} from "@d3fc/d3fc-sample";
import {INTERPOLATION_TYPES} from "../../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbLineDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface{

    _yDomain: [number, number];
    yScale: ScaleLinear<number,number> = scaleLinear();
    definedScale: boolean = false;
    line:Line<RcsbFvDataElementInterface> = line<RcsbFvDataElementInterface>().curve(curveStep);
    maxPoints: number = 1000;
    linePoints: RcsbFvDataElementInterface[];

    setInterpolationType(type: string): void{
        if(type === INTERPOLATION_TYPES.CARDINAL)
            this.line = line<RcsbFvDataElementInterface>().curve(curveCardinal);
        else if(type === INTERPOLATION_TYPES.STEP)
            this.line = line<RcsbFvDataElementInterface>().curve(curveStep);
        else if(type === INTERPOLATION_TYPES.BASIS)
            this.line = line<RcsbFvDataElementInterface>().curve(curveBasis);
        else if(type === INTERPOLATION_TYPES.LINEAR)
            this.line = line<RcsbFvDataElementInterface>().curve(curveLinear);
    }

    yDomain(domain: [number,number]):void {
        this._yDomain = domain;
    }

    setScale(): void{
        if(typeof this._height === "number" && this._yDomain.length == 2 && typeof this._yDomain[0] === "number" && typeof this._yDomain[1] === "number") {
            this.yScale
                .domain(this._yDomain)
                .range([0, 0.95*this._height]);
            this.setFunction();
            this.definedScale = true;
        }else{
            throw "FATAL ERROR: d3 scale unknown format";
        }
    }

    private setFunction(): void{
        const self: RcsbLineDisplay = this;
        this.line
            .x((d:RcsbFvDataElementInterface) => {
                return self.xScale(d.pos);
            })
            .y(function (d:RcsbFvDataElementInterface) {
                return self._height - self.yScale(d.val as number);
            });
    }

    updateFunction(): void{
        const self: RcsbLineDisplay = this;
        this.line.x(function (d: RcsbFvDataElementInterface) {
            return self.xScale(d.pos);
        });
    }

    plot(elements:Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined>): void {
        if(!this.definedScale)
            this.setScale();
        this.linePoints = this.downSampling(elements.data());
        elements.remove();
        const config: PlotLineInterface = {
            points: this.linePoints,
            line: this.line,
            color: this._displayColor,
            trackG: this.g
        };
        this.d3Manager.plotLineDisplay(config);
    }

    move(): void{
       this.updateFunction();
       const config: MoveLineInterface  = {
           points: this.linePoints,
           line: this.line,
           trackG: this.g
       };
       this.d3Manager.moveLineDisplay(config);
    }

    downSampling(points: RcsbFvDataElementInterface[]):RcsbFvDataElementInterface[] {
        const out:RcsbFvDataElementInterface[] = [];
        const thr = this.maxPoints;
        const self: RcsbLineDisplay = this;
        points.forEach(function (p) {
            if(p.pos>self.xScale.domain()[0] && p.pos<self.xScale.domain()[1]){
                out.push(p);
            }
        });
        if(out.length>thr) {
            const bucketSize = Math.floor(points.length/thr)+1;
            const sampler = modeMedian();
            sampler.value((d:RcsbFvDataElementInterface) => {return d.val});
            sampler.bucketSize(bucketSize);
            const all: RcsbFvDataElementInterface[] = sampler(points);
            all.forEach(function (p) {
                if(p.pos>=self.xScale.domain()[0] && p.pos<=self.xScale.domain()[1]){
                    out.push(p);
                }
            });
        }
        return out;
    }
}