import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Selection,BaseType} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {LocationViewInterface} from "../RcsbBoard";
import * as classes from "../scss/RcsbBoard.module.scss";
import {PlotSequenceInterface, MoveSequenceInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3SequenceManager";
import {RcsbFvTrackDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbSequenceDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface {

    yScale: ScaleLinear<number,number> = scaleLinear();
    intervalRatio: [number,number] = [5,16];

    update(where: LocationViewInterface, compKey?: string) {
        const xScale = this.xScale;

        let sequence: string = this._data as string;
        if (sequence === undefined) {
            return;
        }

        const dataElems: Array<RcsbFvTrackDataElementInterface> = sequence.split("").map((s:string, i:number)=>{
            return {pos:(i + 1), label:s} as RcsbFvTrackDataElementInterface;
        }).filter((s: RcsbFvTrackDataElementInterface, i: number)=> {
            return (i+1 >= xScale.domain()[0] && i <= xScale.domain()[1]);
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