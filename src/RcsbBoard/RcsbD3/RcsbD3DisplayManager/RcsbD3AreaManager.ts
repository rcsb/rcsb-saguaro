import {Selection} from "d3-selection";
import {Area} from "d3-shape";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export interface ClearAreaInterface {
    trackG: Selection<SVGGElement,any,null,undefined>;
}

export interface PlotAreaInterface {
    points: RcsbFvTrackDataElementInterface[];
    color: string;
    trackG: Selection<SVGGElement,any,null,undefined>;
    area:Area<RcsbFvTrackDataElementInterface>;
    id:string;
}

export interface MoveAreaInterface {
    points: RcsbFvTrackDataElementInterface[];
    trackG: Selection<SVGGElement,any,null,undefined>;
    area:Area<RcsbFvTrackDataElementInterface>
    id:string;
}

export class RcsbD3AreaManager {

    static clean(config: ClearAreaInterface){
        config.trackG.selectAll(RcsbD3Constants.PATH).remove();
    }

    static plot(config: PlotAreaInterface){

        config.trackG.append(RcsbD3Constants.PATH)
            .datum(config.points)
            .attr(RcsbD3Constants.ID,config.id)
            .attr(RcsbD3Constants.D, config.area)
            .style(RcsbD3Constants.STROKE, config.color)
            .style(RcsbD3Constants.STROKE_WIDTH, 0.5)
            .style(RcsbD3Constants.FILL_OPACITY,"0.25")
            .style(RcsbD3Constants.FILL, config.color);
    }

    static move(config:MoveAreaInterface){
        config.trackG.select(RcsbD3Constants.PATH+"#"+config.id)
            .datum(config.points)
            .attr(RcsbD3Constants.D, config.area);
    }
}