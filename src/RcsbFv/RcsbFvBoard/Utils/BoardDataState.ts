import {RcsbFvDisplayConfigInterface, RcsbFvRowConfigInterface} from "../../RcsbFvConfig/RcsbFvConfigInterface";
import uniqid from "uniqid";
import {TrackDataInterface, TrackVisibilityInterface} from "../../RcsbFvContextManager/RcsbFvContextManager";
import {RcsbFvDisplayTypes} from "../../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {arrayMoveMutable} from "array-move";

export class BoardDataState {

    private rowConfigData: (RcsbFvRowConfigInterface & {key:string})[] = []

    constructor(rowConfigData?: RcsbFvRowConfigInterface[]) {
        if(rowConfigData)
            this.rowConfigData = rowConfigData.map(r=>BoardDataState.checkRow(r));
    }

    public getBoardData(): (RcsbFvRowConfigInterface & {key:string})[] {
        return this.rowConfigData;
    }

    public setBoardData(rowConfigData: RcsbFvRowConfigInterface[]): void {
        this.rowConfigData  = rowConfigData.map(r=>BoardDataState.checkRow(r));
    }

    /**Adds a new track to the board
     * @param configRow Track configuration object
     * */
    public addTrack(configRow: RcsbFvRowConfigInterface): void{
        this.rowConfigData.push( BoardDataState.checkRow(configRow) );
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
    }

    private static checkRow(d: RcsbFvRowConfigInterface): RcsbFvRowConfigInterface & {key:string} {
        d.trackId = d.trackId ?? uniqid("trackId_");
        d.trackVisibility = typeof d.trackVisibility != "boolean" ? d.trackVisibility : true;
        return {
            ...d,
            key: BoardDataState.generateKey(d)
        };
    }

    private static generateKey(d: RcsbFvRowConfigInterface): string {
        return `${d.trackId}_${uniqid("key_")}`;
    }

}