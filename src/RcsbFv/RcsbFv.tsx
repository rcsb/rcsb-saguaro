import * as React from "react";
import * as ReactDom from "react-dom";
import {RcsbFvBoard, RcsbFvBoardFullConfigInterface} from "./RcsbFvBoard/RcsbFvBoard";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "./RcsbFvConfig/RcsbFvConfigInterface";
import {
    EventType,
    TrackDataInterface,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, TrackVisibilityInterface, SetSelectionInterface
} from "./RcsbFvContextManager/RcsbFvContextManager";
import {RcsbFvTrackData} from "../RcsbDataManager/RcsbDataManager";

/**
 * Protein Feature Viewer (PFV) constructor interface
 */
export interface RcsbFvInterface {
    /**Array of configurations for each board track*/
    readonly rowConfigData: Array<RcsbFvRowConfigInterface>;
    /**Board global configuration*/
    readonly boardConfigData: RcsbFvBoardConfigInterface;
    /**DOM element Id where the PFV will be rendered*/
    readonly elementId: string;
}

/**
 * Protein Feature Viewer entry point
 */
export class RcsbFv {

    /**rxjs event based handler used to communicate events (click, highlight, move) between board tracks*/
    private readonly contextManager: RcsbFvContextManager = new RcsbFvContextManager();
    /**Array storing board tracks ids*/
    private trackIds: Array<string> = new Array<string>();
    /**Configuration for each board track*/
    private rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    /**Global board configuration*/
    private boardConfigData: RcsbFvBoardConfigInterface;
    /**DOM elemnt id where the board will be displayed*/
    private readonly elementId: string;
    /**Flag indicating that the React component has been mounted*/
    private mounted: boolean = false;

    constructor(props: RcsbFvInterface){
        this.boardConfigData = props.boardConfigData;
        this.elementId = props.elementId;
        if(this.elementId===null || this.elementId===undefined){
            throw "FATAL ERROR: DOM elementId not found";
        }
        if(props.rowConfigData != null) {
            this.rowConfigData = props.rowConfigData;
            this.checkFvTrackConfig(this.rowConfigData);
        }
        if(this.boardConfigData != null) {
            this.init();
        }
    }

    /**
    * Loads the configuration for each row of the board
    * @param rowConfigData Array of configurations for each row in the board
    */
    public setBoardData(rowConfigData: Array<RcsbFvRowConfigInterface>): void{
        this.rowConfigData = rowConfigData;
        this.checkFvTrackConfig(this.rowConfigData);
    }

    /**
     * Loads the configuration of the board
     * @param config Configuration of the board
     */
    public setBoardConfig(config: RcsbFvBoardConfigInterface){
        this.boardConfigData = config;
    }

    /**
     * @return board configuration
     */
    public getBoardConfig(): RcsbFvBoardConfigInterface{
        return this.boardConfigData;
    }

    /**Renders the board*/
    public init(){
        if(!this.mounted && this.boardConfigData != undefined) {
            ReactDom.render(
                <RcsbFvBoard rowConfigData={this.rowConfigData} boardConfigData={this.boardConfigData} contextManager={this.contextManager}/>,
                document.getElementById(this.elementId)
            );
            this.mounted = true;
        }else{
            throw "FATAL ERROR: RcsvFvBoard is mounted or board configuration was not loaded";
        }
    }

    /**Unmount the board*/
    public unmount(){
        const node: HTMLElement|null = document.getElementById(this.elementId);
        if(node!=null)
            ReactDom.unmountComponentAtNode(node)
    }

    /**Method used to check data config properties
     * @param rowConfigData Array of track configurations
     * */
    private checkFvTrackConfig(rowConfigData: Array<RcsbFvRowConfigInterface>): void{
        this.identifyFvTracks(rowConfigData);
        RcsbFv.checkTrackVisibility(rowConfigData);
    }

    /**Method used to check and force  the identification for each track
     * @param rowConfigData Array of track configurations
     * */
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

    /**Checks track visibility attribute, if undefined it is set to true
     * @param rowConfigData Array of track configurations
     * */
    private static checkTrackVisibility(rowConfigData: Array<RcsbFvRowConfigInterface>): void{
        for(const trackConfig of rowConfigData){
            if(typeof trackConfig.trackVisibility != "boolean"){
                trackConfig.trackVisibility = true;
            }
        }
    }

    /**Returns all track Ids in the same order that are visualised in the board*/
    public getTrackIds(): Array<string>{
        return this.trackIds;
    }

    /**Adds new annotations for a particular board track
     * @param trackId Id that identifies the track
     * @param data Annotations to be added in the track
     * */
    public addTrackData(trackId:string, data:RcsbFvTrackData): void{
        const loadDataObj:TrackDataInterface = {
            trackId:trackId,
            trackData:data
        };
        this.contextManager.next({
            eventType:EventType.ADD_TRACK_DATA,
            eventData:loadDataObj
        } as RcsbFvContextManagerInterface);
    }

    /**Replaces annotations a particular board track
     * @param trackId Id that identifies the track
     * @param data New annotations to be displayed
     * */
    public updateTrackData(trackId:string, data:RcsbFvTrackData): void{
        const loadDataObj:TrackDataInterface = {
            trackId:trackId,
            trackData:data
        };
        this.contextManager.next({
            eventType:EventType.UPDATE_TRACK_DATA,
            eventData:loadDataObj
        } as RcsbFvContextManagerInterface);
    }

    /**Method used to update board global and all-tracks configuration
     * @param newConfig New board configuration data
     * */
    public updateBoardConfig(newConfig: Partial<RcsbFvBoardFullConfigInterface>){
        const configDataObj:Partial<RcsbFvBoardFullConfigInterface> = {
            rowConfigData: newConfig.rowConfigData,
            boardConfigData: newConfig.boardConfigData ? {...this.boardConfigData,...newConfig.boardConfigData}  : undefined
        };
        if(configDataObj.rowConfigData!=null) {
            this.checkFvTrackConfig(configDataObj.rowConfigData);
            this.rowConfigData = configDataObj.rowConfigData;
        }
        if(configDataObj.boardConfigData!=null)
            this.boardConfigData = configDataObj.boardConfigData;
        this.contextManager.next({
            eventType:EventType.UPDATE_BOARD_CONFIG,
            eventData:configDataObj
        } as RcsbFvContextManagerInterface);
    }

    /**Rerender the board track
     * @param trackId Id that identifies the track
     * */
    public resetTrack(trackId:string): void{
        this.contextManager.next({
            eventType:EventType.RESET,
            eventData:trackId
        } as RcsbFvContextManagerInterface);
    }

    /**Adds a new track to the board
     * @param trackConfig Track configuration data
     * */
    public addTrack(trackConfig: RcsbFvRowConfigInterface): void{
        this.checkFvTrackConfig([trackConfig]);
        if(this.mounted) {
            this.contextManager.next({
                eventType: EventType.ADD_TRACK,
                eventData: trackConfig
            } as RcsbFvContextManagerInterface)
        }
    }

    /**Changes track visibility (true/false)
     * @param obj Track visibility event data
     **/
    public changeTrackVisibility(obj: TrackVisibilityInterface): void{
        this.contextManager.next({
            eventType:EventType.TRACK_VISIBILITY,
            eventData:obj
        } as RcsbFvContextManagerInterface);
    }

    /**Change board view range
     * @param domain new xScale domain
     **/
    public setDomain(domain:[number,number]): void {
        this.contextManager.next({
            eventType:EventType.DOMAIN_VIEW,
            eventData:{domain:domain}
        });
    }

    /**Select board range
     * @param selection new xScale domain
     **/
    public setSelection(selection: SetSelectionInterface): void {
        this.contextManager.next({
            eventType:EventType.SET_SELECTION,
            eventData:selection
        });
    }

    /**
     * Clear Selection
     **/
    public clearSelection(): void {
        this.contextManager.next({
            eventType:EventType.SET_SELECTION,
            eventData: null
        });
    }
}

