import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
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

    public setUpdateDataOnMove: (f:(d:LocationViewInterface)=>Promise<RcsbFvTrackData>)=>void;
    public setMinRatio: (ratio: number) => void;
    public setSelectDataInRange: (flag: boolean) => void;
    public setHideEmptyTrack: (flag:boolean) =>  void;

    public readonly mouseoutSubject: Subject<{event: MouseEvent;}> = new Subject();
    public readonly mouseoverSubject: Subject<{event: MouseEvent;}> = new Subject();
    public readonly mousemoveSubject: Subject<{position:number; event: MouseEvent;}> = new Subject();

    public readonly elementEnterSubject: Subject<{ element: RcsbFvTrackDataElementInterface; event: MouseEvent; }> = new Subject();
    public readonly elementLeaveSubject: Subject<{ element: RcsbFvTrackDataElementInterface; event: MouseEvent; }> = new Subject();
    public readonly elementClickSubject: Subject<{ element: RcsbFvTrackDataElementInterface; event: MouseEvent; }> = new Subject();
    public readonly highlightEnterSubject: Subject<{element:RcsbFvTrackDataElementInterface; event: MouseEvent;}> = new Subject();
    public readonly highlightLeaveSubject: Subject<{element:RcsbFvTrackDataElementInterface; event: MouseEvent;}> = new Subject();

    public setCompositeHeight(h: number): void{
        this.compositeHeight = h;
    }

    public reset(): void{
        this.innerDisplays.forEach(de=>{
            de.display.reset();
        });
    }

    public init(scale:RcsbScaleInterface): void{
        this.innerDisplays.forEach((de)=>{
            de.display.init(scale, true, this.compositeHeight);
        });
    }

    public update(): void{
        this.innerDisplays.forEach(de=>{
            de.display.update(de.id);
        });
    }

    public displayEmpty(): void {
        this.innerDisplays.forEach(de=>{
            de.display.displayEmpty();
        });
    }

    public move(): void{
        this.innerDisplays.forEach(de=>{
            de.display.move();
        });
    }

    public moveSelection(mode:'select'|'hover'): void{
        this.innerDisplays.forEach(de=>{
            de.display.moveSelection(mode);
        });
    }

    public addDisplay(displayId: string, display: RcsbDisplayInterface){
        this.innerDisplays.push({id: displayId, display: display} as DisplayElementInterface);
        this.mouseoutSubject.subscribe(d=>display.mouseoutSubject.next(d));
        this.mouseoverSubject.subscribe(d=>display.mouseoverSubject.next(d));
        this.mousemoveSubject.subscribe(d=>display.mousemoveSubject.next(d));
    }

    public setManagers(d3Manager: RcsbD3Manager, contextManager: RcsbFvContextManager){
        this.innerDisplays.forEach(de=>{
            de.display.setManagers(d3Manager, contextManager);
        });
    }

    public setBoardHighlight(f: (d:RcsbFvTrackDataElementInterface, operation:'set'|'add', mode:'select'|'hover', propFlag?: boolean) => void){
        this.innerDisplays.forEach(de=>{
            de.display.setBoardHighlight(f);
        });
    }

    public height(h?: number){
        if(typeof h === "number"){
            this._height = h;
        }
        this.innerDisplays.forEach(de=>{
            de.display.height(h);
        });
        return this._height;
    }

    public trackColor(c?: string): string{
        if(typeof c === "string"){
            this._bgColor = c;
        }
        this.innerDisplays.forEach(de=>{
            de.display.trackColor(c);
        });
        return this._bgColor;
    }

    public data(d?: RcsbFvTrackDataMap | RcsbFvTrackData): RcsbFvTrackDataMap{
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

    public highlightRegion(d:Array<RcsbFvTrackDataElementInterface> | null, options?:{color?:string, rectClass?: string;}): void {
        if(this.innerDisplays.length > 0 ){
            this.innerDisplays[0].display.highlightRegion(d,options);
        }
    }

    public setDisplayColor(color: string | RcsbFvColorGradient): void {
    }

    public plot:(element:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>)=>void;

}
