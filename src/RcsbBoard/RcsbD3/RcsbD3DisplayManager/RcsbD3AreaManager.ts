import {Selection} from "d3-selection";
import {Area} from "d3-shape";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";
import classes from "../../scss/RcsbBoard.module.scss";

export interface ClearAreaInterface {
    trackG: Selection<SVGGElement,any,null,undefined>;
}

export interface PlotAreaInterface {
    points: RcsbFvTrackDataElementInterface[];
    color: string;
    trackG: Selection<SVGGElement,any,null,undefined>;
    area:Area<RcsbFvTrackDataElementInterface>;
    id:string;
    clickCallBack: (event:MouseEvent)=>void;
    opacity?: number;
}

export interface MoveAreaInterface {
    points: RcsbFvTrackDataElementInterface[];
    trackG: Selection<SVGGElement,any,null,undefined>;
    area:Area<RcsbFvTrackDataElementInterface>
    id:string;
}

export interface PlotAxisInterface {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    trackG: Selection<SVGGElement,any,null,undefined>;
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
            .style(RcsbD3Constants.FILL_OPACITY,config.opacity ?? .2)
            .style(RcsbD3Constants.FILL, config.color)
            .attr(RcsbD3Constants.CLASS, classes.rcsbArea)
            .on(RcsbD3Constants.CLICK, (event: MouseEvent)=>{
                config.clickCallBack(event);
            });
    }

    static plotAxis(config: PlotAxisInterface){
        config.trackG.select(RcsbD3Constants.LINE).remove();
        config.trackG.append(RcsbD3Constants.LINE)
            .style(RcsbD3Constants.STROKE, "#CCC")
            .attr(RcsbD3Constants.STROKE_DASH,"2 1")
            .attr(RcsbD3Constants.X1, config.x1)
            .attr(RcsbD3Constants.X2, config.x2)
            .attr(RcsbD3Constants.Y1, config.y1)
            .attr(RcsbD3Constants.Y2, config.y2);
    }

    static move(config:MoveAreaInterface){
        config.trackG.select(RcsbD3Constants.PATH+"#"+config.id)
            .datum(config.points)
            .attr(RcsbD3Constants.D, config.area);
    }
}