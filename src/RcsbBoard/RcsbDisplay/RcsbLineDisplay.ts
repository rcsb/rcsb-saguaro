import {RcsbAbstractDisplay} from "./RcsbAbstractDisplay";
import {Selection, BaseType, pointer, ContainerElement} from "d3-selection";
import {
    MoveLineInterface,
    PlotLineInterface,
    RcsbD3LineManager
} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3LineManager";
import {line, Line, curveStep, curveCardinal, curveBasis, curveLinear} from "d3-shape";
import {largestTriangleOneBucket} from "@d3fc/d3fc-sample";
import {InterpolationTypes} from "../../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbScaleFactory, RcsbScaleInterface} from "../RcsbScaleFactory";

export class RcsbLineDisplay extends RcsbAbstractDisplay {

    private _yDomain: [number, number];
    protected yScale: RcsbScaleInterface = RcsbScaleFactory.getLinearScale();
    protected maxPoints: number = 1000;
    protected innerData: Array<RcsbFvTrackDataElementInterface|null> = new Array<RcsbFvTrackDataElementInterface|null>();
    protected readonly SUFFIX_ID: string = "line_";

    protected definedScale: boolean = false;
    protected line:Line<RcsbFvTrackDataElementInterface> = line<RcsbFvTrackDataElementInterface>().curve(curveStep);
    private linePoints: RcsbFvTrackDataElementInterface[];

    mousemoveCallBack: (event:MouseEvent, n: number)=>void = (event:MouseEvent, index:number)=>{
        if(this.includeTooltip){
            if(this.innerData[index] !=null)
                this.tooltipManager.showTooltip(this.innerData[index] as RcsbFvTrackDataElementInterface);
            else
                this.tooltipManager.hideTooltip();
        }
        if(typeof this.getElementEnterCallBack() === "function" && this.innerData[index]!=null){
            this.getElementEnterCallBack()(this.innerData[index] as RcsbFvTrackDataElementInterface, event);
        }
    };

    mouseoutCallBack: ()=>void = ()=>{
        this.tooltipManager.hideTooltip();
    };

    protected clickCallBack = (event: MouseEvent)=>{
        const svgNode:ContainerElement | null  = this.g.node();
        if(svgNode != null) {
            const x = pointer(event, svgNode)[0];
            const position = Math.round(this.xScale.invert(x));
            const region: RcsbFvTrackDataElementInterface = {begin: position, end: position};
            this.getBoardHighlight()(region, event.shiftKey ? 'add' : 'set', 'select', false);
            if(typeof this.getElementClickCallBack() === "function")
                this.getElementClickCallBack()(region, event);
        }
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
        if(typeof this.height() === "number" && this._yDomain.length == 2 && typeof this._yDomain[0] === "number" && typeof this._yDomain[1] === "number") {
            this.yScale
                .domain(this._yDomain)
                .range([this.height()-3,3]);
            this.definedScale = true;
        }else{
            throw "FATAL ERROR: d3 scale unknown format";
        }
    }

    protected setLine(): void{
        this.line
            .x((d:RcsbFvTrackDataElementInterface) => {
                return this.xScale(d.begin) ?? 0;
            })
            .y((d:RcsbFvTrackDataElementInterface) => {
                return this.yScale(d.value as number) ?? 0;
            });
    }

    protected updateLine(): void{
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
            trackG: this.g,
            id:this.SUFFIX_ID+"0"
        };
        RcsbD3LineManager.plot(config);
    }

    move(): void{
        this.updateLine();
        const config: MoveLineInterface = {
            points: this.linePoints,
            line: this.line,
            trackG: this.g,
            id: this.SUFFIX_ID+"0"
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
        for(let n = Math.ceil(domain.min);n<domain.max; n++){
            tmp[n] = {begin:n,value:0};
        }
        points.forEach((p) => {
            if(p.begin>domain.min && p.begin<domain.max) {
                tmp[p.begin] = p;
            }
        });
        tmp.forEach((p)=> {
            if(p.begin>domain.min && p.begin<domain.max){
                out.push(p);
                this.innerData[p.begin]=p;
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