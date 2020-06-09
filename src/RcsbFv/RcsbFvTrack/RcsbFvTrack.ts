import {RcsbBoard} from '../../RcsbBoard/RcsbBoard';
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from '../RcsbFvConfig/RcsbFvDefaultConfigValues';
import {RcsbFvDisplay} from "./RcsbFvDisplay";
import {RcsbFvConfig} from "../RcsbFvConfig/RcsbFvConfig";
import {RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {
    RcsbFvTrackData,
    RcsbDataManager,
    RcsbFvTrackDataMap
} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbDisplayInterface} from "../../RcsbBoard/RcsbDisplay/RcsbDisplayInterface";
import {
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, ResetInterface, ScaleTransformInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";
import {RcsbCompositeDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbCompositeDisplay";
import {ScaleLinear} from "d3-scale";
import {RcsbSelection, SelectionInterface} from "../../RcsbBoard/RcsbSelection";

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
    private readonly contextManager: RcsbFvContextManager;
    private readonly xScale: ScaleLinear<number,number>;
    private readonly selection: RcsbSelection;

    public constructor(args:RcsbFvRowConfigInterface, xScale: ScaleLinear<number,number>, selection: RcsbSelection, contextManager: RcsbFvContextManager, updateRowHeight:()=>void) {
        this.contextManager = contextManager;
        this.updateRowHeight = updateRowHeight;
        this.xScale = xScale;
        this.selection = selection;
        if (typeof args.elementId === "string" && document.getElementById(args.elementId) !== null) {
            this.rcsbBoard = new RcsbBoard(args.elementId, xScale, this.selection, this.contextManager);
        }
        this.buildTrack(args);
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
                this.rcsbBoard = new RcsbBoard(this.elementId, this.xScale, this.selection, this.contextManager);
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

        this.rcsbBoard.setRange(1-RcsbFvDefaultConfigValues.increasedView, this.rcsbFvConfig.length+RcsbFvDefaultConfigValues.increasedView);
    }

    private buildRcsbTrack(): RcsbDisplayInterface{
        this.rcsbFvDisplay = new RcsbFvDisplay(this.rcsbFvConfig);
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
            const trackNonOverlappingMap: Array<Array<RcsbFvTrackData>> = new Array<Array<RcsbFvTrackData>>();
            let maxTracks:number = 1;
            (trackData as Array<RcsbFvTrackData>).forEach((f,i)=>{
                if(!this.rcsbFvConfig.overlap) {
                    const nonOverlapping: Array<RcsbFvTrackData> = RcsbDataManager.getNonOverlappingData(f);
                    trackNonOverlappingMap.push(nonOverlapping);
                    if(nonOverlapping.length > maxTracks)
                        maxTracks = nonOverlapping.length;
                }else {
                    trackNonOverlappingMap.push([f]);
                }

            });

            for(let i=0;i<maxTracks;i++){
                const rcsbCompositeTrack: RcsbDisplayInterface = this.buildRcsbTrack();
                (rcsbCompositeTrack as RcsbCompositeDisplay).setCompositeHeight(i*this.rcsbFvConfig.trackHeight);
                const displayIds: Array<string> = this.rcsbFvDisplay.getDisplayIds();
                const trackDataMap: RcsbFvTrackDataMap = new RcsbFvTrackDataMap();
                trackNonOverlappingMap.forEach((v,j)=>{
                    const id: string = displayIds[j];
                    if(i<v.length)
                        trackDataMap.set(id,v[i]);
                    else
                        trackDataMap.set(id,[]);
                });
                rcsbCompositeTrack.load(trackDataMap);
            }
        }else if (trackData instanceof RcsbFvTrackData){
            let nonOverlapping: Array<RcsbFvTrackData>;
            if(!this.rcsbFvConfig.overlap) {
                nonOverlapping = RcsbDataManager.getNonOverlappingData(trackData);
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
        return this.contextManager.asObservable().subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EventType.SCALE) {
                this.setScale(obj.eventData as ScaleTransformInterface);
            }else if(obj.eventType===EventType.SELECTION){
                this.setSelection();
            }else if(obj.eventType===EventType.RESET){
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

    public setSelection() : void {
        this.rcsbBoard.setSelection();
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