import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Selection, BaseType} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {MoveBlockInterface, PlotBlockInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3BlockManager";
import {RcsbFvTrackDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbBlockDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface{

	private dx: number = 0.5;

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void {
        super.plot(elements);
        const config: PlotBlockInterface = {
        	elements: elements,
        	dy: this._height*(2/3),
			dx: this.dx,
			y_o: this._height*(1/6),
			xScale: this.xScale,
			color: this._displayColor,
			height:this._height
		};
        this.d3Manager.plotBlockDisplay(config);
    }

    move(): void{
        const blocks: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = this.getElements();
		const config: MoveBlockInterface = {
			elements: blocks,
			dx: this.dx,
			xScale: this.xScale,
			height:this._height
		};
		this.d3Manager.moveBlockDisplay(config);
    }

}
