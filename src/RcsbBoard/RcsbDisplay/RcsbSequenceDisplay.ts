import {RcsbAbstractDisplay} from "./RcsbAbstractDisplay";
import {Selection,BaseType} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {LocationViewInterface} from "../RcsbBoard";
import * as classes from "../scss/RcsbBoard.module.scss";
import {
    PlotSequenceInterface,
    MoveSequenceInterface,
    PlotSequenceLineInterface, RcsbD3SequenceManager
} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3SequenceManager";
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";

export class RcsbSequenceDisplay extends RcsbAbstractDisplay {

    private yScale: ScaleLinear<number,number> = scaleLinear();
    private intervalRatio: [number,number] = [5,16];
    private hideFlag: boolean = false;
    private compKey: string | undefined;
    private nonEmptyDisplay: boolean = false;
    private rcsbD3SequenceManager: RcsbD3SequenceManager = new RcsbD3SequenceManager();


    setDynamicDisplay(){
        this.hideFlag = true;
        this.mouseoutCallBack = () => {
            this.hideFlag = true;
            this.getElements().remove();
        };
        this.mouseoverCallBack = () => {
            this.hideFlag = false;
            this.update(this.compKey);
        };
    }

    setNonEmptyDisplay(flag: boolean): void{
        this.nonEmptyDisplay = flag;
    }

    enter(e: Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined>): void{
        e.append<SVGTextElement>(RcsbD3Constants.TEXT);
    }

    _update(where: LocationViewInterface, compKey?: string) {
        this.compKey = compKey;
        if(this.hideFlag)
            return;

        if (this.data() == null) {
            return;
        }

        if(this.minIntervalRatio()){
            const dataElems: Array<RcsbFvTrackDataElementInterface> = this.getSequenceData().filter((s: RcsbFvTrackDataElementInterface, i: number)=> {
                return (s.begin >= where.from && s.begin <= where.to);
            });
            this.rmSequenceLine();
            this.selectElements(dataElems,compKey);
            this.getElements().attr("class", classes.rcsbElement)
                .classed(classes.rcsbElement+"_" + compKey, typeof compKey === "string")
                .call(this.plot.bind(this));
        }else{
            this.getElements().remove();
            this.displayEmpty();
        }
        this.checkHideFlag();
    }

    displayEmpty(): void {
        if(this.nonEmptyDisplay) {
            this.plotSequenceLine();
        }
    }

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>){
        if(this.hideFlag)
            return;
        super.plot(elements);
        this.yScale
            .domain([0, this.height()])
            .range([0, this.height()]);
        const config: PlotSequenceInterface = {
            elements: elements,
            xScale: this.xScale,
            yScale: this.yScale,
            color: this._displayColor as string,
            height: this.height(),
            intervalRatio: this.intervalRatio,
        };
        this.rcsbD3SequenceManager.plot(config);
        this.checkHideFlag();
    }

    move(){
        const config: MoveSequenceInterface = {
            xScale: this.xScale,
            intervalRatio: this.intervalRatio,
        };
        this.rcsbD3SequenceManager.move(config);
    }

    private plotSequenceLine(): void{
        const config: PlotSequenceLineInterface = {
            xScale: this.xScale,
            yScale: this.yScale,
            height: this.height(),
            g:this.g
        };
        RcsbD3SequenceManager.plotSequenceLine.call(this,config);
    }

    private rmSequenceLine(): void{
        this.g.select(RcsbD3Constants.LINE).remove();
    }

    private checkHideFlag(): void{
        if(this.hideFlag) {
            this.getElements().remove();
        }
    }

    private minIntervalRatio(): boolean{
        return (this.getRatio() >= this.intervalRatio[0]);
    }

    private getSequenceData(): Array<RcsbFvTrackDataElementInterface>{
        const sequence: RcsbFvTrackData = this.data();
        const elems: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
        sequence.forEach(seqRegion=>{
            if(typeof seqRegion.value === "string") {
                if(seqRegion.value.length>1) {
                    seqRegion.value.split("").forEach((s: string, i: number) => {
                        const e: RcsbFvTrackDataElementInterface = {
                            begin: (seqRegion.begin + i),
                            type: "RESIDUE",
                            title: "RESIDUE",
                            label: s
                        };
                        if(typeof seqRegion.oriBegin === "number")
                            e.oriBegin = seqRegion.oriBegin + i;
                        if(typeof seqRegion.sourceId === "string")
                            e.sourceId = seqRegion.sourceId;
                        if(typeof seqRegion.source === "string")
                            e.source = seqRegion.source;
                        elems.push(e);
                    });
                }else{
                    const e: RcsbFvTrackDataElementInterface = {
                        ...seqRegion,
                        type: "RESIDUE",
                        title: "RESIDUE",
                        label: seqRegion.value
                    };
                    elems.push(e);
                }
            }
        });
        return elems;
    }

}