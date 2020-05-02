import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Selection, BaseType} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {MoveLineInterface, PlotLineInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3LineManager";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {line, Line, curveStep, curveCardinal, curveBasis, curveLinear} from "d3-shape";
import {modeMedian} from "@d3fc/d3fc-sample";
import {InterpolationTypes} from "../../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvTrackDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbLineDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface{

    private _yDomain: [number, number];
    private yScale: ScaleLinear<number,number> = scaleLinear();
    private maxPoints: number = 1000;
    private tick: number = null;

    definedScale: boolean = false;
    line:Line<RcsbFvTrackDataElementInterface> = line<RcsbFvTrackDataElementInterface>().curve(curveStep);
    linePoints: RcsbFvTrackDataElementInterface[];

    setInterpolationType(type: string): void{
        if(type === InterpolationTypes.CARDINAL)
            this.line = line<RcsbFvTrackDataElementInterface>().curve(curveCardinal);
        else if(type === InterpolationTypes.STEP)
            this.line = line<RcsbFvTrackDataElementInterface>().curve(curveStep);
        else if(type === InterpolationTypes.BASIS)
            this.line = line<RcsbFvTrackDataElementInterface>().curve(curveBasis);
        else if(type === InterpolationTypes.LINEAR)
            this.line = line<RcsbFvTrackDataElementInterface>().curve(curveLinear);
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
            .x((d:RcsbFvTrackDataElementInterface) => {
                return self.xScale(d.begin);
            })
            .y(function (d:RcsbFvTrackDataElementInterface) {
                return self._height - self.yScale(d.value as number);
            });
    }

    updateFunction(): void{
        const self: RcsbLineDisplay = this;
        this.line.x(function (d: RcsbFvTrackDataElementInterface) {
            return self.xScale(d.begin);
        });
    }

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void {
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
        window.clearTimeout(this.tick);
        this.updateFunction();
        this.tick = window.setTimeout(() => {
            const config: MoveLineInterface = {
                points: this.linePoints,
                line: this.line,
                trackG: this.g
            };
            this.d3Manager.moveLineDisplay(config);
        },300);
    }

    downSampling(points: RcsbFvTrackDataElementInterface[]):RcsbFvTrackDataElementInterface[] {
        const out:RcsbFvTrackDataElementInterface[] = [];
        const tmp:RcsbFvTrackDataElementInterface[] = [];
        const thr = this.maxPoints;
        const self: RcsbLineDisplay = this;
        for(let n = 0; n<self.xScale.domain()[1]; n++){
            tmp.push({begin:n,value:0});
        }
        points.forEach(function (p) {
            if(p.begin>self.xScale.domain()[0] && p.begin<self.xScale.domain()[1]) {
                tmp[p.begin] = p;
            }
        });
        tmp.forEach(function (p) {
            if(p.begin>self.xScale.domain()[0] && p.begin<self.xScale.domain()[1]){
                out.push(p);
            }
        });
        if(out.length>thr) {
            const bucketSize = Math.floor(points.length/thr)+1;
            const sampler = modeMedian();
            sampler.value((d:RcsbFvTrackDataElementInterface) => {return d.value});
            sampler.bucketSize(bucketSize);
            const all: RcsbFvTrackDataElementInterface[] = sampler(points);
            all.forEach(function (p) {
                if(p.begin>=self.xScale.domain()[0] && p.begin<=self.xScale.domain()[1]){
                    out.push(p);
                }
            });
        }
        return out;
    }
}