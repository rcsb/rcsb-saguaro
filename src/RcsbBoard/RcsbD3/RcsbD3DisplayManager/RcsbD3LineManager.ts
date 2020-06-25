import {Selection} from "d3-selection";
import {Line} from "d3-shape";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export interface PlotLineInterface {
    points: RcsbFvTrackDataElementInterface[];
    color: string;
    trackG: Selection<SVGGElement,any,null,undefined>;
    line:Line<RcsbFvTrackDataElementInterface>;
}

export interface MoveLineInterface {
    points: RcsbFvTrackDataElementInterface[];
    trackG: Selection<SVGGElement,any,null,undefined>;
    line:Line<RcsbFvTrackDataElementInterface>
}

export class RcsbD3LineManager {

    static plot(config: PlotLineInterface){
        config.trackG.select(RcsbD3Constants.PATH).remove();
        const line: string | null = config.line(config.points);
        if(line == null)
            throw "Line elements were not transformed";
        config.trackG.append(RcsbD3Constants.PATH)
            .attr(RcsbD3Constants.D, line)
            .style(RcsbD3Constants.STROKE, config.color)
            .style(RcsbD3Constants.STROKE_WIDTH, 2)
            .style(RcsbD3Constants.FILL, "none");
    }

    static move(config:MoveLineInterface){
        const line: string | null = config.line(config.points);
        if(line == null)
            throw "Line elements were not transformed";
        config.trackG.select(RcsbD3Constants.PATH)
            .attr(RcsbD3Constants.D, line);
    }
}