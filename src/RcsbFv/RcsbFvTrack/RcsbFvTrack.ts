import {RcsbBoard} from '../../RcsbBoard/RcsbBoard';
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from '../RcsbFvConfig/RcsbFvDefaultConfigValues';
import {RcsbFvDisplay} from "./RcsbFvDisplay";
import {RcsbFvConfig} from "../RcsbFvConfig/RcsbFvConfig";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import {
    RcsbFvTrackData,
    RcsbFvDataManager,
    RcsbFvTrackDataMap
} from "../RcsbFvDataManager/RcsbFvDataManager";
import {RcsbDisplayInterface} from "../../RcsbBoard/RcsbDisplay/RcsbDisplayInterface";
import {
    EVENT_TYPE, DataInterface,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, ResetInterface, ScaleTransformInterface, SelectionInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";

export class RcsbFvTrack {

    private rcsbBoard: RcsbBoard = null;
    private rcsbTrackArray: Array<RcsbDisplayInterface> = new Array<RcsbDisplayInterface>();
    private rcsbFvDisplay: RcsbFvDisplay = null;
    private rcsbFvConfig: RcsbFvConfig = null;
    private elementId: string = null;
    private trackData:  RcsbFvTrackData | Array<RcsbFvTrackData> = null;
    private loadedData: boolean = false;
    private readonly updateRowHeight: ()=>void;
    private subscription: Subscription;

    public constructor(args:RcsbFvRowConfigInterface, updateRowHeight:()=>void) {
        if (typeof args.elementId === "string" && document.getElementById(args.elementId) !== null) {
            this.rcsbBoard = new RcsbBoard(args.elementId);
        }
        this.buildTrack(args);
        this.updateRowHeight = updateRowHeight;
        this.subscription = this.subscribe();
    }

    private buildTrack(args:RcsbFvRowConfigInterface) : void{
        this.setConfig(args);
        if(typeof this.rcsbFvConfig.elementId === "string"){
            this.init(this.rcsbFvConfig.elementId);
        }
        if(typeof this.rcsbFvConfig.trackData !== "undefined" && this.rcsbFvConfig.displayType !== RcsbFvDisplayTypes.COMPOSITE ){
            this.load(this.rcsbFvConfig.trackData);
        }else if(this.rcsbFvConfig.displayType === RcsbFvDisplayTypes.COMPOSITE){
            const data: Array<RcsbFvTrackData> = this.collectCompositeData();
            if(data !== undefined) {
                this.load(data);
            }
        }else{
            this.buildRcsbTrack();
        }
        this.start();
    }

    public init(elementId: string) : void{
        if(document.getElementById(elementId)!== null) {
            this.elementId = elementId;
            if(this.rcsbBoard === null){
                this.rcsbBoard = new RcsbBoard(this.elementId);
            }
            if (this.rcsbFvConfig.configCheck()) {
                this.initRcsbBoard();
            }else{
                throw "Board length is not defined";
            }
        }else{
            throw "HTML element "+elementId+" not found";
        }
    }

    public setConfig(args: RcsbFvRowConfigInterface) : void{
        if(this.rcsbFvConfig === null) {
            this.rcsbFvConfig = new RcsbFvConfig(args);
        }else{
            this.rcsbFvConfig.updateConfig(args);
        }
    }

    private initRcsbBoard(): void{
        if(typeof this.rcsbFvConfig.elementClickCallBack === "function")
            this.rcsbBoard.setHighLightCallBack(this.rcsbFvConfig.elementClickCallBack);
        if(typeof this.rcsbFvConfig.trackWidth === "number")
            this.rcsbBoard.setBoardWidth(this.rcsbFvConfig.trackWidth);

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

    private collectCompositeData(): Array<RcsbFvTrackData>{
        const data: Array<RcsbFvTrackData> = new Array<RcsbFvTrackData>();
        for(let displayItem of this.rcsbFvConfig.displayConfig){
            if(typeof displayItem.displayData !== "undefined") {
                data.push(displayItem.displayData);
            }
        }
        if(data.length == this.rcsbFvConfig.displayConfig.length) {
            return data;
        }
        return undefined;
    }

    public load(trackData:  RcsbFvTrackData | Array<RcsbFvTrackData>) : void{
        this.trackData = trackData;
        this.loadedData = true;
        if( this.rcsbFvConfig.displayType === RcsbFvDisplayTypes.COMPOSITE && trackData instanceof Array){
            const rcsbTrack: RcsbDisplayInterface = this.buildRcsbTrack();
            const displayIds: Array<string> = this.rcsbFvDisplay.getDisplayIds();
            const trackDataHash: RcsbFvTrackDataMap = new RcsbFvTrackDataMap();
            for(let f of trackData){
                const id: string = displayIds.shift();
                if(typeof f === "string") {
                    trackDataHash.set(id,f);
                }else{
                    trackDataHash.set(id,f as RcsbFvTrackData);
                }
            }
            rcsbTrack.load(trackDataHash);
        }else if (trackData instanceof RcsbFvTrackData){
            let nonOverlapping: Array<RcsbFvTrackData>;
            if(!this.rcsbFvConfig.overlap) {
                nonOverlapping = RcsbFvDataManager.getNonOverlappingData(trackData);
            }else{
                nonOverlapping = [trackData];
            }
            nonOverlapping.forEach(trackData=>{
                this.buildRcsbTrack().load(trackData);
            });
        }else{
            this.loadedData = false;
            throw "Data loader error. Data type not supported.";
        }
    }

    public start() : void{
        this.rcsbTrackArray.forEach(track=>{
            this.rcsbBoard.addTrack(track);
        });
        this.rcsbBoard.startBoard();
    }

    private restartTracks() : void{
        this.rcsbTrackArray.forEach(track=>{
            this.rcsbBoard.addTrack(track);
        });
        this.rcsbBoard.startTracks();
    }

    subscribe(): Subscription{
        return RcsbFvContextManager.asObservable().subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EVENT_TYPE.SCALE) {
                this.setScale(obj.eventData as ScaleTransformInterface);
            }else if(obj.eventType===EVENT_TYPE.SELECTION){
                this.setSelection(obj.eventData as SelectionInterface);
            }else if(obj.eventType===EVENT_TYPE.UPDATE_DATA || obj.eventType===EVENT_TYPE.ADD_DATA){
                this.updateData(obj.eventData as DataInterface, obj.eventType);
            }else if(obj.eventType===EVENT_TYPE.RESET){
                this.reset(obj.eventData as ResetInterface);
            }
        });
    }

    unsubscribe(): void{
        this.subscription.unsubscribe();
    }

    public setScale(obj: ScaleTransformInterface) : void {
        this.rcsbBoard.setScale(obj);
    }

    public setSelection(obj: SelectionInterface) : void {
        this.rcsbBoard.setSelection(obj);
    }

    private updateData(obj: DataInterface, updateType: string){
        if(this.rcsbFvConfig.trackId === obj.trackId){
            if(updateType === EVENT_TYPE.UPDATE_DATA) {
                this.rcsbFvConfig.updateTrackData(obj.loadData);
            }else if(updateType === EVENT_TYPE.ADD_DATA){
                this.rcsbFvConfig.addTrackData(obj.loadData);
            }
            this._reset();
            this.load(this.rcsbFvConfig.trackData);
            this.restartTracks();
            this.rcsbBoard.updateAllTracks();
            this.updateRowHeight();
        }
    }

    private reset(obj: ResetInterface){
        if(this.rcsbFvConfig.trackId === obj.trackId){
            this._reset();
        }
    }

    private _reset(): void{
        this.rcsbTrackArray = new Array<RcsbDisplayInterface>();
        this.rcsbBoard.reset();
    }

    public getTrackHeight(): number{
        if(this.rcsbTrackArray.length > 0) {
            return this.rcsbTrackArray.length * this.rcsbFvConfig.trackHeight;
        }
        return this.rcsbFvConfig.trackHeight;
    }
}