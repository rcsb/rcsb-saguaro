import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Selection,BaseType} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {LocationViewInterface} from "../RcsbBoard";
import * as classes from "../scss/RcsbBoard.module.scss";
import {PlotSequenceInterface, MoveSequenceInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3SequenceManager";
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";

export class RcsbSequenceDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface {

    yScale: ScaleLinear<number,number> = scaleLinear();
    intervalRatio: [number,number] = [5,16];

    constructor() {
        super();
        this.mouseoutCallBack = () => {
            console.log(this.g.selectAll("."+classes.rcsbElement));

        };
    }

    update(where: LocationViewInterface, compKey?: string) {
        const xScale = this.xScale;

        let sequence: RcsbFvTrackData = this._data as RcsbFvTrackData;
        if (sequence === undefined) {
            return;
        }

        const elems: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
        sequence.forEach(seqRegion=>{
            (seqRegion.val as string).split("").forEach((s:string, i:number)=>{
                elems.push({begin:(seqRegion.begin+i), label:s} as RcsbFvTrackDataElementInterface);
            })
        });

        const dataElems: Array<RcsbFvTrackDataElementInterface> = elems.filter((s: RcsbFvTrackDataElementInterface, i: number)=> {
            return (s.begin >= xScale.domain()[0] && s.begin <= xScale.domain()[1]);
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
        }
    }

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>){
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
            intervalRatio: this.intervalRatio
        };
        this.d3Manager.plotSequenceDisplay(config);
    }

    move(){
        const config: MoveSequenceInterface = {
            elements: this.getElements(),
            xScale: this.xScale,
            intervalRatio: this.intervalRatio
        };
        this.d3Manager.moveSequenceDisplay(config);
    }

    private getRatio(): number{
        const xScale = this.xScale;
        return (xScale.range()[1]-xScale.range()[0])/(xScale.domain()[1]-xScale.domain()[0]);
    }

    private minRatio(): boolean{
        return (this.getRatio() >= this.intervalRatio[0]);
    }

}