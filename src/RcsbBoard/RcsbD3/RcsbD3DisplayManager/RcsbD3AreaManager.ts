import {Selection} from "d3-selection";
import {Area} from "d3-shape";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export interface PlotAreaInterface {
    points: RcsbFvTrackDataElementInterface[];
    color: string;
    trackG: Selection<SVGGElement,any,null,undefined>;
    area:Area<RcsbFvTrackDataElementInterface>
}

export interface MoveAreaInterface {
    points: RcsbFvTrackDataElementInterface[];
    trackG: Selection<SVGGElement,any,null,undefined>;
    area:Area<RcsbFvTrackDataElementInterface>
}

export class RcsbD3AreaManager {

    static plot(config: PlotAreaInterface){

        config.trackG.select(RcsbD3Constants.PATH).remove();
        config.trackG.append(RcsbD3Constants.PATH)
            .datum(config.points)
            .attr(RcsbD3Constants.D, config.area)
            .attr(RcsbD3Constants.STROKE, config.color)
            .attr(RcsbD3Constants.STROKE_WIDTH, 1)
            .attr(RcsbD3Constants.STROKE_OPACITY, 1)
            .attr(RcsbD3Constants.FILL_OPACITY,0.8)
            .attr(RcsbD3Constants.FILL, config.color);
    }

    static move(config:MoveAreaInterface){
        config.trackG.select(RcsbD3Constants.PATH)
            .datum(config.points)
            .attr(RcsbD3Constants.D, config.area);
    }
}