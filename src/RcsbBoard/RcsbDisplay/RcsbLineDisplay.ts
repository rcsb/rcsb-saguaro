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
    protected maxPoints: number = 1000;
    protected innerData: Array<RcsbFvTrackDataElementInterface|null> = new Array<RcsbFvTrackDataElementInterface|null>();

    definedScale: boolean = false;
    private line:Line<RcsbFvTrackDataElementInterface> = line<RcsbFvTrackDataElementInterface>().curve(curveStep);
    linePoints: RcsbFvTrackDataElementInterface[];

    mousemoveCallBack: (n: number)=>void = (index:number)=>{
        if(this.includeTooltip){
            if(this.innerData[index] !=null)
                this.tooltipManager.showTooltip(this.innerData[index] as RcsbFvTrackDataElementInterface);
            else
                this.tooltipManager.hideTooltip();
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
                .range([this._height,0]);
            this.definedScale = true;
        }else{
            throw "FATAL ERROR: d3 scale unknown format";
        }
    }

    private setLine(): void{
        this.line
            .x((d:RcsbFvTrackDataElementInterface) => {
                return this.xScale(d.begin) ?? 0;
            })
            .y((d:RcsbFvTrackDataElementInterface) => {
                return this.yScale(d.value as number) ?? 0;
            });
    }

    private updateLine(): void{
        this.line.x((d: RcsbFvTrackDataElementInterface) => {
            return this.xScale(d.begin) ?? 0;
        });
    }

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void {
        if(!this.definedScale) {
            this.setScale();
            this.setLine();
        }
        this.linePoints = this.downSampling(elements.data());
        elements.remove();
        const config: PlotLineInterface = {
            points: this.linePoints,
            line: this.line,
            color: this._displayColor as string,
            trackG: this.g
        };
        RcsbD3LineManager.plot(config);
    }

    move(): void{
        this.updateLine();
        const config: MoveLineInterface = {
            points: this.linePoints,
            line: this.line,
            trackG: this.g
        };
        RcsbD3LineManager.move(config);
        this.setDataUpdated(false);
    }

    protected downSampling(points: RcsbFvTrackDataElementInterface[]):RcsbFvTrackDataElementInterface[] {
        let out:RcsbFvTrackDataElementInterface[] = [];
        const tmp:RcsbFvTrackDataElementInterface[] = [];
        const domain: {min:number;max:number;} = {min:Number.MAX_SAFE_INTEGER,max:Number.MIN_SAFE_INTEGER};
        points.forEach(p=>{
            if(p.begin<domain.min)domain.min = p.begin-0.5;
            if(p.begin>domain.max)domain.max = p.begin+0.5;
        });
        domain.min = Math.max(domain.min,this.xScale.domain()[0]);
        domain.max = Math.min(domain.max,this.xScale.domain()[1]);
        const thr = this.maxPoints;
        let title:string | undefined = points[0].title;
        if(points[0].name != null)title = points[0].name;

        for(let n = Math.ceil(domain.min);n<domain.max; n++){
            tmp[n] = {begin:n,value:0,title:title};
        }
        points.forEach((p) => {
            if(p.begin>domain.min && p.begin<domain.max) {
                tmp[p.begin] = p;
            }
        });
        tmp.forEach((p)=> {
            if(p.begin>domain.min && p.begin<domain.max){
                out.push(p);
                this.innerData[p.begin]={begin:p.begin,value:p.value,title:title};
            }
        });
        out.unshift({begin:domain.min,value:0});
        out.unshift({begin:this.xScale.domain()[0],value:0});
        out.push({begin:domain.max,value:0});
        out.push({begin:this.xScale.domain()[1],value:0});
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