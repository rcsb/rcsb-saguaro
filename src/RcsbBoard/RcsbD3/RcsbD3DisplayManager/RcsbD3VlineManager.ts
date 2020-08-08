import {Selection, BaseType, select} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";
import {RcsbFvTrackDataElementInterface} from "../../../RcsbDataManager/RcsbDataManager";

export interface PlotVlineInterface {
    elements: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
    xScale: ScaleLinear<number,number>;
    color?: string;
    height: number;
}

export interface MoveVlineInterface {
    xScale: ScaleLinear<number,number>;
}

export class RcsbD3VlineManager {

    private lineElements: Selection<SVGLineElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = select<SVGLineElement, RcsbFvTrackDataElementInterface>(RcsbD3Constants.EMPTY);

    plot(config: PlotVlineInterface){
        this.lineElements = config.elements.append(RcsbD3Constants.LINE);
        this.lineElements.attr(RcsbD3Constants.X1, (d:RcsbFvTrackDataElementInterface) => {
                return config.xScale(d.begin);
            })
            .attr(RcsbD3Constants.X2, (d:RcsbFvTrackDataElementInterface)=> {
                return config.xScale(d.begin);
            })
            .attr(RcsbD3Constants.Y1, 0)
            .attr(RcsbD3Constants.Y2, config.height)
            .style(RcsbD3Constants.STROKE, config.color != undefined ? config.color : "#DDDDDD")
            .style(RcsbD3Constants.STROKE_WIDTH, 4);

    }

    move(config:MoveVlineInterface){
        this.lineElements.attr(RcsbD3Constants.X1, (d:RcsbFvTrackDataElementInterface) => {
                return config.xScale(d.begin);
            })
            .attr(RcsbD3Constants.X2, (d:RcsbFvTrackDataElementInterface) => {
                return config.xScale(d.begin);
            });
    }

}