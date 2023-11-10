import {RcsbAbstractDisplay} from "./RcsbAbstractDisplay";
import {BaseType, ContainerElement, pointer, Selection} from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";
import {RcsbD3ScaleFactory, RcsbScaleInterface} from "../RcsbD3/RcsbD3ScaleFactory";
import classes from "../../scss/RcsbBoard.module.scss";
import {
    MoveFastSequenceInterface,
    PlotFastSequenceInterface,
    PlotFastSequenceLineInterface,
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
    private index: number;

    private mousemove(event:MouseEvent){
        const svgNode:ContainerElement | null  = this.g?.node();
        if(svgNode != null) {
            const x = pointer(event, svgNode)[0];
            this.index = Math.round(this.xScale.invert(x));
            this.elementSubject.mouseenter.next({d: {begin: this.index}, e: event});
        }
    }

    private mouseleave(event:MouseEvent){
        this.elementSubject.mouseleave.next({d: {begin: this.index}, e: event});
    }

    private mouseclick = (event: MouseEvent)=>{
        const svgNode:ContainerElement | null  = this.g.node();
        if(svgNode != null) {
            const x = pointer(event, svgNode)[0];
            const position = Math.round(this.xScale.invert(x));
            const region: RcsbFvTrackDataElementInterface = {begin: position, end: position};
            this.getBoardHighlight()(region, event.shiftKey ? 'add' : 'set', 'select', false);
            this.elementSubject.mouseclick.next({d: region, e: event});
        }
    };

    setDynamicDisplay(){
        this.hideFlag = true;
        this.trackSubject.mouseleave.subscribe(()=>{
            this.hideFlag = true;
            this.getElements().remove();
        })
        this.trackSubject.mouseenter.subscribe(()=>{
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
            mouseclick: this.mouseclick.bind(this),
            mousemove: this.mousemove.bind(this),
            mouseleave: this.mouseleave.bind(this)
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
            trackG:this.g,
            mouseclick: this.mouseclick.bind(this),
            mousemove: this.mousemove.bind(this),
            mouseleave: this.mouseleave.bind(this)
        };
        RcsbD3FastSequenceManager.plotSequenceLine(config);
    }

    private rmSequenceLine(): void{
        RcsbD3FastSequenceManager.clearLine({trackG: this.g})
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
        sequence.forEach(seqRegion=>{
            if(typeof seqRegion.label !== "undefined") {
                if(seqRegion.label.length>1) {
                    seqRegion.label.split("").forEach((s: string, i: number) => {
                        const e: RcsbFvTrackDataElementInterface = {
                            ...seqRegion,
                            begin: (seqRegion.begin + i),
                            label: s
                        };
                        if(e.begin >= where.from && e.begin <= where.to) {
                            addResToSeqPath(e, seqPath);
                        }
                    });
                }else{
                    const e: RcsbFvTrackDataElementInterface = {
                        ...seqRegion,
                        label: seqRegion.label
                    };
                    if(e.begin >= where.from && e.begin <= where.to) {
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