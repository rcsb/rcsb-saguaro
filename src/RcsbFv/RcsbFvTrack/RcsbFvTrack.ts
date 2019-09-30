import {RcsbBoard, ScaleTransform, SelectionInterface} from '../../RcsbBoard/RcsbBoard';
import {RcsbFvDefaultConfigValues, DISPLAY_TYPES} from '../RcsbFvConfig/RcsbFvDefaultConfigValues';
import {RcsbFvDisplay} from "./RcsbFvDisplay";
import {RcsbFvConfig} from "../RcsbFvConfig/RcsbFvConfig";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import {
    RcsbFvData,
    RcsbFvDataArray,
    RcsbFvDataManager,
    RcsbFvDataMap
} from "../RcsbFvDataManager/RcsbFvDataManager";
import {RcsbDisplayInterface} from "../../RcsbBoard/RcsbDisplay/RcsbDisplayInterface";
import {
    EVENT_TYPE,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";

export class RcsbFvTrack {

    private rcsbBoard: RcsbBoard = null;
    private rcsbTrackArray: Array<RcsbDisplayInterface> = new Array<RcsbDisplayInterface>();
    private rcsbFvDisplay: RcsbFvDisplay = null;
    private rcsbFvConfig: RcsbFvConfig;
    private elementId: string = null;
    private trackData: string | RcsbFvData | RcsbFvDataArray = null;

    public constructor(args:RcsbFvRowConfigInterface) {
        this.rcsbBoard = new RcsbBoard(args.elementId);
        this.buildTrack(args);
        this.subscribe();
    }

    private buildTrack(args:RcsbFvRowConfigInterface) : void{
        this.setConfig(args);
        if(typeof this.rcsbFvConfig.elementId === "string"){
            this.init(this.rcsbFvConfig.elementId);
        }
        if(typeof this.rcsbFvConfig.trackData !== "undefined"){
            this.load(this.rcsbFvConfig.trackData);
        }
        if(
            (typeof this.rcsbFvConfig.elementId === "string") &&
            (typeof this.rcsbFvConfig.trackData !== "undefined" || this.rcsbFvConfig.displayType === DISPLAY_TYPES.AXIS)
        ){
            if(this.rcsbFvConfig.displayType === DISPLAY_TYPES.AXIS){
               this.buildRcsbTrack();
            }
            this.start();
        }
    }

    public init(elementId: string) : void{
        if(document.getElementById(elementId)!== null) {
            this.elementId = elementId;
            if (this.rcsbFvConfig.configCheck()) {
                this.initRcsbBoard();
            }
        }else{
            throw "HTML element "+elementId+" not found";
        }
    }

    public setConfig(args: RcsbFvRowConfigInterface) : void{
        this.rcsbFvConfig = new RcsbFvConfig(args);
    }

    private initRcsbBoard(): void{
        this.rcsbBoard.setRange(-1*RcsbFvDefaultConfigValues.increasedView, this.rcsbFvConfig.length+RcsbFvDefaultConfigValues.increasedView);
        this.rcsbFvDisplay = new RcsbFvDisplay(this.rcsbFvConfig);
    }

    private buildRcsbTrack(): RcsbDisplayInterface{
        const rcsbTrack: RcsbDisplayInterface = this.rcsbFvDisplay.initDisplay();
        rcsbTrack.height( this.rcsbFvConfig.trackHeight );
        rcsbTrack.trackColor( this.rcsbFvConfig.trackColor );

        this.rcsbTrackArray.push(rcsbTrack);
        return rcsbTrack;
    }

    public load(trackData: string | RcsbFvData | RcsbFvDataArray) : void{
        this.trackData = trackData;
        if(trackData instanceof RcsbFvDataArray && this.rcsbFvConfig.displayType instanceof Array){
            const rcsbTrack = this.buildRcsbTrack();
            const displayIds: Array<string> = this.rcsbFvDisplay.getDisplayIds();
            const trackDataHash: RcsbFvDataMap = new RcsbFvDataMap();
            for(let f of trackData){
                const id: string = displayIds.shift();
                if(f instanceof RcsbFvData || typeof f === "string") {
                    trackDataHash.set(id,f);
                }
            }
            rcsbTrack.load(trackDataHash);
        }else if(trackData instanceof RcsbFvData){
            let nonOverlapping: Array<RcsbFvData> = new Array<RcsbFvData>();
            if(this.rcsbFvConfig.displayType === DISPLAY_TYPES.BLOCK || this.rcsbFvConfig.displayType === DISPLAY_TYPES.PIN) {
                nonOverlapping = RcsbFvDataManager.getNonOverlappingData(trackData);
            }else{
                nonOverlapping = [trackData];
            }
            nonOverlapping.forEach(trackData=>{
                this.buildRcsbTrack().load(trackData);
            });
        }else if(typeof trackData === "string") {
            this.buildRcsbTrack().load(trackData);
        }else{
            throw "Data loader error. Data type not supported.";
        }
    }

    public start() : void{
        this.rcsbTrackArray.forEach(track=>{
            this.rcsbBoard.addTrack(track);
        });
        this.rcsbBoard.startBoard();
    }

    subscribe(): void{
        RcsbFvContextManager.asObservable().subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EVENT_TYPE.SCALE) {
                this.setScale(obj.eventData as ScaleTransform);
            }else if(obj.eventType===EVENT_TYPE.SELECTION){
                this.setSelection(obj.eventData as SelectionInterface);
            }
        });
    }

    public setScale(obj: ScaleTransform) : void {
        this.rcsbBoard.setScale(obj);
    }

    public setSelection(obj: SelectionInterface) : void {
        this.rcsbBoard.setSelection(obj);
    }

    public getTrackHeight(): number{
        return this.rcsbTrackArray.length * this.rcsbFvConfig.trackHeight;
    }
}