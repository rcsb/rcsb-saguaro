import {RcsbTrack} from "../RcsbTrack";
import * as classes from "../scss/RcsbBoard.module.scss";
import {Selection, BaseType, event, EnterElement} from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {RcsbFvData, RcsbFvDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";
import {RcsbD3EventDispatcher} from "../RcsbD3/RcsbD3EventDispatcher";

export class RcsbCoreDisplay extends RcsbTrack{

    _displayColor: string = "#FF6666";

    setDisplayColor(color: string): void{
        this._displayColor = color;
    }

    reset(): void{
        this.g.selectAll("."+classes.rcsbElement).remove();
    }

    plot(element:Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined>): void{
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

    update(where: LocationViewInterface, compKey?: string) {

        const dataElems: RcsbFvData = this._data as RcsbFvData;
        if (dataElems === undefined) {
            return;
        }

        let visSel: Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined>;
        let visElems: Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined>;

        this.g.selectAll("path").remove();

        if (compKey !== undefined) {
            visSel = this.g.selectAll("."+classes.rcsbElement+"_" + compKey);
        } else {
            visSel = this.g.selectAll("."+classes.rcsbElement);
        }

        visElems = visSel.data(dataElems);

    	const newElem: Selection<EnterElement,RcsbFvDataElementInterface,BaseType,undefined> = visElems.enter();

    	newElem
    	    .append("g")
    	    .attr("class", classes.rcsbElement)
    	    .classed(classes.rcsbElement+"_" + compKey, typeof compKey === "string")
    	    .call(this.plot.bind(this));

    	visElems.exit().remove();

    }

    getElements(compKey?: string): Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined> {
    	let elems: Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined>;
    	// TODO: Is selecting the elements to move too slow?
    	// It would be nice to profile
    	if (typeof compKey === "string") {
    	    elems = this.g.selectAll("."+classes.rcsbElement+"_" + compKey);
    	} else {
    	    elems = this.g.selectAll("."+classes.rcsbElement);
    	}
        return elems;
    }

}
