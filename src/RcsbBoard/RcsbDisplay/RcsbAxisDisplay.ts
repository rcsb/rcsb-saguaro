import {RcsbAbstractDisplay} from "./RcsbAbstractDisplay";
import {Axis, axisBottom} from "d3-axis";
import {format} from "d3-format";
import * as classes from "../../scss/RcsbBoard.module.scss";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";

export class RcsbAxisDisplay extends RcsbAbstractDisplay {

    private xAxis: Axis<number>;
    private readonly length: number|undefined;

    constructor(boardId: string, trackId:string, length?:number) {
        super(boardId, trackId);
        this.length = length;
    }

    reset() {
        super.reset();
        this.g.selectAll(classes.tick).remove();
    };

    update(){
        if(this.xAxis == null) {
            this.xAxis = axisBottom<number>(this.xScale.getScale());
            if(this.length != null && this.length < 9)
                this.xAxis.tickValues( Array(this.length).fill(0).map((v,i)=>{return (i+1)}) ).tickFormat(format("d"));
            this.g.classed(classes.rcsbAxis, true)
                .attr(RcsbD3Constants.TRANSFORM, "translate(0,10)")
                .call(this.xAxis);
        }
    }

    move(){
        this.g.call(this.xAxis);
    }
}