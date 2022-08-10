import * as React from "react";
import {createRoot, Root} from "react-dom/client";
import {RcsbFvBoard, RcsbFvBoardFullConfigInterface} from "./RcsbFvBoard/RcsbFvBoard";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "./RcsbFvConfig/RcsbFvConfigInterface";
import {
    EventType,
    TrackDataInterface,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, TrackVisibilityInterface, SetSelectionInterface
} from "./RcsbFvContextManager/RcsbFvContextManager";
import {RcsbFvTrackData} from "../RcsbDataManager/RcsbDataManager";
import {RcsbSelection, SelectionInterface} from "../RcsbBoard/RcsbSelection";
import uniqid from "uniqid";
import {RcsbScaleFactory, RcsbScaleInterface} from "../RcsbBoard/RcsbScaleFactory";

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
    private  elementId: string;
    /**Flag indicating that the React component has been mounted*/
    private mounted: boolean = false;
    /**Global d3 Xscale object shared among all board tracks*/
    private readonly xScale: RcsbScaleInterface = RcsbScaleFactory.getLinearScale();
    /**Global selection shared among all tracks*/
    private readonly selection:RcsbSelection = new RcsbSelection();

    private rcsbFvPromise: Promise<void>;

    private reactRoot: Root;

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
            this.init().then(()=>{
                console.info(`PFV ${this.elementId} is ready. Configuration provided during object instantiation`);
            });
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

    public then(f:()=>void): RcsbFv {
        if(this.rcsbFvPromise)
            this.rcsbFvPromise.then(()=>{
                f();
            });
        else
            throw "RcsbFv init method was not called";
        return this;
    }

    public catch(f:()=>void): RcsbFv {
        if(this.rcsbFvPromise)
            this.rcsbFvPromise.catch(()=>{
                f();
            })
        else
            throw "RcsbFv init method was not called";
        return this;
    }

    /**Renders the board*/
    public init(): Promise<void> {
        this.rcsbFvPromise = new Promise<void>((resolve, reject)=>{
            if(!this.mounted && this.boardConfigData != undefined) {
                const node: HTMLElement|null = document.getElementById(this.elementId);
                if(node==null)
                    throw `ERROR: HTML element ${this.elementId} not found`
                this.reactRoot = createRoot(node);
                this.reactRoot.render(<RcsbFvBoard rowConfigData={this.rowConfigData} boardConfigData={this.boardConfigData} contextManager={this.contextManager} xScale={this.xScale} selection={this.selection} resolve={resolve}/>);
                this.mounted = true;
            }else{
                reject("FATAL ERROR: RcsvFvBoard is mounted or board configuration was not loaded");
            }
        });
        return this.rcsbFvPromise;
    }

    /**Unmount the board*/
    public unmount(){
        if(this.reactRoot!=null) {
            this.reactRoot.unmount();
        }
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
                trackConfig.trackId = uniqid("trackId_");
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
    public addTrackData(trackId:string, data:RcsbFvTrackData): Promise<void>{
        const loadDataObj:TrackDataInterface = {
            trackId:trackId,
            trackData:data
        };
        return new Promise<void>((resolve, reject)=>{
            this.contextManager.next({
                eventType:EventType.ADD_TRACK_DATA,
                eventData:loadDataObj,
                eventResolve: resolve
            } as RcsbFvContextManagerInterface);
        });
    }

    /**Replaces annotations a particular board track
     * @param trackId Id that identifies the track
     * @param data New annotations to be displayed
     * */
    public updateTrackData(trackId:string, data:RcsbFvTrackData): Promise<void>{
        const loadDataObj:TrackDataInterface = {
            trackId:trackId,
            trackData:data
        };
        return new Promise<void>((resolve, reject)=>{
            this.contextManager.next({
                eventType:EventType.UPDATE_TRACK_DATA,
                eventData:loadDataObj,
                eventResolve: resolve
            } as RcsbFvContextManagerInterface);
        });

    }
    //TODO this method needs to return a promise (check other that will also need this)
    /**Method used to update board global and all-tracks configuration
     * @param newConfig New board configuration data
     * */
    public updateBoardConfig(newConfig: Partial<RcsbFvBoardFullConfigInterface>): Promise<void>{
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
        return new Promise<void>((resolve, reject)=>{
            this.contextManager.next({
                eventType:EventType.UPDATE_BOARD_CONFIG,
                eventData:configDataObj,
                eventResolve: resolve
            } as RcsbFvContextManagerInterface);
        });

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
    public addTrack(trackConfig: RcsbFvRowConfigInterface): Promise<void>{
        this.checkFvTrackConfig([trackConfig]);
        return new Promise<void>((resolve, reject)=>{
            if(this.mounted) {
                this.contextManager.next({
                    eventType: EventType.ADD_TRACK,
                    eventData: trackConfig,
                    eventResolve: resolve
                } as RcsbFvContextManagerInterface)
            }
        });

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

    /**Get board view range
     **/
    public getDomain(): [number,number] {
        return [this.xScale.domain()[0], this.xScale.domain()[1]];
    }

    /**Select board range
     * @param selection region/elements
     **/
    public setSelection(selection: SetSelectionInterface): void {
        this.contextManager.next({
            eventType:EventType.SET_SELECTION,
            eventData:selection
        });
    }

    /**Get selected board ranges
     * @param mode selection type
     **/
    public getSelection(mode:"select"|"hover"): Array<SelectionInterface> {
        return this.selection.getSelected(mode);
    }

    /**Add selection to board
     * @param selection region/elements
     **/
    public addSelection(selection: SetSelectionInterface): void {
        this.contextManager.next({
            eventType:EventType.ADD_SELECTION,
            eventData:selection
        });
    }

    /**
     * Clear Selection
     **/
    public clearSelection(mode?:'select'|'hover'): void {
        this.contextManager.next({
            eventType:EventType.SET_SELECTION,
            eventData: {
                elements:null,
                mode:mode ?? 'select'
            }
        });
    }

    /**
     * reset Selection and Scale
     **/
    public reset(): void{
        this.selection.reset();
        this.xScale.reset();
    }

}

