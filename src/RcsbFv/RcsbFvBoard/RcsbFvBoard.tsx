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
}

/**Board React component state interface*/
interface RcsbFvBoardState {
    readonly rowConfigData: Array<RcsbFvRowConfigInterface>;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
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


    readonly state : RcsbFvBoardState = {
        /**Array of configurations for each board track*/
        rowConfigData: this.props.rowConfigData,
        /**Board global configuration*/
        boardConfigData: this.props.boardConfigData
    };

    render(): JSX.Element{
        let rcsbFvRowAxis = null;
        if(this.state.boardConfigData.includeAxis === true){
            const rowId: string = "RcsbFvRow_"+Math.random().toString(36).substr(2);
            this.rcsbFvRowArrayIds.push(rowId);
            const rowData:RcsbFvRowConfigInterface = {displayType:RcsbFvDisplayTypes.AXIS, trackId:"axisId_"+Math.random().toString(36).substr(2), boardId:this.boardId};
            const rowConfigData: RcsbFvRowConfigInterface = this.configRow(rowId,rowData);
            rcsbFvRowAxis = <RcsbFvRow key={rowId} id={rowId} rowConfigData={rowConfigData} xScale={this.xScale} selection={this.selection} contextManager={this.props.contextManager}/>;
        }
        return (
            <div onMouseOver={this.setMouseOverCallback()} onMouseLeave={this.setMouseLeaveCallback()}>
                <div id={this.boardId} className={classes.rcsbFvBoard} style={this.configStyle()}>
                    {rcsbFvRowAxis}
                    {
                        this.state.rowConfigData.filter((rowData: RcsbFvRowConfigInterface) =>{
                            return rowData.trackVisibility != false;
                        }).map((rowData: RcsbFvRowConfigInterface) =>{
                            const rowId: string = "RcsbFvRow_"+Math.random().toString(36).substr(2);
                            this.rcsbFvRowArrayIds.push(rowId);
                            const rowConfigData = this.configRow(rowId,rowData);
                            return (<RcsbFvRow key={rowId} id={rowId} rowConfigData={rowConfigData} xScale={this.xScale} selection={this.selection} contextManager={this.props.contextManager}/>);
                        })
                    }
                </div>
                <div id={this.boardId+"_tooltip"} className={classes.rcsbFvTooltip} popper-hidden={""} />
                <div id={this.boardId+"_tooltipDescription"} className={classes.rcsbFvTooltipDescription} popper-hidden={""} />
                <div id={this.boardId+RcsbFvDOMConstants.GLOW_DOM_ID_PREFIX} >
                    <div />
                </div>
                <RcsbFvUI boardId={this.boardId} boardConfigData={this.state.boardConfigData} xScale={this.xScale} setDomain={this.setDomain.bind(this)}/>
            </div>
        );
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
            width: (titleWidth+trackWidth+2)
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
        if(typeof this.state.boardConfigData.borderColor === "string"){
            out.borderColor = this.state.boardConfigData.borderColor;
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

    componentDidMount(): void {
        this.subscription = this.subscribe();
    }

    private setMouseOverCallback(): (()=>void)|undefined{
        if(this.props.boardConfigData.hideTrackFrameGlow)
            return undefined;
        else
            return this.onMouseover.bind(this);
    }

    private setMouseLeaveCallback(): (()=>void)|undefined{
        if(this.props.boardConfigData.hideTrackFrameGlow)
            return undefined;
        else
            return this.onMouseLeave.bind(this);
    }

    private onMouseover(): void{
        if(this.activateGlowFlag) {
            window?.clearTimeout(this.mouseLeaveCallbackId);
            this.activateGlowFlag = false;
            const mainDiv: HTMLElement | null = document.getElementById(this.boardId);
            if (mainDiv != null) {
                const mainDivSize: DOMRect = mainDiv.getBoundingClientRect();
                const axisDivSize: number = document.getElementsByClassName(classes.rcsbFvRowAxis)[0]?.getBoundingClientRect().height ?? 0;
                const height: number = mainDivSize.height - axisDivSize;
                const glowDiv: HTMLElement | null = document.getElementById(this.boardId + RcsbFvDOMConstants.GLOW_DOM_ID_PREFIX);
                if (glowDiv != null) {
                    const innerGlowDiv: HTMLElement | undefined = glowDiv.getElementsByTagName("div")[0];
                    glowDiv.style.top = "-" + (height - 1) + "px";
                    const trackWidth: number = this.props.boardConfigData.trackWidth ?? 0;
                    const titleWidth: number = mainDivSize.width - trackWidth;
                    glowDiv.style.marginLeft = titleWidth + "px";
                    innerGlowDiv.style.height = (height + 1) + "px";
                    innerGlowDiv.style.width = (trackWidth+2) + "px";
                    glowDiv.className = classes.rcsbGlow;
                }
            }
            this.displayUI();
        }else{
            window?.clearTimeout(this.mouseLeaveCallbackId);
        }
    }

    private onMouseLeave(): void{
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
        },500)
    }

    private displayUI(): void{
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

    /**Subscribe className to rxjs events (adding tracks, change scale, update board config)
     * @return rxjs Subscription object
     * */
    private subscribe(): Subscription{
        return this.props.contextManager.subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EventType.ADD_TRACK){
                this.addRow(obj.eventData as RcsbFvRowConfigInterface);
            }else if(obj.eventType===EventType.UPDATE_BOARD_CONFIG){
                this.updateBoardConfig(obj.eventData as RcsbFvBoardFullConfigInterface);
            }else if(obj.eventType===EventType.TRACK_VISIBILITY){
                this.changeTrackVisibility(obj.eventData as TrackVisibilityInterface);
            }else if(obj.eventType===EventType.ADD_TRACK_DATA){
                this.addTrackData(obj.eventData as TrackDataInterface);
            }else if(obj.eventType===EventType.UPDATE_TRACK_DATA){
                this.updateTrackData(obj.eventData as TrackDataInterface);
            }else if(obj.eventType===EventType.DOMAIN_VIEW){
                this.setDomain(obj.eventData as DomainViewInterface);
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

}