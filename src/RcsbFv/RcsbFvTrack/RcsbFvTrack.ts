import {RcsbBoard} from '../../RcsbBoard/RcsbBoard';
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from '../RcsbFvConfig/RcsbFvDefaultConfigValues';
import {RcsbFvDisplay} from "./RcsbFvDisplay";
import {RcsbFvConfig} from "../RcsbFvConfig/RcsbFvConfig";
import {RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {
    RcsbFvTrackData,
    RcsbDataManager,
    RcsbFvTrackDataMap
} from "../../RcsbDataManager/RcsbDataManager";
import {RcsbDisplayInterface} from "../../RcsbBoard/RcsbDisplay/RcsbDisplayInterface";
import {
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, SelectionInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";
import {RcsbCompositeDisplay} from "../../RcsbBoard/RcsbDisplay/RcsbCompositeDisplay";
import {ScaleLinear} from "d3-scale";
import {RcsbSelection} from "../../RcsbBoard/RcsbSelection";

/**This className provides  an abstraction layer to build and manage a particular board annotation cell*/
export class RcsbFvTrack {
    /**SVG/HTML level object manager*/
    private rcsbBoard: RcsbBoard;
    /**Board annotation cells may contain different tracks to avoid visual overlapping*/
    private rcsbTrackArray: Array<RcsbDisplayInterface> = new Array<RcsbDisplayInterface>();
    /**Object that handles how data needs to be displayed*/
    private rcsbFvDisplay: RcsbFvDisplay;
    /**Row configuration object*/
    private rcsbFvConfig: RcsbFvConfig;
    /**DOM element id where the SVG component will be rendered*/
    private elementId: string;
    /**Row annotation data*/
    private trackData:  RcsbFvTrackData | Array<RcsbFvTrackData>;
    /**Annotation loaded data flag*/
    private loadedData: boolean;
    /**Callback function to update row height*/
    private readonly updateRowHeight: ()=>void;
    /**Event handler subscription*/
    private subscription: Subscription;
    /**Event Handler Manager. This is a common object for all board annotation cells*/
    private readonly contextManager: RcsbFvContextManager;
    /**X-Scale d3 object. This is a common for all board annotation cells*/
    private readonly xScale: ScaleLinear<number,number>;
    /**Current selection object. This is a common for all board annotation cells*/
    private readonly selection: RcsbSelection;

    public constructor(args:RcsbFvRowConfigInterface, xScale: ScaleLinear<number,number>, selection: RcsbSelection, contextManager: RcsbFvContextManager, updateRowHeight:()=>void) {
        this.contextManager = contextManager;
        this.updateRowHeight = updateRowHeight;
        this.xScale = xScale;
        this.selection = selection;
        if (typeof args.elementId === "string" && document.getElementById(args.elementId) != null) {
            this.rcsbBoard = new RcsbBoard(args.elementId, xScale, this.selection, this.contextManager);
        }
        this.buildTrack(args);
        this.subscription = this.subscribe();
    }

    /**Builds the board annotation cell
     * @param args Board track configuration object
     * */
    private buildTrack(args:RcsbFvRowConfigInterface) : void{
        this.setConfig(args);
        if(typeof this.rcsbFvConfig.elementId === "string"){
            this.init(this.rcsbFvConfig.elementId);
        }
        if(typeof this.rcsbFvConfig.trackData != "undefined" && this.rcsbFvConfig.displayType != RcsbFvDisplayTypes.COMPOSITE ){
            this.load(this.rcsbFvConfig.trackData);
        }else if(this.rcsbFvConfig.displayType === RcsbFvDisplayTypes.COMPOSITE){
            const data: Array<RcsbFvTrackData> | null = this.collectCompositeData();
            if(data != null) {
                this.load(data);
            }
        }else{
            this.buildRcsbTrack();
        }
        this.start();
    }

    /**Start rendering the board track annotation cell
     * @param elementId DOM element Id
     * */
    public init(elementId: string) : void{
        if(document.getElementById(elementId)!= null) {
            this.elementId = elementId;
            if(this.rcsbBoard === null){
                this.rcsbBoard = new RcsbBoard(this.elementId, this.xScale, this.selection, this.contextManager);
            }
            if (this.rcsbFvConfig.configCheck()) {
                this.initRcsbBoard();
            }else{
                throw "Board length is not defined";
            }
        }else{
            throw "HTML element "+elementId+" not found";
        }
    }

    /**Replaces the track configuration
     * @param args Board row configuration object
     * */
    public setConfig(args: RcsbFvRowConfigInterface) : void{
        if(this.rcsbFvConfig == null) {
            this.rcsbFvConfig = new RcsbFvConfig(args);
        }else{
            this.rcsbFvConfig.updateConfig(args);
        }
    }

    /**Sets parameters for the SVG/HTML level object manager*/
    private initRcsbBoard(): void{
        if(typeof this.rcsbFvConfig.elementClickCallBack === "function")
            this.rcsbBoard.setElementClickCallBack(this.rcsbFvConfig.elementClickCallBack);

        if(this.rcsbFvConfig.highlightHoverPosition === true) {
            this.rcsbBoard.setHighlightHoverPosition();
        }
        if(this.rcsbFvConfig.highlightHoverElement === true) {
            this.rcsbBoard.setHighlightHoverElement(true);
        }
        if(typeof this.rcsbFvConfig.highlightHoverCallback === "function"){
            this.rcsbBoard.addHoverCallBack(this.rcsbFvConfig.highlightHoverCallback);
        }

        if(typeof this.rcsbFvConfig.trackWidth === "number")
            this.rcsbBoard.setBoardWidth(this.rcsbFvConfig.trackWidth);

        if(typeof this.rcsbFvConfig.range === "object")
            this.rcsbBoard.setRange(this.rcsbFvConfig.range.min-RcsbFvDefaultConfigValues.increasedView, this.rcsbFvConfig.range.max+RcsbFvDefaultConfigValues.increasedView);
        else if(typeof this.rcsbFvConfig.length === "number")
            this.rcsbBoard.setRange(1-RcsbFvDefaultConfigValues.increasedView, this.rcsbFvConfig.length+RcsbFvDefaultConfigValues.increasedView);
    }

    /**Build an inner track within a board track annotation cell
     * @return Inner track display object
     * */
    private buildRcsbTrack(): RcsbDisplayInterface{
        this.rcsbFvDisplay = new RcsbFvDisplay(this.rcsbFvConfig);
        const rcsbTrack: RcsbDisplayInterface = this.rcsbFvDisplay.initDisplay();
        rcsbTrack.height( this.rcsbFvConfig.trackHeight );
        rcsbTrack.trackColor( this.rcsbFvConfig.trackColor );
        this.rcsbTrackArray.push(rcsbTrack);
        return rcsbTrack;
    }

    /**Transforms data of composite displays
     * @return Array of annotation objects
     * */
    private collectCompositeData(): Array<RcsbFvTrackData> | null {
        const data: Array<RcsbFvTrackData> = new Array<RcsbFvTrackData>();
        if(this.rcsbFvConfig?.displayConfig!=undefined) {
            for (let displayItem of this.rcsbFvConfig.displayConfig) {
                if (typeof displayItem.displayData != "undefined") {
                    data.push(displayItem.displayData);
                }
            }
            if (data.length == this.rcsbFvConfig.displayConfig.length) {
                return data;
            }
        }
        return null;
    }

    /**Class inner function that transform annotation data for composite or single displays
     * @param trackData array of annotation objects
     * */
    private load(trackData:  RcsbFvTrackData | Array<RcsbFvTrackData>): void{
        this.trackData = trackData;
        this.loadedData = true;
        if( this.rcsbFvConfig.displayType === RcsbFvDisplayTypes.COMPOSITE && trackData instanceof Array){
            const trackNonOverlappingMap: Array<Array<RcsbFvTrackData>> = new Array<Array<RcsbFvTrackData>>();
            let maxTracks:number = 1;
            (trackData as Array<RcsbFvTrackData>).forEach((f,i)=>{
                if(!this.rcsbFvConfig.overlap) {
                    const nonOverlapping: Array<RcsbFvTrackData> = RcsbDataManager.getNonOverlappingData(f);
                    trackNonOverlappingMap.push(nonOverlapping);
                    if(nonOverlapping.length > maxTracks)
                        maxTracks = nonOverlapping.length;
                }else {
                    trackNonOverlappingMap.push([f]);
                }

            });

            for(let i=0;i<maxTracks;i++){
                const rcsbCompositeTrack: RcsbDisplayInterface = this.buildRcsbTrack();
                if(this.rcsbFvConfig?.trackHeight != undefined)
                    (rcsbCompositeTrack as RcsbCompositeDisplay).setCompositeHeight(i*this.rcsbFvConfig.trackHeight);
                const displayIds: Array<string> = this.rcsbFvDisplay.getDisplayIds();
                const trackDataMap: RcsbFvTrackDataMap = new RcsbFvTrackDataMap();
                trackNonOverlappingMap.forEach((v,j)=>{
                    const id: string = displayIds[j];
                    if(i<v.length)
                        trackDataMap.set(id,v[i]);
                    else
                        trackDataMap.set(id,[]);
                });
                rcsbCompositeTrack.load(trackDataMap);
            }
        }else if (trackData instanceof RcsbFvTrackData){
            let nonOverlapping: Array<RcsbFvTrackData>;
            if(!this.rcsbFvConfig.overlap) {
                nonOverlapping = RcsbDataManager.getNonOverlappingData(trackData);
            }else{
                nonOverlapping = [trackData];
            }
            nonOverlapping.forEach(trackData=>{
                this.buildRcsbTrack().load(trackData);
            });
        }else{
            this.loadedData = false;
            throw "Data loader error. Data type not supported.";
        }
    }

    /**Add all inner track to the SVG/HTML level manager and start rendering*/
    private start() : void{
        this.rcsbTrackArray.forEach(track=>{
            this.rcsbBoard.addTrack(track);
        });
        this.rcsbBoard.startBoard();
    }

    /**Subscribe function to handle events and communicate all board track annotations cell panels
     * @return Subscription object
     * */
    private subscribe(): Subscription{
        return this.contextManager.subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EventType.SCALE) {
                this.setScale(obj.eventData as string);
            }else if(obj.eventType===EventType.SELECTION){
                this.setSelection(obj.eventData as SelectionInterface);
            }else if(obj.eventType===EventType.RESET){
                this.reset(obj.eventData as string);
            }
        });
    }

    /**Unsubscribe all functions
     * */
    public unsubscribe(): void{
        this.subscription.unsubscribe();
        this.rcsbBoard.removeScrollEvent();
    }

    /**Modify d3 x-scale
     * @param boardId Id of the SVG/HTML manager that triggered the event
     * */
    private setScale(boardId: string) : void {
        this.rcsbBoard.setScale(boardId);
    }

    /**Highlights the region(s) defined by the attribute selection
     * @param selection object describing sequence regions
     * */
    private setSelection(selection:SelectionInterface) : void {
        this.rcsbBoard.setSelection(selection.trackId, selection.mode);
    }

    /**Reset the cell content
     * @param trackId Event reset object interface
     * */
    private reset(trackId: string){
        if(this.rcsbFvConfig.trackId === trackId){
            this._reset();
        }
    }

    /**Reset all inner tracks*/
    private _reset(): void{
        this.rcsbTrackArray = new Array<RcsbDisplayInterface>();
        this.rcsbBoard.reset();
    }

    /**Calculate height as function of the number of inner tracks
     * @return Board track annotation cell height
     * */
    public getTrackHeight(): number | null{
        if(this.rcsbTrackArray.length > 0 && this.rcsbFvConfig?.trackHeight != undefined) {
            return this.rcsbTrackArray.length * this.rcsbFvConfig.trackHeight;
        }else if( this.rcsbFvConfig?.trackHeight != undefined ){
            return this.rcsbFvConfig.trackHeight;
        }else{
            return null;
        }
    }
}