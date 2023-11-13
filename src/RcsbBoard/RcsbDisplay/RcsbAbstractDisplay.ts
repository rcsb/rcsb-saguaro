import {RcsbAbstractTrack} from "./RcsbAbstractTrack";
import classes from "../../scss/RcsbBoard.module.scss";
import {Selection, BaseType, select } from "d3-selection";
import {LocationViewInterface} from "../RcsbBoard";
import {
    RcsbFvColorGradient,
    RcsbFvTrackData,
    RcsbFvTrackDataElementInterface
} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbD3EventDispatcher} from "../RcsbD3/RcsbD3EventDispatcher";
import {RcsbD3Constants} from "../RcsbD3/RcsbD3Constants";
import {EventType} from "../../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";
import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {Subject} from "rxjs";

export abstract class RcsbAbstractDisplay extends RcsbAbstractTrack implements RcsbDisplayInterface {

    protected _displayColor: string  | RcsbFvColorGradient = "#FF6666";
    private readonly trackId: string;
    protected minRatio: number = 0;
    private selectDataInRangeFlag: boolean = false;
    private hideEmptyTracksFlag: boolean = false;
    private hidden = false;
    private elementSelection: Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = select<SVGGElement, RcsbFvTrackDataElementInterface>(RcsbD3Constants.EMPTY);

    public readonly elementSubject: RcsbDisplayInterface["elementSubject"] = {
        mouseclick: new Subject(),
        mouseenter: new Subject(),
        mouseleave: new Subject(),
    };

    constructor(boardId: string, trackId: string) {
        super();
        this.trackId = trackId;
    }

    setDisplayColor(color: string  | RcsbFvColorGradient): void{
        this._displayColor = color;
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

    public subscribeElementHighlight(action: {enter: (d:RcsbFvTrackDataElementInterface)=>void; leave: (d:RcsbFvTrackDataElementInterface)=>void}){
        this.elementSubject.mouseenter.subscribe(({d,e})=>action.enter(d));
        this.elementSubject.mouseleave.subscribe(({d,e})=>action.leave(d));
    }

    plot(element:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void{
        element.on(RcsbD3Constants.CLICK, (event: MouseEvent, d: RcsbFvTrackDataElementInterface)=> {
            if (event.defaultPrevented)
                return;

            this.elementSubject.mouseclick.next({d, e: event});
            d.elementClickCallBack?.(d, event);
            RcsbD3EventDispatcher.elementClick(event, this.getBoardHighlight(),d);
        });
        element.on(RcsbD3Constants.MOUSE_ENTER, (event: MouseEvent, d: RcsbFvTrackDataElementInterface) => {
            if (event.defaultPrevented)
                return;

            this.elementSubject.mouseenter.next({d, e: event});
        });
        element.on(RcsbD3Constants.DBL_CLICK, (event: MouseEvent, d: RcsbFvTrackDataElementInterface) => {
            if (event.defaultPrevented)
                return;

        });
        element.on(RcsbD3Constants.MOUSE_LEAVE, (event: MouseEvent, d: RcsbFvTrackDataElementInterface) => {
            if (event.defaultPrevented) {
                return;
            }
            this.elementSubject.mouseleave.next({d, e: event});
        });
    }

    update(compKey?: string): void {
        const where: LocationViewInterface = {from:Math.floor(this.xScale.domain()[0]),to:Math.ceil(this.xScale.domain()[1])}
        if(typeof this.updateDataOnMove === "function"){
            this.updateDataOnMove(where).then((result:RcsbFvTrackData)=>{
                this.data(result);
                if(this.data() != null) {
                    this._update(where, compKey);
                }else{
                    this.displayEmpty()
                }
            }).catch((error)=>{
                console.error(error);
            });
        }else{
            if (this.data() == null) {
                this.displayEmpty();
                return;
            }
            this._update(where, compKey);
        }
    }

    _update(where: LocationViewInterface, compKey?: string):void {
        if (this.selectDataInRangeFlag) {
            let dataElems: RcsbFvTrackData = this.processData(this.data().filter((s: RcsbFvTrackDataElementInterface, i: number) => {
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
            let dataElems: RcsbFvTrackData = this.processData(this.data());
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

    displayEmpty (): void{
    };

    move(): void {
    };

    protected processData(dataElems: RcsbFvTrackData): RcsbFvTrackData{
       return dataElems;
    }

    protected selectElements(dataElems: RcsbFvTrackData, compKey?: string): Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined> {
        const className:string  = typeof compKey === "string" ? "."+classes.rcsbElement+"_" + compKey : "."+classes.rcsbElement;
        const elements:Selection<SVGGElement, RcsbFvTrackDataElementInterface, BaseType, undefined> = this.g.selectAll<SVGGElement,RcsbFvTrackDataElementInterface>(className).data(dataElems, RcsbAbstractDisplay.dataKey);
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
        return d.begin+":"+d.end;
    }

    protected getRatio(): number{
        const xScale = this.xScale;
        return (xScale.range()[1]-xScale.range()[0])/(xScale.domain()[1]-xScale.domain()[0]);
    }



}
