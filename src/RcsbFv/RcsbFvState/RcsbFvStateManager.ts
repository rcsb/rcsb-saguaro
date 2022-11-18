import {
    DomainViewInterface,
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerType,
    SetSelectionInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {RcsbScaleInterface} from "../../RcsbBoard/RcsbD3/RcsbD3ScaleFactory";
import {RcsbSelection} from "../../RcsbBoard/RcsbSelection";
import {Subscription} from "rxjs";

interface RcsbFvStateInterface {
    readonly boardId: string;
    readonly contextManager: RcsbFvContextManager;
    readonly xScale: RcsbScaleInterface;
    readonly selection: RcsbSelection;
}

/**
 * Board Selection and Scale Manager
 * */
export class RcsbFvStateManager {

    private readonly boardId: string;
    private readonly contextManager: RcsbFvContextManager;
    private readonly xScale: RcsbScaleInterface;
    private readonly selection: RcsbSelection;
    private readonly subscription: Subscription;

    constructor(config:RcsbFvStateInterface) {
        this.boardId = config.boardId;
        this.contextManager = config.contextManager;
        this.xScale = config.xScale;
        this.selection = config.selection;
        this.subscription = this.subscribe();
    }

    public unsubscribe(): void {
        this.subscription.unsubscribe();
    }

    /**Subscribe className to rxjs events (adding tracks, change scale, update board config)
     * @return rxjs Subscription object
     * */
    private subscribe(): Subscription{
        return this.contextManager.subscribe((obj:RcsbFvContextManagerType)=>{
            if(obj.eventType===EventType.DOMAIN_VIEW){
                this.setDomain(obj.eventData);
            }else if(obj.eventType===EventType.SET_SELECTION){
                this.setSelection(obj.eventData);
            }else if(obj.eventType===EventType.ADD_SELECTION){
                this.addSelection(obj.eventData);
            }
        });
    }

    /**Update selection object
     * @param newSelection new selection object
     * */
    private setSelection(newSelection: SetSelectionInterface): void {
        if(newSelection?.elements != null){
            const list: Array<{begin:number; end?:number; isEmpty?:boolean;}> = newSelection.elements instanceof Array ? newSelection.elements : [newSelection.elements];
            this.selection.setSelected(list.map((x) => {
                    return {
                        domId: this.boardId,
                        rcsbFvTrackDataElement: {
                            begin: x.begin,
                            end: x.end,
                            isEmpty: x.isEmpty,
                            nonSpecific: true
                        }
                    };
                }),
                newSelection.mode
            );
        }else{
            this.selection.clearSelection(newSelection?.mode);
        }
        this.select(newSelection?.mode ?? 'select');
    }

    /**Add elements to selection object
     * @param newSelection new selection elements to be added
     * */
    private addSelection(newSelection: SetSelectionInterface): void {
        if(newSelection?.elements != null){
            const list: Array<{begin:number; end?:number; isEmpty?:boolean;}> = newSelection.elements instanceof Array ? newSelection.elements : [newSelection.elements];
            this.selection.addSelected(list.map((x) => {
                    return {
                        domId: this.boardId,
                        rcsbFvTrackDataElement: {
                            begin: x.begin,
                            end: x.end,
                            isEmpty: x.isEmpty,
                            nonSpecific: true
                        }
                    };
                }),
                newSelection.mode
            );
            this.select(newSelection?.mode ?? 'select');
        }
    }

    /**Force current selection in all tracks.*/
    private select(mode:'select'|'hover'): void{
        this.contextManager.next({
            eventType: EventType.SELECTION,
            eventData: {
                trackId: this.boardId,
                mode:mode
            }
        });
    }

    /**Update d3 xScale domain
     * @param domainData new xScale domain
     * */
    private setDomain(domainData: DomainViewInterface): void {
        this.xScale.domain(domainData.domain);
        this.setScale();
    }

    /**Force all board track annotation cells to set xScale. Called when a new track has been added*/
    private setScale(): void{
        if(this.xScale!=null) {
            this.contextManager.next({
                eventType: EventType.SCALE,
                eventData: this.boardId
            });
        }
    }

}