import {createRoot, Root} from "react-dom/client";
import {RcsbFvBoard, RcsbFvBoardFullConfigInterface} from "./RcsbFvBoard/RcsbFvBoard";
import {
    RcsbFvBoardConfigInterface,
    RcsbFvRowPublicConfigType
} from "./RcsbFvConfig/RcsbFvConfigInterface";
import {
    EventType,
    RcsbFvContextManager,
    TrackVisibilityInterface, SetSelectionInterface
} from "./RcsbFvContextManager/RcsbFvContextManager";
import {RcsbFvTrackData} from "../RcsbDataManager/RcsbDataManager";
import {RcsbSelection, SelectionInterface} from "../RcsbBoard/RcsbSelection";
import {RcsbD3ScaleFactory, RcsbScaleInterface} from "../RcsbBoard/RcsbD3/RcsbD3ScaleFactory";
import {BoardDataState} from "./RcsbFvBoard/Utils/BoardDataState";
import uniqid from "uniqid";
import {RcsbFvStateManager} from "./RcsbFvState/RcsbFvStateManager";

/**
 * Protein Feature Viewer (PFV) constructor interface
 */
export interface RcsbFvInterface {
    /**Array of configurations for each board track*/
    readonly rowConfigData: RcsbFvRowPublicConfigType[];
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
    private readonly elementId: string;
    /**Flag indicating that the React component has been mounted*/
    private mounted: boolean = false;
    /**Global d3 Xscale object shared among all board tracks*/
    private readonly xScale: RcsbScaleInterface = RcsbD3ScaleFactory.getLinearScale();
    /**Global selection shared among all tracks*/
    private readonly selection:RcsbSelection = new RcsbSelection();

    private readonly boardId : string = uniqid("RcsbFvBoard_");

    private readonly boardDataSate: BoardDataState;
    private readonly rcsbFvStateManager: RcsbFvStateManager;

    private rcsbFvPromise: Promise<void>;

    private reactRoot: Root;

    constructor(props: RcsbFvInterface){
        this.boardConfigData = props.boardConfigData;
        this.elementId = props.elementId;
        if(this.elementId===null || this.elementId===undefined){
            throw "FATAL ERROR: DOM elementId not found";
        }
        this.boardDataSate = new BoardDataState(this.contextManager, props.rowConfigData);
        this.rcsbFvStateManager = new RcsbFvStateManager({
            xScale: this.xScale,
            selection: this.selection,
            contextManager: this.contextManager,
            boardId: this.boardId
        })
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
    public setBoardData(rowConfigData: RcsbFvInterface["rowConfigData"]): Promise<void>{
        this.boardDataSate.setBoardData(rowConfigData);
        return this.updateBoardData();
    }

    /**
     * Gets the configuration for each row of the board
     */
    public getBoardData(): RcsbFvRowPublicConfigType[]{
        return this.boardDataSate.getBoardData();
    }

    /**
     * Loads the configuration of the board
     * @param config Configuration of the board
     */
    public setBoardConfig(config: RcsbFvBoardConfigInterface): Promise<void>{
        return this.updateBoardConfig({boardConfigData:config});
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
                    boardId={this.boardId}
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
        this.boardDataSate.unsubscribe();
        this.rcsbFvStateManager.unsubscribe();
    }


    /**Returns all track Ids in the same order that are visualised in the board*/
    public getTrackIds(): string[]{
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
     * @param trackData New annotations to be displayed
     * @param displayId optional Id that identifies track from a composite track to update
     * */
    public updateTrackData(trackId:string, trackData:RcsbFvTrackData, displayId?:string): Promise<void>{
        this.boardDataSate.updateTrackData({trackId, trackData, displayId});
        return this.updateBoardData();
    }

    /**Method used to update board global and all-tracks configuration
     * @param newConfig New board configuration data
     * */
    public updateBoardConfig(newConfig: {boardConfigData?: RcsbFvBoardConfigInterface; rowConfigData?: RcsbFvInterface["rowConfigData"] }): Promise<void>{
        if(newConfig.rowConfigData)
            this.boardDataSate.setBoardData(newConfig.rowConfigData);
        else
            this.boardDataSate.refresh();

        if(newConfig.boardConfigData)
            this.boardConfigData = {...this.boardConfigData,...newConfig.boardConfigData};

        const configDataObj:Partial<RcsbFvBoardFullConfigInterface> = {
            rowConfigData: this.boardDataSate.getBoardData(),
            boardConfigData: newConfig.boardConfigData ? this.boardConfigData  : undefined
        };

        return new Promise<void>((resolve, reject)=>{
            this.contextManager.next({
                eventType:EventType.UPDATE_BOARD_CONFIG,
                eventData:configDataObj,
                eventResolve: resolve
            });
        });

    }

    /**Rerender the board track
     * @param trackId Id that identifies the track
     * */
    public resetTrack(trackId:string): Promise<void>{
        this.boardDataSate.resetTrack(trackId);
        return this.updateBoardData();
    }

    /**Adds a new track to the board
     * @param trackConfig Track configuration data
     * */
    public addTrack(trackConfig: RcsbFvRowPublicConfigType): Promise<void>{
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
    public getSelection(mode:"select"|"hover"): SelectionInterface[] {
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
                eventType:EventType.UPDATE_BOARD_CONFIG,
                eventData: {
                    rowConfigData: this.boardDataSate.getBoardData()
                },
                eventResolve: resolve
            });
        });
    }
}



