import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Selection,BaseType} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {LocationViewInterface} from "../RcsbBoard";
import * as classes from "../scss/RcsbBoard.module.scss";
import {PlotSequenceInterface, MoveSequenceInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3SequenceManager";
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbSequenceDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface {

    private yScale: ScaleLinear<number,number> = scaleLinear();
    private intervalRatio: [number,number] = [5,16];
    private hideFlag: boolean = false;
    private currentLocation: LocationViewInterface = null;
    private compKey: string = null;
    private tick: number = null;

    setDynamicDisplay(){
        this.hideFlag = true;
        this.mouseoutCallBack = () => {
            this.hideFlag = true;
            this.getElements().remove();
            window.clearTimeout(this.tick);
        };
        this.mouseoverCallBack = () => {
            window.clearTimeout(this.tick);
            if(this.hideFlag) {
                this.tick = window.setTimeout(() => {
                    this.hideFlag = false;
                    this.update(this.currentLocation, this.compKey);
                }, 300);
            }
        };
    }

    _update(where: LocationViewInterface, compKey?: string) {
        this.currentLocation = where;
        this.compKey = compKey;

        if(this.hideFlag) {
            window.clearTimeout(this.tick);
            this.getElements().remove();
            return;
        }

        let sequence: RcsbFvTrackData = this._data;
        if (sequence === undefined) {
            return;
        }

        const elems: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
        sequence.forEach(seqRegion=>{
            (seqRegion.value as string).split("").forEach((s:string, i:number)=>{
                const e:RcsbFvTrackDataElementInterface = {begin:(seqRegion.begin+i), type:"RESIDUE", title:"RESIDUE", label:s};
                if(typeof seqRegion.ori_begin === "number")
                    e.ori_begin = seqRegion.ori_begin+i
                if(typeof seqRegion.source === "string")
                    e.source = seqRegion.source;
                elems.push(e);
            })
        });

        const dataElems: Array<RcsbFvTrackDataElementInterface> = elems.filter((s: RcsbFvTrackDataElementInterface, i: number)=> {
            return (s.begin >= where.from && s.begin <= where.to);
        });

        let elemClass = "."+classes.rcsbElement;
        if (compKey !== undefined) {
            elemClass += "_"+compKey;
        }

        this.g.selectAll(elemClass).remove();

        if(this.minRatio()){
            this.g.selectAll(elemClass).data(dataElems)
                .enter()
                .append("g")
                .attr("class", classes.rcsbElement)
                .classed(classes.rcsbElement+"_" + compKey, typeof compKey === "string")
                .call(this.plot.bind(this));
        }else{
            this.getElements().remove();
        }

        if(this.hideFlag) {
            window.clearTimeout(this.tick);
            this.getElements().remove();
        }
    }

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>){
        if(this.hideFlag) {
            window.clearTimeout(this.tick);
            this.getElements().remove();
            return;
        }

        super.plot(elements);
        this.yScale
            .domain([0, this._height])
            .range([0, this._height]);
        const config: PlotSequenceInterface = {
            elements: elements,
            xScale: this.xScale,
            yScale: this.yScale,
            color: this._displayColor,
            height: this._height,
            intervalRatio: this.intervalRatio,
            hideFlag: this.hideFlag
        };
        this.d3Manager.plotSequenceDisplay(config);

        if(this.hideFlag) {
            window.clearTimeout(this.tick);
            this.getElements().remove();
        }
    }

    move(){
        if(this.hideFlag) {
            window.clearTimeout(this.tick);
            this.getElements().remove();
            return;
        }
        const config: MoveSequenceInterface = {
            elements: this.getElements(),
            xScale: this.xScale,
            intervalRatio: this.intervalRatio,
            hideFlag: this.hideFlag
        };
        this.d3Manager.moveSequenceDisplay(config);
        if(this.hideFlag) {
            window.clearTimeout(this.tick);
            this.getElements().remove();
        }
    }

    private getRatio(): number{
        const xScale = this.xScale;
        return (xScale.range()[1]-xScale.range()[0])/(xScale.domain()[1]-xScale.domain()[0]);
    }

    private minRatio(): boolean{
        return (this.getRatio() >= this.intervalRatio[0]);
    }

}