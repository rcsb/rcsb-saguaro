import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Selection, BaseType, mouse} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {
    MoveLineInterface,
    PlotLineInterface,
    RcsbD3LineManager
} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3LineManager";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {line, Line, curveStep, curveCardinal, curveBasis, curveLinear} from "d3-shape";
import {largestTriangleOneBucket} from "@d3fc/d3fc-sample";
import {InterpolationTypes} from "../../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";

export class RcsbLineDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface{

    private _yDomain: [number, number];
    protected yScale: ScaleLinear<number,number> = scaleLinear();
    private maxPoints: number = 1000;
    private tick: number;
    private innerData: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();

    definedScale: boolean = false;
    line:Line<RcsbFvTrackDataElementInterface> = line<RcsbFvTrackDataElementInterface>().curve(curveStep);
    linePoints: RcsbFvTrackDataElementInterface[];

    mousemoveCallBack: ()=>void = ()=>{
        const index: number = Math.round(this.xScale.invert(mouse(this.d3Manager.getPane())[0]));
        if(this.includeTooltip){
            if(this.innerData[index] !=null)
                this.tooltipManager.showTooltip(this.innerData[index]);
        }
    };

    mouseoutCallBack: ()=>void = ()=>{
        this.tooltipManager.hideTooltip();
    };

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
                .range([this._height-1,1]);
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
                return self.yScale(d.value as number);
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
        RcsbD3LineManager.plot(config);
    }

    move(): void{
        if(typeof window!== "undefined") {
            window.clearTimeout(this.tick);
            this.updateFunction();
            this.tick = window.setTimeout(() => {
                const config: MoveLineInterface = {
                    points: this.linePoints,
                    line: this.line,
                    trackG: this.g
                };
                RcsbD3LineManager.move(config);
            }, 300);
        }
    }

    downSampling(points: RcsbFvTrackDataElementInterface[]):RcsbFvTrackDataElementInterface[] {
        let out:RcsbFvTrackDataElementInterface[] = [];
        const tmp:RcsbFvTrackDataElementInterface[] = [];
        const thr = this.maxPoints;
        let title:string | undefined = points[0].title;
        if(points[0].name != null)title = points[0].name;
        for(let n = 1; n<this.xScale.domain()[1]; n++){
            tmp.push({begin:n,value:0,title:title});
        }
        points.forEach((p) => {
            if(p.begin>this.xScale.domain()[0] && p.begin<this.xScale.domain()[1]) {
                tmp[p.begin] = p;
            }
        });
        tmp.forEach((p)=> {
            if(p.begin>this.xScale.domain()[0] && p.begin<this.xScale.domain()[1]){
                out.push(p);
                this.innerData.push(p);
            }
        });
        if(out.length>thr){
            const bucketSize = out.length/thr ;
            const sampler = largestTriangleOneBucket();
            sampler.bucketSize(bucketSize);
            sampler.x((d:RcsbFvTrackDataElementInterface)=>{return d.begin});
            sampler.y((d:RcsbFvTrackDataElementInterface)=>{return d.value});
            out = sampler(out);
        }
        return out;
    }
}