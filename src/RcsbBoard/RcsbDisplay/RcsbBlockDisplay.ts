import {RcsbCoreDisplay} from "./RcsbCoreDisplay";
import {Selection, BaseType, select} from "d3-selection";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
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
import * as classes from "../scss/RcsbBoard.module.scss";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";

export class RcsbBlockDisplay extends RcsbCoreDisplay implements RcsbDisplayInterface{

	private dx: number = 0.5;

	private lines: Selection<SVGGElement, LineDecoratorInterface, BaseType, undefined> = select<SVGGElement, LineDecoratorInterface>(RcsbD3Constants.EMPTY);
	private circles:Selection<SVGGElement, CircleDecoratorInterface, BaseType, undefined> = select<SVGGElement, CircleDecoratorInterface>(RcsbD3Constants.EMPTY);
	private circleDecorators: Array<CircleDecoratorInterface> = new Array<CircleDecoratorInterface>();
	private lineDecorators: Array<LineDecoratorInterface> = new Array<LineDecoratorInterface>();

	private rcsbD3BlockManager: RcsbD3BlockManager = new RcsbD3BlockManager();

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void {
        super.plot(elements);
        const config: PlotBlockInterface = {
        	elements: elements,
        	dy: this._height*(2/3),
			dx: this.dx,
			y_o: this._height*(1/6),
			xScale: this.xScale,
			color: this._displayColor as string,
			height:this._height
		};
        this.rcsbD3BlockManager.plot(config);
		this.plotDecorators(elements.data());
    }

    move(): void{
		const config: MoveBlockInterface = {
			dx: this.dx,
			xScale: this.xScale,
			height: this._height
		};
		this.rcsbD3BlockManager.move(config);
    }

    processData(dataElems: RcsbFvTrackData): RcsbFvTrackData{
        this.loadDecorators(dataElems);
		const out: RcsbFvTrackData = new RcsbFvTrackData();
		dataElems.forEach(d=>{
			if(d.gaps!=null && d.gaps.length > 0){
				const G: Array<RcsbFvTrackDataElementGapInterface> = d.gaps;
				out.push({...d,rectBegin:d.begin,rectEnd:G[0].begin});
				d.gaps.forEach((g,n)=>{
					if(n+1<G.length){
						out.push({...d,rectBegin:g.end,rectEnd:G[n+1].begin});
					}else{
						out.push({...d,rectBegin:g.end,rectEnd:d.end});
					}
				});
			}else{
				out.push(d);
			}
		});
		return out;
	}

	private loadDecorators(features:Array<RcsbFvTrackDataElementInterface>) {
    	this.circleDecorators.length = 0;
		this.lineDecorators.length = 0;
		features.filter(d => {
			return (d.openBegin != null || d.openEnd != null || d.gaps);
		}).forEach(d => {
			if (d.openBegin != null) {
				this.circleDecorators.push({
					position: d.begin,
					shift: -1,
					color: d.color
				});
			}
			if (d.openEnd != null && d.end != null)
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

	private plotDecorators(features:Array<RcsbFvTrackDataElementInterface>){
		this.lines = this.g.selectAll<SVGGElement,LineDecoratorInterface>("."+classes.rcsbDecorator+"_line")
			.data(this.lineDecorators)
			.enter()
			.append("g");
		this.lines.attr("class", classes.rcsbDecorator)
			.classed(classes.rcsbDecorator+"_line", true);

		this.circles = this.g.selectAll<SVGGElement,CircleDecoratorInterface>("."+classes.rcsbDecorator+"_circle")
			.data(this.circleDecorators)
			.enter()
			.append("g");
		this.circles.attr("class", classes.rcsbDecorator)
			.classed(classes.rcsbDecorator+"_circle", true);

		this.lines.exit().remove();
		this.circles.exit().remove();

		const circleConfig: PlotCircleInterface = {
			elements: this.circles,
			dy: this._height*(2/3),
			dx: this.dx,
			xScale: this.xScale,
			color: this._displayColor as string,
			height:this._height
		};
		const lineConfig: PlotLineInterface = {
			elements: this.lines,
			y_o: this._height*(1/6),
			dy: this._height*(2/3),
			dx: this.dx,
			xScale: this.xScale,
			color: this._displayColor as string,
			height:this._height
		}
		this.rcsbD3BlockManager.plotDecorators(circleConfig, lineConfig);
	}
}
