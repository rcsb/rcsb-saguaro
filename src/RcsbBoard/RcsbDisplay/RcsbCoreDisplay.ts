import {RcsbTrack} from "../RcsbTrack";
import * as classes from "../scss/RcsbBoard.module.scss";
import {Selection, BaseType, event, EnterElement} from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {ScaleLinear} from "d3-scale";
import {HighlightRegionInterface} from "../RcsbD3/RcsbD3Manager";
import {RcsbFvData} from "../../RcsbFv/RcsbFvTrack/RcsbFvDataManager";
import {RcsbD3EventDispatcher} from "../RcsbD3/RcsbD3EventDispatcher";

export class RcsbCoreDisplay extends RcsbTrack{

    _displayColor: string = "#FF6666";

    setDisplayColor(color: string): void{
        this._displayColor = color;
    }

    reset(): void{
        this.g.selectAll("."+classes.rcsbElement).remove();
    }

    plot(element:Selection<SVGGElement,any,BaseType,undefined>): void{

        element.on("click", (d)=> {
            if (event.defaultPrevented) {
                return;
            }
            RcsbD3EventDispatcher.elementClick(this._boardHighlight.bind(this),d);
        });
        element.on("mouseover", (d, i) => {
            if (event.defaultPrevented) {
                return;
            }
        });
        element.on("dblclick", (d, i) => {
            if (event.defaultPrevented) {
                return;
            }
        });
        element.on("mouseout", (d, i) => {
            if (event.defaultPrevented) {
                return;
            }
        });
    }

    highlightRegion(begin: number, end:number): void {

        this.g.select("."+classes.rcsbSelectRect).remove();

        const height: number = this._height;
        const xScale: ScaleLinear<number,number> = this.xScale;

        if(typeof(height)==="number" && typeof(begin)==="number" && typeof(end)==="number") {
            const highlightRegConfig: HighlightRegionInterface = {
                trackG: this.g,
                height: height,
                begin: begin,
                end: end,
                xScale: xScale,
                rectClass: classes.rcsbSelectRect
            };
            this.d3Manager.highlightRegion(highlightRegConfig);
        }

        const selectRect:SVGRectElement = this.g.selectAll<SVGRectElement,any>("."+classes.rcsbSelectRect).node();
        if(selectRect) {
            this.moveToBack(selectRect);
        }
    }

    update(where: LocationViewInterface, compKey?: string) {

        const dataElems: RcsbFvData = this._data as RcsbFvData;
        if (dataElems === undefined) {
            return;
        }

        let visSel: Selection<SVGGElement,any,BaseType,undefined>;
        let visElems: Selection<SVGGElement,any,BaseType,undefined>;

        this.g.selectAll("path").remove();

        if (compKey !== undefined) {
            visSel = this.g.selectAll("."+classes.rcsbElement+"_" + compKey);
        } else {
            visSel = this.g.selectAll("."+classes.rcsbElement);
        }

        visElems = visSel.data(dataElems);

    	const newElem: Selection<EnterElement,any,BaseType,undefined> = visElems.enter();

    	newElem
    	    .append("g")
    	    .attr("class", classes.rcsbElement)
    	    .classed(classes.rcsbElement+"_" + compKey, typeof compKey === "string")
    	    .call(this.plot.bind(this));

    	visElems.exit().remove();

    }

    getElements(compKey?: string): Selection<SVGGElement,any,BaseType,undefined> {
    	let elems: Selection<SVGGElement,any,BaseType,undefined>;
    	// TODO: Is selecting the elements to move too slow?
    	// It would be nice to profile
    	if (typeof compKey === "string") {
    	    elems = this.g.selectAll("."+classes.rcsbElement+"_" + compKey);
    	} else {
    	    elems = this.g.selectAll("."+classes.rcsbElement);
    	}
        return elems;
    }

    moveToFront(elem: HTMLElement|SVGElement): void {
        elem.parentNode.appendChild(elem);
    };

    moveToBack(elem: HTMLElement|SVGElement): void {
        elem.parentNode.prepend(elem);
    };

}
