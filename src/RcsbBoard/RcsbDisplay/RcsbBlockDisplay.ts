import {RcsbAbstractDisplay} from "./RcsbAbstractDisplay";
import {Selection, BaseType, select} from "d3-selection";
import {
	CircleDecoratorInterface, LineDecoratorInterface,
	MoveBlockInterface,
	PlotBlockInterface, PlotCircleInterface, PlotLineInterface,
	RcsbD3BlockManager
} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3BlockManager";
import {
	RcsbFvTrackData,
	RcsbFvTrackDataElementGapInterface,
	RcsbFvTrackDataElementInterface
} from "../../RcsbDataManager/RcsbDataManager";
import classes from "../../scss/RcsbBoard.module.scss";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";

export interface BlockElementInterface  {
	/**Alternative begin position for rects in block displays. It is used to split annotation into multiple rects when gaps are included*/
	rectBegin?: number;
	/**Alternative begin position for rects in block displays. It is used to split annotation into multiple rects when gaps are included*/
	rectEnd?: number;
}

export class RcsbBlockDisplay extends RcsbAbstractDisplay {

	private dx: number = 0.5;

	private lines: Selection<SVGGElement, LineDecoratorInterface, BaseType, undefined> = select<SVGGElement, LineDecoratorInterface>(RcsbD3Constants.EMPTY);
	private circles:Selection<SVGGElement, CircleDecoratorInterface, BaseType, undefined> = select<SVGGElement, CircleDecoratorInterface>(RcsbD3Constants.EMPTY);
	private circleDecorators: Array<CircleDecoratorInterface> = new Array<CircleDecoratorInterface>();
	private lineDecorators: Array<LineDecoratorInterface> = new Array<LineDecoratorInterface>();

	private rcsbD3BlockManager: RcsbD3BlockManager = new RcsbD3BlockManager();

	enter(e: Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined>): void{
		e.append<SVGRectElement>(RcsbD3Constants.RECT);
	}

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void {
		super.plot(elements);
		const config: PlotBlockInterface = {
			elements: this.getElements(),
			dy: this.height() * (2 / 3),
			dx: this.dx,
			y_o: this.height() * (1 / 6),
			xScale: this.xScale,
			color: this._displayColor as string,
			height: this.height()
		};
		this.rcsbD3BlockManager.plot(config);
		if (this.minRatio == 0 || this.getRatio() > this.minRatio)
			this.plotDecorators(elements.data());
		else
			this.removeDecorators();
	}

    move(): void{
		const config: MoveBlockInterface = {
			dx: this.dx,
			xScale: this.xScale,
			height: this.height()
		};
		this.rcsbD3BlockManager.move(config);
    }

    protected processData(dataElems: RcsbFvTrackData): RcsbFvTrackData<BlockElementInterface>{
        this.loadDecorators(dataElems);
		if( this.minRatio == 0 || this.getRatio()>this.minRatio) {
			const out: RcsbFvTrackData<BlockElementInterface> = new RcsbFvTrackData();
			dataElems.forEach(d => {
				if (d.gaps != null && d.gaps.length > 0) {
					const G: Array<RcsbFvTrackDataElementGapInterface> = d.gaps;
					out.push({...d, rectBegin: d.begin, rectEnd: G[0].begin});
					d.gaps.forEach((g, n) => {
						if (n + 1 < G.length) {
							out.push({...d, rectBegin: g.end, rectEnd: G[n + 1].begin});
						} else {
							out.push({...d, rectBegin: g.end, rectEnd: d.end});
						}
					});
				} else {
					out.push(d);
				}
			});
			return out;
		}
		return dataElems
	}

	protected static dataKey(d:RcsbFvTrackDataElementInterface & BlockElementInterface): string{
		if(d.rectBegin && d.rectEnd)
			return d.rectBegin+":"+d.rectEnd;
		return d.begin+":"+d.end;
	}

	private loadDecorators(features:Array<RcsbFvTrackDataElementInterface>) {
    	this.circleDecorators.length = 0;
		this.lineDecorators.length = 0;
		if( this.minRatio == 0 || this.getRatio()>this.minRatio) {
			features.filter(d => {
				return (d.openBegin || d.openEnd || d.gaps);
			}).forEach(d => {
				if (d.openBegin) {
					this.circleDecorators.push({
						position: d.begin,
						shift: -1,
						color: d.color
					});
				}
				if (d.openEnd && d.end != null)
					this.circleDecorators.push({
						position: d.end,
						shift: 1,
						color: d.color

					});
				if (d.gaps != null)
					d.gaps.forEach(g => {
						if (g.begin == g.end + 1)
							this.circleDecorators.push({
								position: g.begin,
								shift: 1,
								color: d.color
							})
						this.lineDecorators.push({
							begin: g.begin,
							end: g.end,
							color: d.color
						});
						if (!g.isConnected) {
							this.circleDecorators.push({
								position: g.begin,
								shift: 1,
								color: d.color
							});
							this.circleDecorators.push({
								position: g.end,
								shift: -1,
								color: d.color
							});
						}
					});
			});
		}
	}

	private plotDecorators(features:Array<RcsbFvTrackDataElementInterface>): void{
		const lines: Selection<SVGGElement, LineDecoratorInterface, BaseType, undefined> = this.g.selectAll<SVGGElement,LineDecoratorInterface>("."+classes.rcsbDecorator+"_line")
			.data(this.lineDecorators, (l: LineDecoratorInterface)=>{
				return l.begin+":"+l.end;
			});
		const newLines: Selection<SVGGElement, LineDecoratorInterface, BaseType, undefined> = lines.enter()
			.append("g").attr("class", classes.rcsbDecorator)
			.classed(classes.rcsbDecorator+"_line", true);
		newLines.append(RcsbD3Constants.LINE);
		lines.exit().remove();
		this.lines = lines.merge(newLines);

		const circles:Selection<SVGGElement, CircleDecoratorInterface, BaseType, undefined> = this.g.selectAll<SVGGElement,CircleDecoratorInterface>("."+classes.rcsbDecorator+"_circle")
			.data(this.circleDecorators, (c: CircleDecoratorInterface)=>{
				return c.position.toString();
			});
		const newCircles:Selection<SVGGElement, CircleDecoratorInterface, BaseType, undefined> = circles.enter()
			.append("g")
			.classed(classes.rcsbDecorator+"_circle", true);
		newCircles.append(RcsbD3Constants.CIRCLE);
		circles.exit().remove();
		this.circles = circles.merge(newCircles);

		const circleConfig: PlotCircleInterface = {
			elements: this.circles,
			dy: this.height()*(2/3),
			dx: this.dx,
			xScale: this.xScale,
			color: this._displayColor as string,
			height:this.height()
		};
		const lineConfig: PlotLineInterface = {
			elements: this.lines,
			y_o: this.height()*(1/6),
			dy: this.height()*(2/3),
			dx: this.dx,
			xScale: this.xScale,
			color: this._displayColor as string,
			height:this.height()
		}
		this.rcsbD3BlockManager.plotDecorators(circleConfig, lineConfig);
	}

	private removeDecorators(): void{
		this.lines.remove();
		this.circles.remove();
	}
}
