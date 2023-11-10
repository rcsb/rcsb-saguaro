import {RcsbDisplayInterface, RcsbTrackInterface} from "./RcsbDisplayInterface";
import {LocationViewInterface} from "../RcsbBoard";
import {RcsbD3Manager} from "../RcsbD3/RcsbD3Manager";
import {
    RcsbFvColorGradient,
    RcsbFvTrackData,
    RcsbFvTrackDataElementInterface,
    RcsbFvTrackDataMap
} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbFvContextManager} from "../../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";
import {BaseType, Selection} from "d3-selection";
import {RcsbScaleInterface} from "../RcsbD3/RcsbD3ScaleFactory";
import {Subject} from "rxjs";

interface DisplayElementInterface {
    display: RcsbDisplayInterface;
    id: string;
}
export class RcsbCompositeDisplay implements RcsbDisplayInterface {

    private innerDisplays: Array<DisplayElementInterface> = new Array<DisplayElementInterface>();
    private _height: number;
    private _data: RcsbFvTrackDataMap;
    private _bgColor: string;
    private compositeHeight: number;

    setUpdateDataOnMove: (f:(d:LocationViewInterface)=>Promise<RcsbFvTrackData>)=>void;
    setMinRatio: (ratio: number) => void;
    setSelectDataInRange: (flag: boolean) => void;
    setHideEmptyTrack: (flag:boolean) =>  void;

    public readonly elementSubject: RcsbDisplayInterface["elementSubject"] = {
        mouseclick: new Subject(),
        mouseenter: new Subject(),
        mouseleave: new Subject(),
    };

    readonly trackSubject: RcsbTrackInterface["trackSubject"] = {
        mousemove: new Subject<{e: MouseEvent, n: number}>(),
        mouseenter: new Subject<MouseEvent>(),
        mouseleave: new Subject<MouseEvent>()
    }

    setCompositeHeight(h: number): void{
        this.compositeHeight = h;
    }

    reset(): void{
        this.innerDisplays.forEach(de=>{
            de.display.reset();
        });
    }

    init(scale:RcsbScaleInterface): void{
        this.innerDisplays.forEach((de)=>{
            de.display.init(scale, true, this.compositeHeight);
        });
    }

    update(): void{
        this.innerDisplays.forEach(de=>{
            de.display.update(de.id);
        });
    }

    displayEmpty(): void {
        this.innerDisplays.forEach(de=>{
            de.display.displayEmpty();
        });
    }

    move(): void{
        this.innerDisplays.forEach(de=>{
            de.display.move();
        });
    }

    moveSelection(mode:'select'|'hover'): void{
        this.innerDisplays.forEach(de=>{
            de.display.moveSelection(mode);
        });
    }

    addDisplay(displayId: string, display: RcsbDisplayInterface){
        this.innerDisplays.push({id: displayId, display: display} as DisplayElementInterface);
        this.trackSubject.mouseenter.subscribe(e=>display.trackSubject.mouseenter.next(e));
        this.trackSubject.mouseleave.subscribe(e=>display.trackSubject.mouseleave.next(e));
        this.trackSubject.mousemove.subscribe(e=>display.trackSubject.mousemove.next(e));
    }

    setManagers(d3Manager: RcsbD3Manager, contextManager: RcsbFvContextManager){
        this.innerDisplays.forEach(de=>{
            de.display.setManagers(d3Manager, contextManager);
        });
    }

    setBoardHighlight(f: (d:RcsbFvTrackDataElementInterface, operation:'set'|'add', mode:'select'|'hover', propFlag?: boolean) => void){
        this.innerDisplays.forEach(de=>{
            de.display.setBoardHighlight(f);
        });
    }

    subscribeElementHighlight(action: {enter: (d:RcsbFvTrackDataElementInterface)=>void; leave: (d:RcsbFvTrackDataElementInterface)=>void}): void{
        this.innerDisplays.forEach(de=>{
            de.display.subscribeElementHighlight(action);
        })
    }

    height(h?: number){
        if(typeof h === "number"){
            this._height = h;
        }
        this.innerDisplays.forEach(de=>{
            de.display.height(h);
        });
        return this._height;
    }

    trackColor(c?: string): string{
        if(typeof c === "string"){
            this._bgColor = c;
        }
        this.innerDisplays.forEach(de=>{
            de.display.trackColor(c);
        });
        return this._bgColor;
    }

    data(d?: RcsbFvTrackDataMap | RcsbFvTrackData): RcsbFvTrackDataMap{
        if(d != undefined) {
            const e: RcsbFvTrackDataMap = d as RcsbFvTrackDataMap;
            this._data = e;
            this.innerDisplays.forEach(de=>{
                const deData: RcsbFvTrackData | undefined = e.get(de.id);
                if(deData != undefined)
                    de.display.data(deData);
            });
        }
        return this._data;
    }

    highlightRegion(d:Array<RcsbFvTrackDataElementInterface> | null, options?:{color?:string, rectClass?: string;}): void {
        if(this.innerDisplays.length > 0 ){
            this.innerDisplays[0].display.highlightRegion(d,options);
        }
    }

    setDisplayColor(color: string | RcsbFvColorGradient): void {
    }

    plot:(element:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>)=>void;

}
