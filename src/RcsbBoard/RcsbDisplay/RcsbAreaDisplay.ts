import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {RcsbLineDisplay} from "./RcsbLineDisplay";
import {area, Area, curveStep, curveCardinal, curveBasis, curveLinear} from "d3-shape";
import {InterpolationTypes} from "../../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {BaseType, Selection} from "d3-selection";
import {
    MoveAreaInterface,
    PlotAreaInterface,
    RcsbD3AreaManager
} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3AreaManager";
import {RcsbFvColorGradient, RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {largestTriangleOneBucket} from "@d3fc/d3fc-sample";

interface LineColorInterface {
    points:RcsbFvTrackDataElementInterface[];
    color: string;
}

export class RcsbAreaDisplay extends RcsbLineDisplay implements RcsbDisplayInterface{
    private area: Area<RcsbFvTrackDataElementInterface> = area<RcsbFvTrackDataElementInterface>().curve(curveStep);
    private multiLine: Array<LineColorInterface> = new Array<LineColorInterface>();
    private readonly SUFFIX_ID: string = "area_";

    setInterpolationType(type: string): void{
        if(type === InterpolationTypes.CARDINAL)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveCardinal);
        else if(type === InterpolationTypes.STEP)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveStep);
        else if(type === InterpolationTypes.BASIS)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveBasis);
        else if(type === InterpolationTypes.LINEAR)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveLinear);
    }

    private setArea(): void{
        this.area
            .x((d:RcsbFvTrackDataElementInterface) => {
                return this.xScale(d.begin) ?? 0;
            })
            .y1((d:RcsbFvTrackDataElementInterface) => {
                return this.yScale(d.value as number) ?? 0;
            })
            .y0( this.yScale(0) ?? 0);
    }

    private updateArea(): void{
        this.area
            .x((d:RcsbFvTrackDataElementInterface) => {
                return this.xScale(d.begin) ?? 0;
            })
    }

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void {
        if(!this.definedScale){
            this.setScale();
            this.setArea();
        }

        elements.remove();
        if(typeof this._displayColor === "string") {
            this.multiLine = [{points: this.downSampling(elements.data()), color: this._displayColor}];
        }else if(typeof this._displayColor === "object"){
            this.multiLine = this.downSamplingSplit(elements.data(),this._displayColor);
        }

        RcsbD3AreaManager.clean({trackG:this.g});
        this.multiLine.forEach((e:LineColorInterface,index:number)=>{
            const config: PlotAreaInterface = {
                points: e.points,
                color: e.color,
                trackG: this.g,
                area: this.area,
                id:this.SUFFIX_ID+index
            };
            RcsbD3AreaManager.plot(config);
        });
    }

    move(): void{
        this.updateArea();
        this.multiLine.forEach((e:LineColorInterface,index:number)=>{
            const config: MoveAreaInterface = {
                points: e.points,
                trackG: this.g,
                area: this.area,
                id:this.SUFFIX_ID+index
            };
            RcsbD3AreaManager.move(config);
        });
        this.setDataUpdated(false);
    }

    private downSamplingSplit(points: RcsbFvTrackDataElementInterface[], gradient:RcsbFvColorGradient):Array<LineColorInterface> {
        const tmp:Array<LineColorInterface> = new Array<LineColorInterface>();
        const lineColorArray:Array<LineColorInterface> = new Array<LineColorInterface>();
        const domain: {min:number;max:number;} = {min:Number.MAX_SAFE_INTEGER,max:Number.MIN_SAFE_INTEGER};
        points.forEach(p=>{
            if(p.begin<domain.min)domain.min = p.begin-0.5;
            if(p.begin>domain.max)domain.max = p.begin+0.5;
        });
        domain.min = Math.max(domain.min,this.xScale.domain()[0]);
        domain.max = Math.min(domain.max,this.xScale.domain()[1]);
        gradient.colors.forEach((c,i)=>{
            tmp[i] = {points:new Array<RcsbFvTrackDataElementInterface>(),color:c};
        });
        const thr = this.maxPoints;
        let title:string | undefined = points[0].title;
        if(points[0].name != null)title = points[0].name;
        for(let n = Math.ceil(domain.min); n<domain.max; n++){
            this.innerData.push(null);
            gradient.colors.forEach((c,i)=>{
                tmp[i].points[n] = {begin:n,value:0,title:title};
            });
        }
        points.forEach((p) => {
            this.innerData[p.begin]={begin:p.begin,value:p.value,title:title};
            if(p.begin>domain.min && p.begin<domain.max) {
                const thrIndex: number = RcsbAreaDisplay.searchClassThreshold(p.value as number, gradient.thresholds);
                tmp[thrIndex].points[p.begin] = p;
            }
        });
        tmp.forEach((lineColor)=>{
            let out:RcsbFvTrackDataElementInterface[] = [];
            lineColor.points.forEach((p)=> {
                if(p!= null && p.begin>domain.min && p.begin<domain.max){
                    out.push(p);
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
            lineColorArray.push({points:out,color:lineColor.color});
        });
        return lineColorArray.reverse();
    }

    private static searchClassThreshold(x: number, thresholds: Array<number>): number{
        if(x>thresholds[0])
            return 1;
        else
            return 0;
    }
}
