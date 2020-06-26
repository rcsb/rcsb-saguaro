import * as React from "react";
import * as ReactDom from "react-dom";
import {RcsbFvBoard, RcsbFvBoardFullConfigInterface} from "./RcsbFvBoard/RcsbFvBoard";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "./RcsbFvConfig/RcsbFvConfigInterface";
import {
    EventType,
    DataInterface,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, ResetInterface
} from "./RcsbFvContextManager/RcsbFvContextManager";
import {RcsbFvTrackData} from "../RcsbDataManager/RcsbDataManager";

/**
 * Protein Feature Viewer (PFV) constructor interface
 */
export interface RcsbFvInterface {
    rowConfigData: Array<RcsbFvRowConfigInterface>;
    boardConfigData: RcsbFvBoardConfigInterface;
    elementId: string;
}

/**
 * Protein Feature Viewer entry point
 */
export class RcsbFv {

    private readonly contextManager: RcsbFvContextManager = new RcsbFvContextManager();
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
        if(props.rowConfigData != null) {
            this.rowConfigData = props.rowConfigData;
            this.identifyFvTracks(this.rowConfigData);
        }
        if(this.boardConfigData != null) {
            this.init();
        }
    }

    /**
    * Loads the configuration for each row of the board
    * @param rowConfigData array of configurations for each row in the board
    */
    public setBoardData(rowConfigData: Array<RcsbFvRowConfigInterface>): void{
        this.rowConfigData = rowConfigData;
        this.identifyFvTracks(this.rowConfigData);
    }

    /**
     * Loads the configuration of the board
     * @param config configuration of the board
     */
    public setBoardConfig(config: RcsbFvBoardConfigInterface){
        this.boardConfigData = config;
    }

    public init(){
        if(!this.mounted && this.boardConfigData != undefined) {
            this.mounted = true;
            ReactDom.render(
                <RcsbFvBoard rowConfigData={this.rowConfigData} boardConfigData={this.boardConfigData} contextManager={this.contextManager}/>,
                document.getElementById(this.elementId)
            );
        }else{
            throw "FATAL ERROR: RcsvFvBoard is mounted or board configuration was not loaded";
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
            eventType:EventType.UPDATE_TRACK_DATA,
            eventData:loadDataObj
        } as RcsbFvContextManagerInterface);
    }

    public updateBoardConfig(boardConfigData: RcsbFvBoardConfigInterface, rowConfigData: Array<RcsbFvRowConfigInterface>){
        const configDataObj:RcsbFvBoardFullConfigInterface = {
            rowConfigData: rowConfigData,
            boardConfigData: boardConfigData
        };
        this.contextManager.next({
            eventType:EventType.UPDATE_BOARD_CONFIG,
            eventData:configDataObj
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

