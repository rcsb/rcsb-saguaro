import * as React from "react";
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvRow} from "../RcsbFvRow/RcsbFvRow";
import {
    RcsbFvBoardConfigInterface,
    RcsbFvDisplayConfigInterface,
    RcsbFvRowConfigInterface
} from "../RcsbFvConfig/RcsbFvConfigInterface";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

import {
    DomainViewInterface,
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface,
    SetSelectionInterface,
    TrackDataInterface,
    TrackVisibilityInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {RcsbSelection} from "../../RcsbBoard/RcsbSelection";
import {createPopper} from "@popperjs/core";
import {RcsbFvUI} from "../RcsbFvUI/RcsbFvUI";
import {RcsbFvDOMConstants} from "../RcsbFvConfig/RcsbFvDOMConstants";

/**Board React component configuration interface*/
export interface RcsbFvBoardFullConfigInterface {
    readonly rowConfigData: Array<RcsbFvRowConfigInterface>;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
}

/**Board React component interface*/
interface RcsbFvBoardInterface extends RcsbFvBoardFullConfigInterface {
    readonly contextManager: RcsbFvContextManager;
    readonly resolve: ()=> void;
}

/**Board React component state interface*/
interface RcsbFvBoardState {
    readonly rowConfigData: Array<RcsbFvRowConfigInterface>;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
    readonly progressStatus: number;
}

/**Board React component style interface*/
interface RcsbFvBoardStyleInterface{
    readonly width: number;
}


/**Board React Component className*/
export class RcsbFvBoard extends React.Component <RcsbFvBoardInterface, RcsbFvBoardState > {

    /**Inner div board DOM element id*/
    private readonly boardId : string = "RcsbFvBoard_"+Math.random().toString(36).substr(2);
    /**Array of inner div board track DOM element ids*/
    private readonly rcsbFvRowArrayIds : Array<string> = new Array<string>();
    /**Subscription to events*/
    private subscription: Subscription;
    /**Global d3 Xscale object shaed among all board tracks*/
    private readonly xScale: ScaleLinear<number,number> = scaleLinear();
    /**Global selection shared among all tracks*/
    private readonly selection:RcsbSelection = new RcsbSelection();
    /**Flag to activate Glow. Helps solving the repeating Glow bug*/
    private activateGlowFlag: boolean = true;
    /**Mouse Leave Callback process Id*/
    private mouseLeaveCallbackId: number = 0;
    /**Row Track Board Status. True when the board content has been rendered*/
    private readonly rowBoardReadyStatus: Map<string,boolean> = new Map<string, boolean>();
    /**Promise resolve callback when board is ready*/
    private resolveOnReady: (()=>void) | undefined = undefined;


    readonly state : RcsbFvBoardState = {
        /**Array of configurations for each board track*/
        rowConfigData: this.props.rowConfigData,
        /**Board global configuration*/
        boardConfigData: this.props.boardConfigData,
        /**Row Track Board rendered status (%)*/
        progressStatus: 0
    };

    constructor(props: RcsbFvBoardInterface) {
        super(props);
        this.resolveOnReady = props.resolve;
    }

    render(): JSX.Element{
        let rcsbFvRowAxis = null;
        let rowIndexShift = 0;
        if(this.state.boardConfigData.includeAxis === true){
            const rowId: string = "RcsbFvRow_"+Math.random().toString(36).substr(2);
            this.rcsbFvRowArrayIds.push(rowId);
            const rowData:RcsbFvRowConfigInterface = {displayType:RcsbFvDisplayTypes.AXIS, trackId:"axisId_"+Math.random().toString(36).substr(2), boardId:this.boardId};
            const rowConfigData: RcsbFvRowConfigInterface = this.configRow(rowId,rowData);
            this.rowBoardReadyStatus.set(rowId,false);
            rcsbFvRowAxis = <RcsbFvRow
                key={rowId}
                id={rowId}
                boardId={this.boardId}
                rowNumber={0}
                rowConfigData={rowConfigData}
                xScale={this.xScale}
                selection={this.selection}
                contextManager={this.props.contextManager}
                firstRow={false}
                lastRow={false}
                addBorderBottom={false}
            />;
            rowIndexShift = 1;
        }
        this.renderStarts();
        return (
            <div className={classes.rcsbFvRootContainer} onMouseOver={this.setMouseOverCallback()} onMouseLeave={this.setMouseLeaveCallback()}>
                <div id={this.boardId} className={classes.rcsbFvBoard} style={this.configStyle()} onMouseLeave={this.setMouseLeaveBoardCallback()}>
                    {rcsbFvRowAxis}
                    {
                        this.state.rowConfigData.filter((rowData: RcsbFvRowConfigInterface) =>{
                            return rowData.trackVisibility != false;
                        }).map((rowData: RcsbFvRowConfigInterface, n) =>{
                            const rowId: string = "RcsbFvRow_"+Math.random().toString(36).substr(2);
                            this.rcsbFvRowArrayIds.push(rowId);
                            const rowConfigData = this.configRow(rowId,rowData);
                            this.rowBoardReadyStatus.set(rowId,false);
                            return (<RcsbFvRow
                                key={rowId}
                                id={rowId}
                                boardId={this.boardId}
                                rowNumber={n+rowIndexShift}
                                rowConfigData={rowConfigData}
                                xScale={this.xScale}
                                selection={this.selection}
                                contextManager={this.props.contextManager}
                                firstRow={ n==0 }
                                lastRow={ n == (this.state.rowConfigData.length-1) }
                                addBorderBottom={!(this.state.boardConfigData.hideInnerBorder ?? RcsbFvDefaultConfigValues.hideInnerBorder)}
                            />);
                        })
                    }
                </div>
                <div id={this.boardId+RcsbFvDOMConstants.TOOLTIP_DOM_ID_PREFIX} className={classes.rcsbFvTooltip} {...{[RcsbFvDOMConstants.POPPER_HIDDEN]:""}} />
                <div id={this.boardId+RcsbFvDOMConstants.TOOLTIP_DESCRIPTION_DOM_ID_PREFIX} className={classes.rcsbFvTooltipDescription} {...{[RcsbFvDOMConstants.POPPER_HIDDEN]:""}} />
                <div id={this.boardId+RcsbFvDOMConstants.GLOW_DOM_ID_PREFIX} >
                    <div />
                </div>
                <div id={this.boardId+RcsbFvDOMConstants.GLOW_ROW_DOM_ID_SUFFIX} >
                    <div style={{borderWidth: RcsbFvDefaultConfigValues.rowGlowWidth, borderColor: RcsbFvDefaultConfigValues.rowGlowColor }}/>
                </div>
                <RcsbFvUI boardId={this.boardId} boardConfigData={this.state.boardConfigData} xScale={this.xScale} setDomain={this.setDomain.bind(this)}/>
                <div id={this.boardId+RcsbFvDOMConstants.PROGRESS_DIV_DOM_ID_PREFIX} {...{[RcsbFvDOMConstants.POPPER_HIDDEN]:""}} className={classes.rowTrackBoardSatus} >LOADING <span/></div>
            </div>
        );
    }

    componentDidMount(): void {
        this.subscription = this.subscribe();
        if(typeof this.state.boardConfigData.selectionChangeCallBack === "function")
            this.selection.setSelectionChangeCallback(this.state.boardConfigData.selectionChangeCallBack);
    }

    /**Returns the full track width (title+annotations)
     * @return Board track full width
     * */
    private configStyle() : RcsbFvBoardStyleInterface {
        let titleWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.state.boardConfigData.rowTitleWidth === "number"){
            titleWidth = this.state.boardConfigData.rowTitleWidth;
        }

        let trackWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.state.boardConfigData.trackWidth === "number"){
            trackWidth = this.state.boardConfigData.trackWidth;
        }

        return {
            width: (titleWidth+trackWidth+(this.state.boardConfigData.borderWidth ?? RcsbFvDefaultConfigValues.borderWidth)*2+RcsbFvDefaultConfigValues.titleAndTrackSpace)
        };
    }

    /**Combines global board configuration attributes and values with a particular track configuration object
     * @param id Inner div board track DOM element Id
     * @param config Track configuration object
     * @return Config track object
     * */
    private configRow(id:string, config: RcsbFvRowConfigInterface) : RcsbFvRowConfigInterface{
        const out: RcsbFvRowConfigInterface = Object.assign({},config);
        out.elementId = id;
        out.boardId = this.boardId;
        if(typeof this.state.boardConfigData.length === "number"){
            out.length = this.state.boardConfigData.length;
        }
        if(typeof this.state.boardConfigData.range === "object"){
            out.range = this.state.boardConfigData.range;
        }
        if(typeof this.state.boardConfigData.rowTitleWidth === "number"){
            out.rowTitleWidth = this.state.boardConfigData.rowTitleWidth;
        }
        if(typeof this.state.boardConfigData.trackWidth === "number"){
            out.trackWidth = this.state.boardConfigData.trackWidth;
        }
        if(typeof this.state.boardConfigData.elementClickCallBack === "function"){
            out.elementClickCallBack = this.state.boardConfigData.elementClickCallBack;
        }
        if(typeof this.state.boardConfigData.elementEnterCallBack === "function"){
            out.elementEnterCallBack = this.state.boardConfigData.elementEnterCallBack;
        }
        if(typeof this.state.boardConfigData.elementLeaveCallBack === "function"){
            out.elementLeaveCallBack = this.state.boardConfigData.elementLeaveCallBack;
        }
        if(typeof this.state.boardConfigData.highlightHoverPosition === "boolean"){
            out.highlightHoverPosition = this.state.boardConfigData.highlightHoverPosition;
        }
        if(typeof this.state.boardConfigData.highlightHoverElement === "boolean"){
            out.highlightHoverElement = this.state.boardConfigData.highlightHoverElement;
        }
        if(typeof this.state.boardConfigData.highlightHoverCallback === "function") {
            out.highlightHoverCallback = this.state.boardConfigData.highlightHoverCallback;
        }
        if(typeof this.state.boardConfigData.borderWidth === "number"){
            out.borderWidth = this.state.boardConfigData.borderWidth;
        }
        if(typeof this.state.boardConfigData.borderColor === "string"){
            out.borderColor = this.state.boardConfigData.borderColor;
        }
        if(typeof this.state.boardConfigData.hideInnerBorder === "boolean"){
            out.hideInnerBorder = this.state.boardConfigData.hideInnerBorder;
        }
        if(typeof this.state.boardConfigData.hideRowGlow === "boolean"){
            out.hideRowGlow = this.state.boardConfigData.hideRowGlow;
        }
        if(typeof this.state.boardConfigData.includeTooltip === "boolean"){
            out.includeTooltip = this.state.boardConfigData.includeTooltip;
        }
        return out;
    }

    /**Adds a new track to the board
     * @param configRow Track configuration object
     * */
    private addRow(configRow: RcsbFvRowConfigInterface): void{
        const rowConfigData: Array<RcsbFvRowConfigInterface> = this.state.rowConfigData;
        rowConfigData.push(configRow);
        this.setState({rowConfigData: rowConfigData, boardConfigData:this.state.boardConfigData} as RcsbFvBoardState);
        this.setScale();
    }

    /**Updates board configuration
     * @param configData Board and track configuration interface
     * */
    private updateBoardConfig(configData: Partial<RcsbFvBoardFullConfigInterface>): void {
        this.xScale.domain([0,1]);
        if(configData.rowConfigData!=null && configData.boardConfigData!=null){
            this.setState({rowConfigData: configData.rowConfigData, boardConfigData: {...this.state.boardConfigData, ...configData.boardConfigData}} );
        }else if(configData.boardConfigData!=null){
            this.setState({boardConfigData: {...this.state.boardConfigData, ...configData.boardConfigData}} );
        }else if(configData.rowConfigData!=null){
            this.setState({rowConfigData: configData.rowConfigData} );
        }
    }

    private inactivateHover(): void{
        this.activeMouseOver(false);
        this.hideUI();
        const glowDiv: HTMLElement|null = document.getElementById(this.boardId+RcsbFvDOMConstants.GLOW_DOM_ID_PREFIX);
        if(glowDiv!=null){
            glowDiv.className = classes.rcsbNoGlow;
            this.activateGlowFlag = true;
            const innerGlowDiv: HTMLElement|undefined = glowDiv.getElementsByTagName("div")[0];
            glowDiv.style.top = "0px";
            glowDiv.style.marginLeft = "0px";
            innerGlowDiv.style.height = "0px";
            innerGlowDiv.style.width = "0px";
        }
        this.rowBoardReadyStatus.clear();
    }

    /**Replace board track rack data
     * @param obj New track data and target track id
     * */
    private updateTrackData(obj: TrackDataInterface, ): void{
        this.changeTrackData(obj,"replace");
    }

    /**Add new data to a given board track
     * @param obj Additional track data and target track id
     * */
    private addTrackData(obj: TrackDataInterface): void{
        this.changeTrackData(obj,"add");
    }

    /**Modifies a board track data
     * @param obj Additional track data and target track id
     * @param flag Replace track data or add data to the current one
     * */
    private changeTrackData(obj: TrackDataInterface, flag: "replace"|"add"): void{
        const rowConfigData: Array<RcsbFvRowConfigInterface> = this.state.rowConfigData;
        rowConfigData.forEach((rowConfig:RcsbFvRowConfigInterface)=>{
            if(rowConfig.trackId === obj.trackId){
                if(rowConfig.displayType != RcsbFvDisplayTypes.COMPOSITE) {
                    if(flag === "replace")
                        rowConfig.trackData = obj.trackData;
                    else if(flag === "add" && rowConfig.trackData instanceof Array)
                        rowConfig.trackData = rowConfig.trackData?.concat(obj.trackData);
                }
                else if(rowConfig.displayType === RcsbFvDisplayTypes.COMPOSITE && rowConfig.displayConfig instanceof Array)
                    rowConfig.displayConfig?.forEach((display: RcsbFvDisplayConfigInterface)=>{
                        if(display.displayId === obj.displayId){
                            if(flag === "replace")
                                display.displayData = obj.trackData;
                            else if(flag === "add" && display.displayData instanceof Array)
                                display.displayData = display.displayData?.concat(obj.trackData);
                        }
                    });
            }
        });
        this.setState({rowConfigData: rowConfigData, boardConfigData:this.state.boardConfigData});
        this.setScale();
    }

    private setMouseOverCallback(): (()=>void)|undefined{
        if(this.props.boardConfigData.hideTrackFrameGlow)
            return undefined;
        else
            return this.onMouseOver.bind(this);
    }

    private setMouseLeaveCallback(): (()=>void)|undefined{
        if(this.props.boardConfigData.hideTrackFrameGlow)
            return undefined;
        else
            return this.onMouseLeave.bind(this);
    }

    private setMouseLeaveBoardCallback(): (()=>void)|undefined{
        if(this.props.boardConfigData.highlightHoverPosition === true || typeof this.props.boardConfigData.highlightHoverCallback === "function")
            return this.mouseLeaveBoardCallback.bind(this);
        else
            return undefined;
    }

    private mouseLeaveBoardCallback(): void{
        if(this.props.boardConfigData.highlightHoverPosition === true){
            this.setSelection({
                elements:null,
                mode:'hover'
            });
        }
        if(this.props.boardConfigData.highlightHoverCallback){
            this.props.boardConfigData.highlightHoverCallback(this.selection.getSelected('hover').map(r=>r.rcsbFvTrackDataElement));
        }
    }

    private onMouseOver (): void{
        this.onMouseOverAttribute.call(this);
    }
    private onMouseOverAttribute: ()=>void = ()=>{};
    private onMouseOverCallback(): void{
        if(this.activateGlowFlag) {
            window?.clearTimeout(this.mouseLeaveCallbackId);
            this.activateGlowFlag = false;
            const mainDiv: HTMLElement | null = document.getElementById(this.boardId);
            if (mainDiv != null) {
                const mainDivSize: DOMRect = mainDiv.getBoundingClientRect();
                const axisDivSize: number = mainDiv.getElementsByClassName(classes.rcsbFvRowAxis)[0]?.getBoundingClientRect().height ?? 0;
                const height: number = mainDivSize.height - axisDivSize;
                const glowDiv: HTMLElement | null = document.getElementById(this.boardId + RcsbFvDOMConstants.GLOW_DOM_ID_PREFIX);
                if (glowDiv != null) {
                    const innerGlowDiv: HTMLElement | undefined = glowDiv.getElementsByTagName("div")[0];
                    const trackWidth: number = (this.state.boardConfigData.trackWidth ?? 0) + 2*(this.state.boardConfigData.borderWidth ?? RcsbFvDefaultConfigValues.borderWidth);
                    const titleWidth: number = (this.state.boardConfigData.rowTitleWidth ?? RcsbFvDefaultConfigValues.rowTitleWidth);
                    glowDiv.style.top = "-" + height + "px";
                    glowDiv.style.marginLeft = titleWidth + RcsbFvDefaultConfigValues.titleAndTrackSpace + "px";
                    glowDiv.className = classes.rcsbGlow;
                    innerGlowDiv.style.height = (height) + "px";
                    innerGlowDiv.style.width = trackWidth + "px";
                }
            }
            this.displayUI();
        }else{
            window?.clearTimeout(this.mouseLeaveCallbackId);
        }
    }

    private onMouseLeave (): void{
        this.onMouseLeaveAttribute.call(this);
    }
    private onMouseLeaveAttribute: ()=>void = ()=>{}
    private onMouseLeaveCallback(): void{
        this.mouseLeaveCallbackId = window?.setTimeout(()=>{
            this.hideUI();
            const glowDiv: HTMLElement|null = document.getElementById(this.boardId+RcsbFvDOMConstants.GLOW_DOM_ID_PREFIX);
            if(glowDiv!=null){
                glowDiv.className = classes.rcsbNoGlow;
                this.activateGlowFlag = true;
                this.mouseLeaveCallbackId = window.setTimeout(()=>{
                    const innerGlowDiv: HTMLElement|undefined = glowDiv.getElementsByTagName("div")[0];
                    glowDiv.style.top = "0px";
                    glowDiv.style.marginLeft = "0px";
                    innerGlowDiv.style.height = "0px";
                    innerGlowDiv.style.width = "0px";
                },300);
            }
        },500);
        this.hideGlowRow();
    }

    private hideGlowRow(): void{
        const glowDiv: HTMLElement | null = document.getElementById(this.boardId + RcsbFvDOMConstants.GLOW_ROW_DOM_ID_SUFFIX);
        if (glowDiv != null) {
            const innerGlowDiv: HTMLElement | undefined = glowDiv.getElementsByTagName("div")[0];
            glowDiv.style.top = "0px";
            glowDiv.style.marginLeft = "0px";
            glowDiv.className = classes.rcsbNoRowGlow;
            innerGlowDiv.style.height = "0px";
            innerGlowDiv.style.width = "0px";
        }
    }

    private updateGlow(): void{
        const mainDiv: HTMLElement | null = document.getElementById(this.boardId);
        if (mainDiv != null) {
            const mainDivSize: DOMRect = mainDiv.getBoundingClientRect();
            const axisDivSize: number = document.getElementsByClassName(classes.rcsbFvRowAxis)[0]?.getBoundingClientRect().height ?? 0;
            const height: number = mainDivSize.height - axisDivSize;
            const glowDiv: HTMLElement | null = document.getElementById(this.boardId + RcsbFvDOMConstants.GLOW_DOM_ID_PREFIX);
            if (glowDiv != null) {
                const innerGlowDiv: HTMLElement | undefined = glowDiv.getElementsByTagName("div")[0];
                glowDiv.style.top = "-" + height+ "px";
                innerGlowDiv.style.height = height + "px";
            }
        }
    }

    private displayUI(): void{
        if(this.state.boardConfigData.disableMenu)
            return;
        const refDiv: HTMLDivElement | null= document.querySelector("#"+this.boardId);
        if(refDiv == null)
            return;
        const tooltipDiv: HTMLDivElement  | null= document.querySelector("#"+this.boardId+RcsbFvDOMConstants.UI_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            return;
        const offsetHeight: number = this.state.boardConfigData.includeAxis === true ? RcsbFvDefaultConfigValues.trackAxisHeight + 2 : 0;
        createPopper(refDiv, tooltipDiv, {
            placement:'right-start',
            modifiers: [{
                name: 'offset',
                options: {
                    offset: [offsetHeight,0]
                }
            }]
        }).forceUpdate();
        tooltipDiv.classList.remove(classes.rcsbSmoothDivHide);
        tooltipDiv.classList.add(classes.rcsbSmoothDivDisplay);
    }

    private hideUI(): void{
        if(this.state.boardConfigData.disableMenu)
            return;
        const tooltipDiv: HTMLDivElement  | null= document.querySelector("#"+this.boardId+RcsbFvDOMConstants.UI_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            return;
        tooltipDiv.classList.remove(classes.rcsbSmoothDivDisplay);
        tooltipDiv.classList.add(classes.rcsbSmoothDivHide);
    }

    componentWillUnmount(): void {
        this.props.contextManager.unsubscribeAll();
        this.rcsbFvRowArrayIds.length = 0;
    }

    private resetReadyStatus(resolve: (()=>void) | undefined): void {
        this.inactivateHover();
        this.resolveOnReady = resolve;
    }

    /**Subscribe className to rxjs events (adding tracks, change scale, update board config)
     * @return rxjs Subscription object
     * */
    private subscribe(): Subscription{
        return this.props.contextManager.subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EventType.ADD_TRACK){
                this.resetReadyStatus(obj.eventResolve);
                this.addRow(obj.eventData as RcsbFvRowConfigInterface);
            }else if(obj.eventType===EventType.UPDATE_BOARD_CONFIG){
                this.resetReadyStatus(obj.eventResolve);
                this.updateBoardConfig(obj.eventData as RcsbFvBoardFullConfigInterface);
            }else if(obj.eventType===EventType.TRACK_VISIBILITY){
                this.changeTrackVisibility(obj.eventData as TrackVisibilityInterface);
            }else if(obj.eventType===EventType.ADD_TRACK_DATA){
                this.resetReadyStatus(obj.eventResolve);
                this.addTrackData(obj.eventData as TrackDataInterface);
            }else if(obj.eventType===EventType.UPDATE_TRACK_DATA){
                this.resetReadyStatus(obj.eventResolve);
                this.updateTrackData(obj.eventData as TrackDataInterface);
            }else if(obj.eventType===EventType.DOMAIN_VIEW){
                this.setDomain(obj.eventData as DomainViewInterface);
            }else if(obj.eventType===EventType.UPDATE_GLOW){
                this.updateGlow();
            }else if(obj.eventType===EventType.BOARD_READY){
                this.boardReady(obj.eventData as string);
            }else if(obj.eventType===EventType.SET_SELECTION){
                this.setSelection(obj.eventData as SetSelectionInterface);
            }else if(obj.eventType===EventType.ADD_SELECTION){
                this.addSelection(obj.eventData as SetSelectionInterface);
            }
        });
    }

    /**Unsubscribe className to rxjs events. Useful if many panels are created an destroyed.*/
    private unsubscribe(): void{
        this.subscription.unsubscribe();
    }

    /**Force all board track annotation cells to set xScale. Called when a new track has been added*/
    private setScale(): void{
        if(this.xScale!=null) {
            this.props.contextManager.next({
                eventType: EventType.SCALE,
                eventData: this.boardId
            } as RcsbFvContextManagerInterface);
        }
    }

    /**Modifies visibility of a board track
     * @param obj Target track id and visibility flag (true/false)
     * */
    private changeTrackVisibility(obj: TrackVisibilityInterface): void{
        const rowConfigData: Array<RcsbFvRowConfigInterface> = this.state.rowConfigData;
        rowConfigData.forEach((rowConfig:RcsbFvRowConfigInterface)=>{
            if(rowConfig.trackId === obj.trackId){
                rowConfig.trackVisibility = obj.visibility;
            }
        });
        this.setState({rowConfigData: rowConfigData, boardConfigData:this.state.boardConfigData});
        this.setScale();
    }

    /**Update d3 xScale domain
     * @param domainData new xScale domain
     * */
    private setDomain(domainData: DomainViewInterface): void {
        this.xScale.domain(domainData.domain);
        this.setScale();
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
        this.props.contextManager.next({
            eventType: EventType.SELECTION,
            eventData: {
                trackId: this.boardId,
                mode:mode
            }
        } as RcsbFvContextManagerInterface);
    }

    /**Row Track Board Ready Event
     * @param rowId
     * */
    private boardReady(rowId:string):void{
       this.rowBoardReadyStatus.set(rowId,true);
       const N: number = Array.from(this.rowBoardReadyStatus.values()).filter(a=>a).length;
       if( N == this.rowBoardReadyStatus.size){
           this.hideStatus();
           this.activeMouseOver(true);
           if(typeof this.resolveOnReady === "function")
               this.resolveOnReady();
       }else{
           if(N==1)
               this.showStatus();
           const statusDiv : HTMLElement | null = document.querySelector("#"+this.boardId+RcsbFvDOMConstants.PROGRESS_DIV_DOM_ID_PREFIX+" > span");
           if(statusDiv != null)
               statusDiv.innerHTML = Math.ceil(N/this.rowBoardReadyStatus.size*100).toString()+"%";
       }
    }

    private activeMouseOver(flag: boolean): void{
        if(flag) {
            this.onMouseLeaveAttribute = () => {
                this.onMouseLeaveCallback();
            }
            this.onMouseOverAttribute = () => {
                this.onMouseOverCallback();
            };
        }else{
            this.onMouseLeaveAttribute = () => {}
            this.onMouseOverAttribute = () => {};
        }
    }

    private showStatus(): void{
        const refDiv: HTMLDivElement | null= document.querySelector("#"+this.boardId);
        if(refDiv == null)
            return;
        const tooltipDiv: HTMLDivElement | null= document.querySelector("#"+this.boardId+RcsbFvDOMConstants.PROGRESS_DIV_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            return;
        const offsetHeight: number = this.state.boardConfigData.includeAxis === true ? RcsbFvDefaultConfigValues.trackAxisHeight + 2 : 0;
        createPopper(refDiv, tooltipDiv, {
            placement:'right-start',
            modifiers: [{
                name: 'offset',
                options: {
                    offset: [offsetHeight,10]
                }
            },{
                name: 'flip',
                options: {
                    fallbackPlacements: ['top-end', 'auto'],
                },
            }]
        }).forceUpdate();
        tooltipDiv.removeAttribute(RcsbFvDOMConstants.POPPER_HIDDEN);
    }

    private hideStatus(){
        const tooltipDiv: HTMLDivElement | null= document.querySelector("#"+this.boardId+RcsbFvDOMConstants.PROGRESS_DIV_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            return;
        tooltipDiv.setAttribute(RcsbFvDOMConstants.POPPER_HIDDEN,"");
    }

    private renderStarts(): void {
        if(typeof this.state.boardConfigData.onFvRenderStartsCallback === "function") {
            this.state.boardConfigData.onFvRenderStartsCallback();
        }
    }

}