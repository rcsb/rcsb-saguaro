import * as React from "react";
import {createRoot, Root} from "react-dom/client";
import {RcsbFvBoard, RcsbFvBoardFullConfigInterface} from "./RcsbFvBoard/RcsbFvBoard";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "./RcsbFvConfig/RcsbFvConfigInterface";
import {
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, TrackVisibilityInterface, SetSelectionInterface
} from "./RcsbFvContextManager/RcsbFvContextManager";
import {RcsbFvTrackData} from "../RcsbDataManager/RcsbDataManager";
import {RcsbSelection, SelectionInterface} from "../RcsbBoard/RcsbSelection";
import {RcsbD3ScaleFactory, RcsbScaleInterface} from "../RcsbBoard/RcsbD3/RcsbD3ScaleFactory";
import {BoardDataState} from "./RcsbFvBoard/Utils/BoardDataState";

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
    /**Global board configuration*/
    private boardConfigData: RcsbFvBoardConfigInterface;
    /**DOM elemnt id where the board will be displayed*/
    private  elementId: string;
    /**Flag indicating that the React component has been mounted*/
    private mounted: boolean = false;
    /**Global d3 Xscale object shared among all board tracks*/
    private readonly xScale: RcsbScaleInterface = RcsbD3ScaleFactory.getLinearScale();
    /**Global selection shared among all tracks*/
    private readonly selection:RcsbSelection = new RcsbSelection();

    private readonly boardDataSate: BoardDataState = new BoardDataState();

    private rcsbFvPromise: Promise<void>;

    private reactRoot: Root;

    constructor(props: RcsbFvInterface){
        this.boardConfigData = props.boardConfigData;
        this.elementId = props.elementId;
        if(this.elementId===null || this.elementId===undefined){
            throw "FATAL ERROR: DOM elementId not found";
        }
        if(props.rowConfigData != null) {
            this.boardDataSate = new BoardDataState(props.rowConfigData);
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
        this.boardDataSate.setBoardData(rowConfigData);
    }

    /**
     * Gets the configuration for each row of the board
     */
    public getBoardData(rowConfigData: Array<RcsbFvRowConfigInterface>): Array<RcsbFvRowConfigInterface>{
        return this.boardDataSate.getBoardData();
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
                this.reactRoot.render(<RcsbFvBoard
                    rowConfigData={this.boardDataSate.getBoardData()}
                    boardConfigData={this.boardConfigData}
                    contextManager={this.contextManager}
                    xScale={this.xScale}
                    selection={this.selection}
                    resolve={resolve}
                />);
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


    /**Returns all track Ids in the same order that are visualised in the board*/
    public getTrackIds(): Array<string>{
        return this.boardDataSate.getBoardData().map(r=>r.trackId);
    }

    /**Adds new annotations for a particular board track
     * @param trackId Id that identifies the track
     * @param trackData Annotations to be added in the track
     * */
    public addTrackData(trackId:string, trackData:RcsbFvTrackData): Promise<void>{
        this.boardDataSate.addTrackData({trackId, trackData});
        return this.updateBoardData();
    }

    /**Replaces annotations a particular board track
     * @param trackId Id that identifies the track
     * @param data New annotations to be displayed
     * */
    public updateTrackData(trackId:string, trackData:RcsbFvTrackData): Promise<void>{
        this.boardDataSate.updateTrackData({trackId, trackData})
        return this.updateBoardData();
    }

    /**Method used to update board global and all-tracks configuration
     * @param newConfig New board configuration data
     * */
    public updateBoardConfig(newConfig: {boardConfigData?: RcsbFvBoardConfigInterface; rowConfigData?: RcsbFvRowConfigInterface[]}): Promise<void>{
        if(newConfig.rowConfigData)
            this.boardDataSate.setBoardData(newConfig.rowConfigData);
        if(newConfig.boardConfigData)
            this.boardConfigData = {...this.boardConfigData,...newConfig.boardConfigData};
        const configDataObj:Partial<RcsbFvBoardFullConfigInterface> = {
            rowConfigData: newConfig.rowConfigData ? this.boardDataSate.getBoardData() : undefined,
            boardConfigData: newConfig.boardConfigData ? this.boardConfigData  : undefined
        };
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
        this.boardDataSate.addTrack(trackConfig);
        return this.updateBoardData();
    }

    /**Changes track visibility (true/false)
     * @param obj Track visibility event data
     **/
    public changeTrackVisibility(obj: TrackVisibilityInterface): Promise<void>{
        this.boardDataSate.changeTrackVisibility(obj);
        return this.updateBoardData()
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
     * Move board track
     * @param oldIndex original position
     * @param newIndex new position
     * **/
    public moveTrack(oldIndex: number, newIndex: number): Promise<void> {
        this.boardDataSate.moveTrack({oldIndex, newIndex})
        return this.updateBoardData();
    }

    /**
     * reset Selection and Scale
     **/
    public reset(): void{
        this.selection.reset();
        this.xScale.reset();
    }

    private updateBoardData(): Promise<void> {
        return new Promise<void>((resolve, reject)=>{
            this.contextManager.next({
                eventType:EventType.UPDATE_BOARD_DATA,
                eventData: this.boardDataSate.getBoardData(),
                eventResolve: resolve
            } as RcsbFvContextManagerInterface);
        });
    }
}



