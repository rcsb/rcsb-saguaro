import {Selection} from "d3-selection";
import {Line} from "d3-shape";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbD3DisplayManagerInterface} from "./RcsbD3DisplayManagerInterface"
import {RcsbFvTrackDataElementInterface} from "../../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export interface PlotLineInterface {
    points: RcsbFvTrackDataElementInterface[];
    color: string;
    trackG: Selection<SVGGElement,any,null,undefined>;
    line:Line<RcsbFvTrackDataElementInterface>
}

export interface MoveLineInterface {
    points: RcsbFvTrackDataElementInterface[];
    trackG: Selection<SVGGElement,any,null,undefined>;
    line:Line<RcsbFvTrackDataElementInterface>
}

export class RcsbD3LineManager implements RcsbD3DisplayManagerInterface{

    plot(config: PlotLineInterface){
        config.trackG.select(RcsbD3Constants.PATH).remove();
        config.trackG.append(RcsbD3Constants.PATH)
            .attr(RcsbD3Constants.D, config.line(config.points))
            .style(RcsbD3Constants.STROKE, config.color)
            .style(RcsbD3Constants.STROKE_WIDTH, 2)
            .style(RcsbD3Constants.FILL, "none");
    }

    move(config:MoveLineInterface){
        config.trackG.select(RcsbD3Constants.PATH)
            .attr(RcsbD3Constants.D, config.line(config.points));
    }
}