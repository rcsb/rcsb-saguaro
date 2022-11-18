import {RcsbFvDisplayConfigInterface, RcsbFvRowConfigInterface} from "../../RcsbFvConfig/RcsbFvConfigInterface";
import uniqid from "uniqid";
import {
    EventType,
    RcsbFvContextManager,
    RowReadyInterface,
    TrackDataInterface,
    TrackVisibilityInterface
} from "../../RcsbFvContextManager/RcsbFvContextManager";
import {RcsbFvDisplayTypes} from "../../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {arrayMoveMutable} from "array-move";
import {RowStatusMap} from "./RowStatusMap";
import {Subscription} from "rxjs";

export interface RcsbFvExtendedRowConfigInterface extends RcsbFvRowConfigInterface {
    key:string;
    renderSchedule?: "async"|"sync"|"fixed";
}

export class BoardDataState {

    private rowConfigData: RcsbFvExtendedRowConfigInterface[] = [];
    private readonly rowStatusMap: RowStatusMap;
    private readonly contextManager: RcsbFvContextManager;
    private readonly subscription: Subscription;

    constructor(rowStatusMap: RowStatusMap, contextManager: RcsbFvContextManager, rowConfigData?: RcsbFvRowConfigInterface[]) {
        this.rowStatusMap = rowStatusMap;
        this.contextManager = contextManager;
        if(rowConfigData)
            this.rowConfigData = rowConfigData.map(r=>this.checkRow(r));
       this.subscription = this.subscribe();
    }

    public getBoardData(): RcsbFvExtendedRowConfigInterface[] {
        return this.rowConfigData;
    }

    public setBoardData(rowConfigData: RcsbFvRowConfigInterface[]): void {
        this.rowConfigData  = rowConfigData.map(r=>this.checkRow(r));
    }

    /**Adds a new track to the board
     * @param configRow Track configuration object
     * */
    public addTrack(configRow: RcsbFvRowConfigInterface): void{
        this.rowConfigData.push( {
            ...this.checkRow(configRow),
            renderSchedule: "sync"
        } );
    }

    /**Modifies visibility of a board track
     * @param obj Target track id and visibility flag (true/false)
     * */
    public changeTrackVisibility(obj: TrackVisibilityInterface): void{
        const row = this.rowConfigData.find(r=>r.trackId === obj.trackId)
        if(!row)
            return;
        row.trackVisibility = obj.visibility;
        row.key = BoardDataState.generateKey(row);
    }

    public moveTrack(move: {oldIndex: number, newIndex: number}): void {
        arrayMoveMutable(this.rowConfigData,move.oldIndex,move.newIndex);
    }

    /**Replace board track rack data
     * @param obj New track data and target track id
     * */
    public updateTrackData(obj: TrackDataInterface): void{
        this.changeTrackData(obj,"replace");
    }

    /**Add new data to a given board track
     * @param obj Additional track data and target track id
     * */
    public addTrackData(obj: TrackDataInterface): void{
        this.changeTrackData(obj,"add");
    }

    /**Rerender the board track
     * @param trackId Id that identifies the track
     * */
    public resetTrack(trackId:string): void{
        const row = this.rowConfigData.find(r=>r.trackId === trackId)
        if(!row)
            return;
        row.key = BoardDataState.generateKey(row);
        row.renderSchedule = "sync";
    }

    public unsubscribe(): void {
        this.subscription.unsubscribe();
    }

    /**Modifies a board track data
     * @param obj Additional track data and target track id
     * @param flag Replace track data or add data to the current one
     * */
    private changeTrackData(obj: TrackDataInterface, flag: "replace"|"add"): void{
        const row = this.rowConfigData.find(r=>r.trackId === obj.trackId)
        if(!row)
            return;
        if(row.displayType != RcsbFvDisplayTypes.COMPOSITE) {
            if(flag === "replace")
                row.trackData = obj.trackData;
            else if(flag === "add" && row.trackData instanceof Array)
                row.trackData = row.trackData.concat(obj.trackData);
        } else if(row.displayType === RcsbFvDisplayTypes.COMPOSITE && row.displayConfig instanceof Array) {
            row.displayConfig?.forEach((display: RcsbFvDisplayConfigInterface) => {
                if (display.displayId === obj.displayId) {
                    if (flag === "replace")
                        display.displayData = obj.trackData;
                    else if (flag === "add" && display.displayData instanceof Array)
                        display.displayData = display.displayData?.concat(obj.trackData);
                }
            });
        }
        row.key = BoardDataState.generateKey(row);
        row.renderSchedule = "sync"
    }

    private checkRow(d: RcsbFvRowConfigInterface): RcsbFvRowConfigInterface & {key:string} {
        d.trackId = d.trackId ?? uniqid("trackId_");
        d.trackVisibility = typeof d.trackVisibility != "boolean" ? d.trackVisibility : true;
        this.rowStatusMap.set(d.trackId,false);
        return {
            ...d,
            key: BoardDataState.generateKey(d)
        };
    }

    private static generateKey(d: RcsbFvRowConfigInterface): string {
        return `${d.trackId}_${uniqid("key_")}`;
    }

     private subscribe(): Subscription {
         return  this.contextManager.subscribe((o)=>{
            switch (o.eventType){
                case EventType.ROW_READY:
                    this.rowReady(o.eventData);
                    break;
            }
        });
    }

    /**Row Track Board Ready Event
     * @param rowData
     * */
    private rowReady(rowData:RowReadyInterface):void{
        this.rowStatusMap.set(rowData.rowId,true);
        this.contextManager.next({
            eventType: EventType.FRACTION_COMPLETED,
            eventData: Math.ceil(this.rowStatusMap.completed()/this.rowStatusMap.size()*100)
        })
        if(this.rowStatusMap.complete()){
            this.boardReady();
        }
    }

    private boardReady(){
        this.contextManager.next({
            eventType: EventType.BOARD_READY,
            eventData: null
        })
    }

}