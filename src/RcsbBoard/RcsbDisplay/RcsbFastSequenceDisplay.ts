import {RcsbAbstractDisplay} from "./RcsbAbstractDisplay";
import {Selection, BaseType, ContainerElement, pointer} from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";
import {RcsbD3ScaleFactory, RcsbScaleInterface} from "../RcsbD3/RcsbD3ScaleFactory";
import classes from "../../scss/RcsbBoard.module.scss";
import {
    MoveFastSequenceInterface, PlotFastSequenceInterface, PlotFastSequenceLineInterface,
    RcsbD3FastSequenceManager
} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3FastSequenceManager";

export class RcsbFastSequenceDisplay extends RcsbAbstractDisplay {

    private yScale: RcsbScaleInterface = RcsbD3ScaleFactory.getLinearScale();
    private intervalRatio: [number,number] = [5,16];
    private hideFlag: boolean = false;
    private compKey: string | undefined;
    private nonEmptyDisplay: boolean = false;
    private readonly rcsbD3SequenceManager: RcsbD3FastSequenceManager = new RcsbD3FastSequenceManager();
    private definedScale: boolean = false;

    private innerData: Array<RcsbFvTrackDataElementInterface|null> = new Array<RcsbFvTrackDataElementInterface|null>();

    private hoverCallback: (event:MouseEvent)=>void = (event:MouseEvent)=>{
        const svgNode:ContainerElement | null  = this.g.node();
        if(svgNode != null) {
            const x = pointer(event, svgNode)[0];
            const index = Math.round(this.xScale.invert(x));
            if (this.innerData[index] != null) {
                this.elementEnterSubject.next({
                    element: this.innerData[index] as RcsbFvTrackDataElementInterface,
                    event: event
                });
            } else {
                this.elementLeaveSubject.next({
                    element: {begin:Number.MIN_SAFE_INTEGER},
                    event: event
                });
            }
        }
    };

    private clickCallback = (event: MouseEvent)=>{
        const svgNode:ContainerElement | null  = this.g.node();
        if(svgNode != null) {
            const x = pointer(event, svgNode)[0];
            const position = Math.round(this.xScale.invert(x));
            const region: RcsbFvTrackDataElementInterface = {begin: position, end: position};
            this.getBoardHighlight()(region, event.shiftKey ? 'add' : 'set', 'select', false);
            this.elementClickSubject.next({element:region, event});
        }
    };

    setDynamicDisplay(){
        this.hideFlag = true;
        this.mouseoutSubject.subscribe((d)=>{
            this.hideFlag = true;
            this.getElements().remove();
        });
        this.mouseoverSubject.subscribe((d)=>{
            this.hideFlag = false;
            this.update(this.compKey);
        });
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
            const dataElems: Array<RcsbFvTrackDataElementInterface> = this.getSequenceData(where);
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
        if(!this.definedScale) {
            this.setScale();
        }
        const config: PlotFastSequenceInterface = {
            elements: elements,
            trackG: this.g,
            xScale: this.xScale,
            yScale: this.yScale,
            color: this._displayColor as string,
            height: this.height(),
            intervalRatio: this.intervalRatio,
            clickCallback: this.clickCallback,
            hoverCallback: this.hoverCallback
        };
        this.rcsbD3SequenceManager.plot(config);
        this.checkHideFlag();
    }

    move(){
        const config: MoveFastSequenceInterface = {
            xScale: this.xScale,
            intervalRatio: this.intervalRatio,
        };
        this.rcsbD3SequenceManager.move(config);
    }

    private setScale(): void {
        this.yScale
            .domain([0, this.height()])
            .range([0, this.height()]);
        this.definedScale = true
    }

    private plotSequenceLine(): void{
        const config: PlotFastSequenceLineInterface = {
            xScale: this.xScale,
            yScale: this.yScale,
            height: this.height(),
            g:this.g
        };
        RcsbD3FastSequenceManager.plotSequenceLine.call(this,config);
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

    private getSequenceData(where: LocationViewInterface): Array<RcsbFvTrackDataElementInterface>{
        const sequence: RcsbFvTrackData = this.data();
        const seqPath: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
        this.innerData = [];
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
                        if(e.begin >= where.from && e.begin <= where.to) {
                            this.innerData[e.begin] = e;
                            addResToSeqPath(e, seqPath);
                        }
                    });
                }else{
                    const e: RcsbFvTrackDataElementInterface = {
                        ...seqRegion,
                        type: "RESIDUE",
                        title: "RESIDUE",
                        label: seqRegion.value
                    };
                    if(e.begin >= where.from && e.begin <= where.to) {
                        this.innerData[e.begin] = e;
                        addResToSeqPath(e, seqPath);
                    }
                }
            }
        });
        return seqPath;
    }

}

function addResToSeqPath(res: RcsbFvTrackDataElementInterface, seqPath: Array<RcsbFvTrackDataElementInterface>): void {
    if(seqPath.length > 0 && seqPath[seqPath.length-1].label!.length + seqPath[seqPath.length-1].begin == res.begin) {
        seqPath[seqPath.length-1].label! += res.label!;
    }else{
        seqPath.push({
            begin: res.begin,
            label: res.label!
        });
    }
}