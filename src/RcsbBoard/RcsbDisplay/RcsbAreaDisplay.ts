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
import {
    MoveLineInterface,
    PlotLineInterface,
    RcsbD3LineManager
} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3LineManager";

interface LineColorInterface {
    points:RcsbFvTrackDataElementInterface[];
    color: string;
    alpha?: number;
}

export class RcsbAreaDisplay extends RcsbLineDisplay {
    private area: Area<RcsbFvTrackDataElementInterface> = area<RcsbFvTrackDataElementInterface>().curve(curveStep);
    private multiLine: Array<LineColorInterface> = new Array<LineColorInterface>();
    private blockAreaFlag: boolean = false;
    private multiAreaFlag: boolean = false;
    protected readonly SUFFIX_ID: string = "area_";

    public setInterpolationType(type: string): void{
        super.setInterpolationType(type);
        if(type === InterpolationTypes.CARDINAL)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveCardinal);
        else if(type === InterpolationTypes.STEP)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveStep);
        else if(type === InterpolationTypes.BASIS)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveBasis);
        else if(type === InterpolationTypes.LINEAR)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveLinear);
    }

    public setBlockArea(flag: boolean){
        this.blockAreaFlag = flag;
    }

    public setMultiArea(flag: boolean){
        this.multiAreaFlag = flag;
    }

    private setArea(): void{
        this.setLine();
        this.area
            .x((d:RcsbFvTrackDataElementInterface) => {
                return this.xScale(d.begin) ?? 0;
            })
            .y1((d:RcsbFvTrackDataElementInterface) => {
                if(d.values instanceof Array)
                    return this.yScale(d.values[1]) ?? 0;
                return this.yScale(d.value as number) ?? 0;
            })
            .y0( (d:RcsbFvTrackDataElementInterface) => {
                if(d.values instanceof Array)
                    return this.yScale(d.values[0]) ?? 0;
                return this.yScale(0) ?? 0;
            });
    }

    private updateArea(): void{
        this.updateLine();
        this.area
            .x((d:RcsbFvTrackDataElementInterface) => {
                return this.xScale(d.begin) ?? 0;
            })
    }

    public plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void {
        if(!this.definedScale){
            this.setScale();
            this.setArea();
        }

        elements.remove();
        if(typeof this._displayColor === "string") {
            this.multiLine = [{points: this.downSampling(elements.data()), color: this._displayColor}];
        }else if(typeof this._displayColor === "object"){
            this.multiLine = this.downSamplingSplit(elements.data(),buildColorThreshold(this._displayColor));
        }
        RcsbD3LineManager.clean({trackG:this.g});
        if(!this.blockAreaFlag)
            RcsbD3AreaManager.plotAxis({
                trackG: this.g,
                x1: this.xScale.range()[0],
                x2: this.xScale.range()[1],
                y1: this.yScale(0) ?? 0,
                y2: this.yScale(0) ?? 0
            });
        this.multiLine.forEach((e:LineColorInterface,index:number)=>{
            if(this.multiLine.length == 1 && !this.blockAreaFlag) {
                const borderConfig: PlotLineInterface = {
                    points: e.points,
                    line: this.line,
                    color: e.color,
                    trackG: this.g,
                    id: this.SUFFIX_ID + "line_" + index
                };
                RcsbD3LineManager.plot(borderConfig)
            }
            const areaConfig: PlotAreaInterface = {
                points: e.points,
                color: e.color,
                trackG: this.g,
                area: this.area,
                id:this.SUFFIX_ID+index,
                opacity: (this.blockAreaFlag ? e.alpha : ((this.multiLine.length > 1 || this.blockAreaFlag) ? 1 : .2)),
                clickCallBack:this.clickCallBack
            };
            RcsbD3AreaManager.plot(areaConfig);
        });
    }

    public move(): void{
        this.updateArea();
        this.multiLine.forEach((e:LineColorInterface,index:number)=>{
            const areaConfig: MoveAreaInterface = {
                points: e.points,
                trackG: this.g,
                area: this.area,
                id:this.SUFFIX_ID+index
            };
            RcsbD3AreaManager.move(areaConfig);
            if(this.multiLine.length == 1) {
                const borderConfig: MoveLineInterface = {
                    points: e.points,
                    line: this.line,
                    trackG: this.g,
                    id: this.SUFFIX_ID + "line_" + index
                };
                RcsbD3LineManager.move(borderConfig);
            }
        });
        this.setDataUpdated(false);
    }

    private downSamplingSplit(points: RcsbFvTrackDataElementInterface[], gradient:{thresholds:Array<number>;colors:Array<string>;}):Array<LineColorInterface> {
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
        for(let n = Math.ceil(domain.min); n<domain.max; n++){
            this.innerData.push(null);
            gradient.colors.forEach((c,i)=>{
                tmp[i].points[n] = {begin:n,value:0,values:[0,0]};
            });
        }
        points.forEach((p) => {
            this.innerData[p.begin]=p;
            if(p.begin>domain.min && p.begin<domain.max) {
                if(this.multiAreaFlag){
                    gradient.colors.forEach((c,n)=>{
                        if(p.values)
                            tmp[n].points[p.begin] = {...p, values:[ (n-1)<0 ? 0 : p.values[n-1],p.values[n] ]};
                    })
                }else{
                    const thrIndex: number = searchClassThreshold(p.value as number, gradient.thresholds);
                    tmp[thrIndex].points[p.begin] = this.blockAreaFlag ? {...p, value: 1} : p;
                }
            }
        });
        tmp.forEach((lineColor, index)=>{
            let out:RcsbFvTrackDataElementInterface[] = [];
            lineColor.points.forEach((p)=> {
                if(p!= null && p.begin>domain.min && p.begin<domain.max){
                    out.push(p);
                }
            });
            out.unshift({begin:domain.min,value:0,values:[0,0]});
            out.unshift({begin:this.xScale.domain()[0],value:0,values:[0,0]});
            out.push({begin:domain.max,value:0,values:[0,0]});
            out.push({begin:this.xScale.domain()[1],value:0,values:[0,0]});
            if(out.length>thr){
                const bucketSize = out.length/thr ;
                const sampler = largestTriangleOneBucket();
                sampler.bucketSize(bucketSize);
                sampler.x((d:RcsbFvTrackDataElementInterface)=>{return d.begin});
                sampler.y((d:RcsbFvTrackDataElementInterface)=>{return d.value});
                out = sampler(out);
            }
            lineColorArray.push({points:out,color:lineColor.color,alpha:gradient.thresholds[index] ?? 1});
        });
        return lineColorArray.reverse();
    }

}

function searchClassThreshold(x: number, thresholds: Array<number>): number{
    if(x<thresholds[0])
        return 0;
    for(let i=0;i<thresholds.length-1;i++){
        if(thresholds[i+1] > x && x >= thresholds[i] )
            return i+1
    }
    return thresholds.length;
}

function buildColorThreshold(displayColor: RcsbFvColorGradient): {thresholds:Array<number>;colors:Array<string>;} {
    if(displayColor.colors instanceof Array)
        return {thresholds: displayColor.thresholds, colors: displayColor.colors};
    return {
        thresholds: displayColor.thresholds,
        colors: Array(displayColor.thresholds.length+1).fill(displayColor.colors)
    };
}
