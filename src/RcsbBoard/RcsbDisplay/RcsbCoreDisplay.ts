import {RcsbTrack} from "../RcsbTrack";
import * as classes from "../scss/RcsbBoard.module.scss";
import {Selection, BaseType, event, EnterElement} from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {
    RcsbFvColorGradient,
    RcsbFvTrackData,
    RcsbFvTrackDataElementInterface
} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbD3EventDispatcher} from "../RcsbD3/RcsbD3EventDispatcher";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";
import {RcsbTooltipManager} from "../RcsbTooltip/RcsbTooltipManager";

export abstract class RcsbCoreDisplay extends RcsbTrack{

    protected _displayColor: string  | RcsbFvColorGradient = "#FF6666";
    elementClickCallBack: (d?:RcsbFvTrackDataElementInterface)=>void;
    elementEnterCallBack: (d?:RcsbFvTrackDataElementInterface)=>void;
    includeTooltip: boolean = true;
    updateDataOnMove:(d:LocationViewInterface)=>Promise<RcsbFvTrackData>;
    private boardId: string;
    protected tooltipManager: RcsbTooltipManager;

    private performance: boolean = false;

    constructor(boardId: string) {
        super();
        this.boardId = boardId;
        this.tooltipManager = new RcsbTooltipManager(boardId);
    }

    setElementClickCallBack(f:(d?:RcsbFvTrackDataElementInterface)=>void): void{
        this.elementClickCallBack = f;
    }

    setElementEnterCallBack(f:(d?:RcsbFvTrackDataElementInterface)=>void): void{
        this.elementEnterCallBack = f;
    }

    setTooltip(flag: boolean): void{
        this.includeTooltip = flag;
    }

    setUpdateDataOnMove( f:(d:LocationViewInterface)=>Promise<RcsbFvTrackData> ): void{
       this.updateDataOnMove = f;
    }

    setBoardId(name: string): void{
        this.boardId = name;
    }

    setDisplayColor(color: string  | RcsbFvColorGradient): void{
        this._displayColor = color;
    }

    reset(): void{
        this.g.selectAll("."+classes.rcsbElement).remove();
    }

    plot(element:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void{
        element.on(RcsbD3Constants.CLICK, (d)=> {
            if (event.defaultPrevented) {
                return;
            }
            if(typeof this.elementClickCallBack === "function") {
                this.elementClickCallBack(d);
            }
            RcsbD3EventDispatcher.elementClick(this.getBoardHighlight(),d);
        });
        element.on(RcsbD3Constants.MOUSE_ENTER, (d, i) => {
            if (event.defaultPrevented) {
                return;
            }
            if(typeof this.elementEnterCallBack === "function") {
                this.elementEnterCallBack(d);
            }
            if(this.includeTooltip){
                this.tooltipManager.showTooltip(d);
                this.tooltipManager.showTooltipDescription(d);
            }
        });
        element.on(RcsbD3Constants.DBL_CLICK, (d, i) => {
            if (event.defaultPrevented) {
                return;
            }
        });
        element.on(RcsbD3Constants.MOUSE_LEAVE, (d, i) => {
            if (event.defaultPrevented) {
                return;
            }
            if(this.includeTooltip){
                this.tooltipManager.hideTooltip();
            }
        });
    }

    update(where: LocationViewInterface, compKey?: string) {
        if(typeof this.updateDataOnMove === "function"){
            this.updateDataOnMove(where).then(result=>{
                this.load(result);
                if(this._data != null) {
                    this._update(where, compKey);
                }
            }).catch((error)=>{
                console.error(error);
            });
        }else{
            if (this._data === undefined || this._data === null) {
                return;
            }
            this._update(where, compKey);
        }
    }

    _update(where: LocationViewInterface, compKey?: string) {

        let dataElems: RcsbFvTrackData = this._data;
        if(this.performance) {
            dataElems = this._data.filter((s: RcsbFvTrackDataElementInterface, i: number) => {
                if(s.end == null){
                    return (s.begin >= where.from);
                }else{
                    return !(s.begin > where.to || s.end < where.from);
                }
            });
        }

        let visSel: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;
        let visElems: Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>;

        //TODO this cannot be done in that way!!!!!
        //this.g.selectAll("path").remove();

        if (compKey != undefined) {
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
