import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Selection, BaseType} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {
    MoveVlineInterface,
    PlotVlineInterface,
    RcsbD3VlineManager
} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3VlineManager";
import {RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";

export class RcsbVlineDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface{

    private rcsbD3VlineManager: RcsbD3VlineManager = new RcsbD3VlineManager();

    enter(e: Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined>): void{
        e.append<SVGLineElement>(RcsbD3Constants.LINE);
    }

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void {
        super.plot(elements);
        const config: PlotVlineInterface = {
            elements: elements,
            xScale: this.xScale,
            color: this._displayColor as string,
            height: this._height
        };
        this.rcsbD3VlineManager.plot(config);
    }

    move(): void{
        const config: MoveVlineInterface = {
            xScale: this.xScale,
        };
        this.rcsbD3VlineManager.move(config);
    }

}