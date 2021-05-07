import {Selection} from "d3-selection";
import {Line} from "d3-shape";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";
import {ClearAreaInterface} from "./RcsbD3AreaManager";

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

    static clean(config: ClearAreaInterface){
        config.trackG.selectAll(RcsbD3Constants.PATH).remove();
    }

    static plot(config: PlotLineInterface){
        config.trackG.append(RcsbD3Constants.PATH)
            .datum(config.points)
            .attr(RcsbD3Constants.ID,config.id)
            .attr(RcsbD3Constants.D, config.line)
            .style(RcsbD3Constants.STROKE, config.color)
            .style(RcsbD3Constants.STROKE_WIDTH, 0.6)
            .style(RcsbD3Constants.FILL, "none");
    }

    static move(config:MoveLineInterface){
        config.trackG.select(RcsbD3Constants.PATH+"#"+config.id)
            .datum(config.points)
            .attr(RcsbD3Constants.D, config.line);
    }
}