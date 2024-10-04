import {createRoot, Root} from "react-dom/client";
import {RcsbFvBoard, RcsbFvBoardFullConfigInterface} from "./RcsbFvBoard/RcsbFvBoard";
import {
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface
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
import {RcsbFvDefaultConfigValues} from "./RcsbFvConfig/RcsbFvDefaultConfigValues";
import {asyncScheduler} from "rxjs";
import {Subscription} from "rxjs";

/**
 * Protein Feature Viewer (PFV) constructor interface
 */
export interface RcsbFvInterface <
    P extends {[k:string]:any;} = {},
    S extends {[k:string]:any;} = {},
    R extends {[k:string]:any;} = {},
    M extends {[k:string]:any;} = {}
>{
    /**Array of configurations for each board track*/
    readonly rowConfigData: RcsbFvRowConfigInterface<P,S,R,M>[];
    /**Board global configuration*/
    readonly boardConfigData: RcsbFvBoardConfigInterface;
    /**DOM element Id where the PFV will be rendered*/
    readonly elementId: string;
}

/**
 * Protein Feature Viewer entry point
 */
export class RcsbFv<
    P extends {[k:string]:any;} = {},
    S extends {[k:string]:any;} = {},
    R extends {[k:string]:any;} = {},
    M extends {[k:string]:any;} = {}
>{

    /**rxjs event based handler used to communicate events (click, highlight, move) between board tracks*/
    private readonly contextManager: RcsbFvContextManager = new RcsbFvContextManager();
    /**Global board configuration*/
    private boardConfigData: RcsbFvBoardConfigInterface;
    /**DOM elemnt id where the board will be displayed*/
    private readonly elementId: string;
    private readonly node: HTMLElement;

    /**Flag indicating that the React component has been mounted*/
    private mounted: boolean = false;
    /**Global d3 Xscale object shared among all board tracks*/
    private readonly xScale: RcsbScaleInterface = RcsbD3ScaleFactory.getLinearScale();
    /**Global selection shared among all tracks*/
    private readonly selection:RcsbSelection = new RcsbSelection();

    private resizeObserver: ResizeObserver;

    private readonly boardId : string = uniqid("RcsbFvBoard_");

    private readonly boardDataSate: BoardDataState<P,S,R,M>;
    private readonly rcsbFvStateManager: RcsbFvStateManager;

    private rcsbFvPromise: Promise<void>;

    private reactRoot: Root;

    constructor(props: RcsbFvInterface<P,S,R,M>){
        this.boardConfigData = props.boardConfigData;
        this.elementId = props.elementId;
        const node = document.getElementById(this.elementId);
        if(!node)
            throw new Error(`HTML element ${this.elementId} not found`)
        this.node = node;
        this.boardDataSate = new BoardDataState<P,S,R,M>({
            contextManager: this.contextManager,
            boardId: this.boardId,
            rowConfigData: props.rowConfigData
        });
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
    public setBoardData(rowConfigData: RcsbFvInterface<P,S,R,M>["rowConfigData"]): Promise<void>{
        this.boardDataSate.setBoardData(rowConfigData);
        return this.updateBoardData();
    }

    /**
     * Gets the configuration for each row of the board
     */
    public getBoardData(): RcsbFvRowConfigInterface<P,S,R,M>[]{
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
                this.reactRoot = createRoot(this.node);
                this.reactRoot.render(<RcsbFvBoard
                    boardId={this.boardId}
                    rowConfigData={this.boardDataSate.getBoardData()}
                    boardConfigData={this.boardConfigWithTrackWidth()}
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
        return this.rcsbFvPromise.then(()=>this.addResizeObserver());
    }

    /**Unmount the board*/
    public unmount(){
        if(this.reactRoot!=null) {
            this.reactRoot.unmount();
        }
        this.boardDataSate.unsubscribe();
        this.rcsbFvStateManager.unsubscribe();
        this.resizeObserver?.unobserve(this.node);
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
    public updateBoardConfig(newConfig: {boardConfigData?: RcsbFvBoardConfigInterface; rowConfigData?: RcsbFvInterface<P,S,R,M>["rowConfigData"] }): Promise<void>{
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
    public addTrack(trackConfig: RcsbFvRowConfigInterface<P,S,R,M>): Promise<void>{
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

    private boardConfigWithTrackWidth(): RcsbFvBoardConfigInterface {
        return {
            ... this.boardConfigData,
            trackWidth: this.boardConfigData.trackWidth ?? (this.node.getBoundingClientRect().width - this.rowTitleWidth())
        };
    }

    private addResizeObserver(): void {
        if(this.boardConfigData.trackWidth)
            return;
        this.resizeObserver = resizeBoard(
            this.node,
            async (width) => {
                const trackWidth = width - this.rowTitleWidth();
                if(trackWidth <= 0){
                    console.debug(`Element width ${width} is too small. Row title width ${this.rowTitleWidth()}. Not rendering`);
                    return;
                }
                const selected = this.getSelection("select").map(s=>({
                        begin: s.rcsbFvTrackDataElement.begin,
                        end: s.rcsbFvTrackDataElement.end
                    }));
                const domain = [this.xScale.domain()[0], this.xScale.domain()[1]];
                const data = this.boardDataSate.getBoardData();
                await this.updateBoardConfig({
                    boardConfigData: {
                        trackWidth: trackWidth
                    },
                    rowConfigData: []
                });
                this.setDomain(domain as [number, number]);
                this.setSelection({
                    mode:"select",
                    elements: selected
                });
                await this.updateBoardConfig({
                    rowConfigData: data
                })
            });
    }

    private rowTitleWidth(): number {
        return (this.boardConfigData.rowTitleWidth ?? RcsbFvDefaultConfigValues.rowTitleWidth) + 40;
    }

}

function resizeBoard (node: HTMLElement, callback: (width: number)=>void): ResizeObserver {
    let width = node.getBoundingClientRect().width;
    let task: Subscription;
    const resizeObserver = new ResizeObserver((entries, observer)=>{
        if(width == entries[0].contentRect.width)
            return;
        width = entries[0].contentRect.width;
        if(task)
            task.unsubscribe();
        task = asyncScheduler.schedule(()=>callback(width), 50);
    });
    resizeObserver.observe(node);
    return resizeObserver;
}



