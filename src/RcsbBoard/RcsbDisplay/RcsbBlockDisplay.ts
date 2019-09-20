import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Selection, BaseType} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {MoveBlockInterface, PlotBlockInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3BlockManager";

export class RcsbBlockDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface{

	dx: number = 0.5;

    plot(elements:Selection<SVGGElement,any,null,undefined>): void {
        super.plot(elements);
        const config: PlotBlockInterface = {
        	elements: elements,
        	dy: this._height*(2/3),
			dx: this.dx,
			y_o: this._height*(1/6),
			xScale: this.xScale,
			color: this._displayColor
		};
        this.d3Manager.plotBlockDisplay(config);
    }

    move(): void{
        const blocks: Selection<SVGGElement,any,BaseType,undefined> = this.getElements();
		const config: MoveBlockInterface = {
			elements: blocks,
			dx: this.dx,
			xScale: this.xScale,
		};
		this.d3Manager.moveBlockDisplay(config);
    }

}
