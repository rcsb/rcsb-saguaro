import {Selection} from "d3-selection";
import {Line} from "d3-shape";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbD3DisplayManagerInterface} from "./RcsbD3DisplayManagerInterface"

export interface PlotAreaInterface {
    points: [number,number][];
    color: string;
    trackG: Selection<SVGGElement,any,null,undefined>;
    area:Line<[number,number]>
}

export interface MoveAreaInterface {
    points: [number,number][];
    trackG: Selection<SVGGElement,any,null,undefined>;
    area:Line<[number,number]>
}

export class RcsbD3AreaManager implements RcsbD3DisplayManagerInterface{

    plot(config: PlotAreaInterface){

        config.trackG.select(RcsbD3Constants.PATH).remove();
        config.trackG.append(RcsbD3Constants.PATH)
            .datum(config.points)
            .attr(RcsbD3Constants.D, config.area)
            .style(RcsbD3Constants.STROKE, config.color)
            .style(RcsbD3Constants.STROKE_WIDTH, 1)
            .attr(RcsbD3Constants.FILL_OPACITY,"0.25")
            .attr(RcsbD3Constants.FILL, config.color);
    }

    move(config:MoveAreaInterface){
        config.trackG.select(RcsbD3Constants.PATH)
            .datum(config.points)
            .attr(RcsbD3Constants.D, config.area);
    }
}