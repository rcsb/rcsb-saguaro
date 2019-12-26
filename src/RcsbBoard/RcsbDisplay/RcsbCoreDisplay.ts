import {RcsbTrack} from "../RcsbTrack";
import * as classes from "../scss/RcsbBoard.module.scss";
import {Selection, BaseType, event, EnterElement} from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";
import {RcsbD3EventDispatcher} from "../RcsbD3/RcsbD3EventDispatcher";

export class RcsbCoreDisplay extends RcsbTrack{

    _displayColor: string = "#FF6666";
    mouseoutCallBack: ()=>void = ()=>{};

    setDisplayColor(color: string): void{
        this._displayColor = color;
    }

    reset(): void{
        this.g.selectAll("."+classes.rcsbElement).remove();
    }

    plot(element:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void{
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
            this.mouseoutCallBack();
        });
    }

    update(where: LocationViewInterface, compKey?: string) {

        const dataElems: RcsbFvTrackData = this._data as RcsbFvTrackData;
        if (dataElems === undefined || dataElems === null) {
            return;
        }

        let visSel: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
        let visElems: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;

        this.g.selectAll("path").remove();

        if (compKey !== undefined) {
            visSel = this.g.selectAll("."+classes.rcsbElement+"_" + compKey);
        } else {
            visSel = this.g.selectAll("."+classes.rcsbElement);
        }

        visElems = visSel.data(dataElems);

    	const newElem: Selection<EnterElement,RcsbFvTrackDataElementInterface,BaseType,undefined> = visElems.enter();

    	newElem
    	    .append("g")
    	    .attr("class", classes.rcsbElement)
    	    .classed(classes.rcsbElement+"_" + compKey, typeof compKey === "string")
    	    .call(this.plot.bind(this));

    	visElems.exit().remove();

    }

    getElements(compKey?: string): Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined> {
    	let elems: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
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
