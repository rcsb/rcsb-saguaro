import {Selection} from "d3-selection";
import {Line} from "d3-shape";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export interface PlotLineInterface {
    points: RcsbFvTrackDataElementInterface[];
    color: string;
    trackG: Selection<SVGGElement,any,null,undefined>;
    line:Line<RcsbFvTrackDataElementInterface>;
    id:string;
}

export interface MoveLineInterface {
    points: RcsbFvTrackDataElementInterface[];
    trackG: Selection<SVGGElement,any,null,undefined>;
    line:Line<RcsbFvTrackDataElementInterface>
    id:string;
}

export class RcsbD3LineManager {

    static plot(config: PlotLineInterface){
        if(config.trackG.select(RcsbD3Constants.PATH + "#" + config.id).size() == 0)
            config.trackG.append(RcsbD3Constants.PATH)
                .attr(RcsbD3Constants.ID,config.id)
                .style(RcsbD3Constants.STROKE, config.color)
                .style(RcsbD3Constants.STROKE_WIDTH, 0.6)
                .style(RcsbD3Constants.FILL, "none");

        config.trackG.select(RcsbD3Constants.PATH+"#"+config.id)
            .datum(config.points)
            .attr(RcsbD3Constants.D, config.line)
    }

    static move(config:MoveLineInterface){
        config.trackG.select(RcsbD3Constants.PATH+"#"+config.id)
            .datum(config.points)
            .attr(RcsbD3Constants.D, config.line);
    }
}