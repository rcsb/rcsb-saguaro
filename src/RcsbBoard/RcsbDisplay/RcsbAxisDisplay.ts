import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Axis, AxisDomain, axisBottom} from "d3-axis";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import * as classes from "../scss/RcsbBoard.module.scss";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";

export class RcsbAxisDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface{

    xAxis: Axis<AxisDomain> = undefined;

    reset() {
        super.reset();
        this.xAxis = undefined;
        this.g.selectAll(classes.tick).remove();
    };

    update(){
        if(this.xAxis===undefined) {
            this.xAxis = axisBottom<AxisDomain>(this.xScale);
        }
        this.g.classed(classes.rcsbAxis, true)
            .attr(RcsbD3Constants.TRANSFORM, "translate(0,10)")
            .call(this.xAxis);
    }

    move(){
        this.g.call(this.xAxis);
    }
}