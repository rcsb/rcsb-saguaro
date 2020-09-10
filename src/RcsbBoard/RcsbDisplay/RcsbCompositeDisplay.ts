import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {ScaleLinear} from "d3-scale";
import {LocationViewInterface} from "../RcsbBoard";
import {RcsbD3Manager} from "../RcsbD3/RcsbD3Manager";
import {
    RcsbFvTrackData,
    RcsbFvTrackDataElementInterface,
    RcsbFvTrackDataMap
} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbFvContextManager} from "../../RcsbFv/RcsbFvContextManager/RcsbFvContextManager";

interface DisplayElementInterface {
    display: RcsbDisplayInterface;
    id: string;
}
export class RcsbCompositeDisplay implements RcsbDisplayInterface{
    private innerDisplays: Array<DisplayElementInterface> = new Array<DisplayElementInterface>();
    private _height: number;
    private _data: RcsbFvTrackDataMap;
    private _bgColor: string;
    private compositeHeight: number;
    elementClickCallBack: ()=>void;
    elementEnterCallBack: ()=>void;
    includeTooltip: boolean;

    setElementClickCallBack: (f:(d?:RcsbFvTrackDataElementInterface)=>void)=>void;
    setElementEnterCallBack: (f:(d?:RcsbFvTrackDataElementInterface)=>void)=>void;
    setUpdateDataOnMove: (f:(d:LocationViewInterface)=>Promise<RcsbFvTrackData>)=>void;
    setTooltip: (flag: boolean)=>void;
    setMinRatio: (ratio: number) => void;
    setSelectDataInRange: (flag: boolean) => void;
    setHideEmptyTrack: (flag:boolean) =>  void;

    setCompositeHeight(h: number): void{
        this.compositeHeight = h;
    }

    mouseoutCallBack(): void{
        this.innerDisplays.forEach(id=>{
            if(typeof id.display.mouseoutCallBack === "function") {
                id.display.mouseoutCallBack();
            }
        });
    }

    mouseoverCallBack(): void{
        this.innerDisplays.forEach(id=>{
            if(typeof id.display.mouseoverCallBack === "function") {
                id.display.mouseoverCallBack();
            }
        });
    }

    mousemoveCallBack(): void{
        this.innerDisplays.forEach(id=>{
            if(typeof id.display.mousemoveCallBack === "function") {
                id.display.mousemoveCallBack();
            }
        });
    }

    reset(): void{
        this.innerDisplays.forEach(de=>{
            de.display.reset();
        });
    }

    init(width: number, scale:ScaleLinear<number,number>): void{
        this.innerDisplays.forEach((de)=>{
            de.display.init(width, scale, true, this.compositeHeight);
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

    moveSelection(): void{
        this.innerDisplays.forEach(de=>{
            de.display.moveSelection();
        });
    }

    addDisplay(displayId: string, display: RcsbDisplayInterface){
        this.innerDisplays.push({id: displayId, display: display} as DisplayElementInterface);
    }

    setManagers(d3Manager: RcsbD3Manager, contextManager: RcsbFvContextManager){
        this.innerDisplays.forEach(de=>{
            de.display.setManagers(d3Manager, contextManager);
        });
    }

    setBoardHighlight(f: (d:RcsbFvTrackDataElementInterface, propFlag?: boolean) => void){
        this.innerDisplays.forEach(de=>{
            de.display.setBoardHighlight(f);
        });
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

    load(d?: RcsbFvTrackDataMap | RcsbFvTrackData): RcsbFvTrackDataMap{
        if(d != undefined) {
            const e: RcsbFvTrackDataMap = d as RcsbFvTrackDataMap;
            this._data = e;
            this.innerDisplays.forEach(de=>{
                const deData: RcsbFvTrackData | undefined = e.get(de.id);
                if(deData != undefined)
                    de.display.load(deData);
            });
        }
        return this._data;
    }

    highlightRegion(d:RcsbFvTrackDataElementInterface): void {
        if(this.innerDisplays.length > 0 ){
            this.innerDisplays[0].display.highlightRegion(d);
        }
    }
}
