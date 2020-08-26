import {RcsbTrack} from "../RcsbTrack";
import * as classes from "../scss/RcsbBoard.module.scss";
import {Selection, BaseType, event, select, EnterElement } from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {
    RcsbFvColorGradient,
    RcsbFvTrackData,
    RcsbFvTrackDataElementInterface
} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbD3EventDispatcher} from "../RcsbD3/RcsbD3EventDispatcher";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";
import {RcsbTooltipManager} from "../RcsbTooltip/RcsbTooltipManager";
import {EventType} from "../../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";

export abstract class RcsbCoreDisplay extends RcsbTrack{

    protected _displayColor: string  | RcsbFvColorGradient = "#FF6666";
    elementClickCallBack: (d?:RcsbFvTrackDataElementInterface)=>void;
    elementEnterCallBack: (d?:RcsbFvTrackDataElementInterface)=>void;
    includeTooltip: boolean = true;
    updateDataOnMove:(d:LocationViewInterface)=>Promise<RcsbFvTrackData>;
    private readonly boardId: string;
    private readonly trackId: string;
    protected tooltipManager: RcsbTooltipManager;
    protected minRatio: number = 0;
    private selectDataInRangeFlag: boolean = false;
    private hideEmptyTracksFlag: boolean = false;
    private hidden = false;

    private elementSelection: Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = select<SVGGElement, RcsbFvTrackDataElementInterface>(RcsbD3Constants.EMPTY);

    constructor(boardId: string, trackId: string) {
        super();
        this.boardId = boardId;
        this.trackId = trackId;
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

    setDisplayColor(color: string  | RcsbFvColorGradient): void{
        this._displayColor = color;
    }

    getDisplayColor(): string|RcsbFvColorGradient{
        return this._displayColor;
    }

    setMinRatio(ratio: number): void{
        this.minRatio = ratio;
    }

    setSelectDataInRange(flag: boolean): void{
        this.selectDataInRangeFlag = flag;
    }

    setHideEmptyTrack(flag:boolean): void {
        this.hideEmptyTracksFlag = flag;
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

    update(compKey?: string) {
        const where: LocationViewInterface = {from:this.xScale.domain()[0],to:this.xScale.domain()[1]}
        if(typeof this.updateDataOnMove === "function"){
            this.updateDataOnMove(where).then((result:RcsbFvTrackData)=>{
                this.load(result);
                if(this.getData() != null) {
                    this._update(where, compKey);
                }
            }).catch((error)=>{
                console.error(error);
            });
        }else{
            if (this.getData() == null) {
                return;
            }
            this._update(where, compKey);
        }
    }

    _update(where: LocationViewInterface, compKey?: string):void {
        if (this.selectDataInRangeFlag) {
            let dataElems: RcsbFvTrackData = this.processData(this.getData().filter((s: RcsbFvTrackDataElementInterface, i: number) => {
                if (s.end == null) {
                    return (s.begin >= where.from && s.begin <= where.to);
                } else {
                    return !(s.begin > where.to || s.end < where.from);
                }
            }));
            if(this.hideEmptyTracksFlag) {
                if (dataElems.length == 0 && !this.hidden) {
                    this.contextManager.next({
                        eventType: EventType.TRACK_HIDE,
                        eventData: {trackId: this.trackId, visibility: false}
                    });
                    this.hidden = true;
                } else if (dataElems.length > 0 && this.hidden) {
                    this.contextManager.next({
                        eventType: EventType.TRACK_HIDE,
                        eventData: {trackId: this.trackId, visibility: true}
                    });
                    this.hidden = false;
                }
            }
            this.selectElements(dataElems,compKey)
                .attr("class", classes.rcsbElement)
                .classed(classes.rcsbElement + "_" + compKey, typeof compKey === "string")
                .call(this.plot.bind(this));
        }else if( (this.minRatio == 0 || this.getRatio()>this.minRatio) && !this.isDataUpdated() ){
            let dataElems: RcsbFvTrackData = this.processData(this.getData());
            this.selectElements(dataElems,compKey)
                .attr("class", classes.rcsbElement)
                .classed(classes.rcsbElement + "_" + compKey, typeof compKey === "string")
                .call(this.plot.bind(this));
            this.setDataUpdated(true);

        }else if(this.minRatio > 0 && this.getRatio()<=this.minRatio){
            this.getElements().remove();
            this.setDataUpdated(false);
        }
    }

    processData(dataElems: RcsbFvTrackData): RcsbFvTrackData{
       return dataElems;
    }

    protected selectElements(dataElems: RcsbFvTrackData, compKey?: string): Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined> {
        const className:string  = typeof compKey === "string" ? "."+classes.rcsbElement+"_" + compKey : "."+classes.rcsbElement;
        const elements:Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = this.g.selectAll<SVGGElement,RcsbFvTrackDataElementInterface>(className).data(dataElems, RcsbCoreDisplay.dataKey);
        const newElems:Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = elements.enter()
            .append<SVGGElement>(RcsbD3Constants.G)
            .attr("class", classes.rcsbElement)
            .classed(classes.rcsbElement + "_" + compKey, typeof compKey === "string");
        newElems.call(this.enter);
        elements.exit().remove();
        this.elementSelection = elements.merge(newElems);
        return this.elementSelection;
    }

    enter(e: Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined>): void{
    }

    getElements(): Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined>{
        return this.elementSelection;
    }

    protected static dataKey(d:RcsbFvTrackDataElementInterface): string{
        if(d.rectBegin && d.rectEnd)
            return d.rectBegin+":"+d.rectEnd;
        return d.begin+":"+d.end;
    }

    protected getRatio(): number{
        const xScale = this.xScale;
        return (xScale.range()[1]-xScale.range()[0])/(xScale.domain()[1]-xScale.domain()[0]);
    }

}
