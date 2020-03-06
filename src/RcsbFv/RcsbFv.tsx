import * as React from "react";
import * as ReactDom from "react-dom";
import {RcsbFvBoard} from "./RcsbFvBoard/RcsbFvBoard";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "./RcsbFvInterface";
import {
    EventType,
    DataInterface,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, ResetInterface
} from "./RcsbFvContextManager/RcsbFvContextManager";
import {RcsbFvTrackData} from "./RcsbFvDataManager/RcsbFvDataManager";

export interface RcsbFvInterface {
    rowConfigData: Array<RcsbFvRowConfigInterface>;
    boardConfigData: RcsbFvBoardConfigInterface;
    elementId: string;
}

export class RcsbFv {

    private readonly contextManager: RcsbFvContextManager = new RcsbFvContextManager();;
    private trackIds: Array<string> = new Array<string>();
    private rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private boardConfigData: RcsbFvBoardConfigInterface;
    private readonly elementId: string;
    private mounted: boolean = false;

    constructor(props: RcsbFvInterface){
        this.boardConfigData = props.boardConfigData;
        this.elementId = props.elementId;
        if(this.elementId===null || this.elementId===undefined){
            throw "FATAL ERROR: DOM elementId not found";
        }
        if(props.rowConfigData!=null) {
            this.rowConfigData = props.rowConfigData;
            this.identifyFvTracks(this.rowConfigData);
        }
        if(this.boardConfigData!==null) {
            this.init();
        }
    }

    public setBoardData(rowConfigData: Array<RcsbFvRowConfigInterface>): void{
        this.rowConfigData = rowConfigData;
        this.identifyFvTracks(this.rowConfigData);
    }

    public setBoardConfig(config: RcsbFvBoardConfigInterface){
        this.boardConfigData = config;
    }

    public init(){
        if(!this.mounted) {
            this.mounted = true;
            ReactDom.render(
                <RcsbFvBoard rowConfigData={this.rowConfigData} boardConfigData={this.boardConfigData} contextManager={this.contextManager}/>,
                document.getElementById(this.elementId)
            );
        }
    }

    private identifyFvTracks(rowConfigData: Array<RcsbFvRowConfigInterface>): void{
        for(const trackConfig of rowConfigData){
            if(typeof trackConfig.trackId === "undefined"){
                trackConfig.trackId = "trackId_"+Math.random().toString(36).substr(2);
            }
            if(!this.trackIds.includes(trackConfig.trackId)) {
                this.trackIds.push(trackConfig.trackId);
            }
        }
    }

    public getTrackIds(): Array<string>{
        return this.trackIds;
    }

    public addData(trackId:string, data:RcsbFvTrackData): void{
        const loadDataObj:DataInterface = {
            trackId:trackId,
            loadData:data
        };
        this.contextManager.next({
            eventType:EventType.ADD_DATA,
            eventData:loadDataObj
        } as RcsbFvContextManagerInterface);
    }

    public updateData(trackId:string, data:RcsbFvTrackData): void{
        const loadDataObj:DataInterface = {
            trackId:trackId,
            loadData:data
        };
        this.contextManager.next({
            eventType:EventType.UPDATE_DATA,
            eventData:loadDataObj
        } as RcsbFvContextManagerInterface);
    }

    public reset(trackId:string): void{
        const resetDataObj:ResetInterface = {
            trackId:trackId
        };
        this.contextManager.next({
            eventType:EventType.RESET,
            eventData:resetDataObj
        } as RcsbFvContextManagerInterface);
    }

    public addTrack(trackConfig: RcsbFvRowConfigInterface): void{
        if(this.mounted) {
            this.contextManager.next({
                eventType: EventType.ADD_TRACK,
                eventData: trackConfig
            } as RcsbFvContextManagerInterface)
        }
        this.identifyFvTracks(this.rowConfigData);
    }

}

