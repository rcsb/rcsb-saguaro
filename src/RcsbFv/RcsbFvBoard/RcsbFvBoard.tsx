import * as React from "react";
import {RcsbFvDisplayTypes, RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvRow} from "../RcsbFvRow/RcsbFvRow";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

import {
    EventType, RcsbFvContextManager,
    RcsbFvContextManagerInterface, ResetInterface, ScaleTransformInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";
import {scaleLinear, ScaleLinear} from "d3-scale";
import {RcsbSelection} from "../../RcsbBoard/RcsbSelection";

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

/**Board React Component class*/
export class RcsbFvBoard extends React.Component <RcsbFvBoardInterface, RcsbFvBoardState > {

    /**Inner div board DOM element id*/
    private readonly boardId : string = "RcsbFvBoard_"+Math.random().toString(36).substr(2);
    /**Array of inner div board track DOM element ids*/
    private readonly rcsbFvRowArrayIds : Array<string> = new Array<string>();
    /**To be removed*/
    private currentScale: ScaleTransformInterface;
    /**Subscription to events*/
    private subscription: Subscription;
    /**Global d3 Xscale object shaed among all board tracks*/
    private readonly xScale: ScaleLinear<number,number> = scaleLinear();
    /**Global selection shared among all tracks*/
    private readonly selection:RcsbSelection = new RcsbSelection();

    readonly state : RcsbFvBoardState = {
        /**Array of configurations for each board track*/
        rowConfigData: this.props.rowConfigData,
        /**Board global configuration*/
        boardConfigData: this.props.boardConfigData
    };

    render(){
        let rcsbFvRowAxis = null;
        if(this.state.boardConfigData.includeAxis === true){
            const rowId: string = "RcsbFvRow_"+Math.random().toString(36).substr(2);
            this.rcsbFvRowArrayIds.push(rowId);
            const rowData:RcsbFvRowConfigInterface = {displayType:RcsbFvDisplayTypes.AXIS, trackId:"axisId_"+Math.random().toString(36).substr(2), boardId:this.boardId};
            const rowConfigData: RcsbFvRowConfigInterface = this.configRow(rowId,rowData);
            rowConfigData.isAxis = true;
            rcsbFvRowAxis = <RcsbFvRow key={rowId} id={rowId} rowConfigData={rowConfigData} xScale={this.xScale} selection={this.selection} contextManager={this.props.contextManager}/>;
        }
        return (
            <div>
                <div id={this.boardId} className={classes.rcsbFvBoard} style={this.configStyle()}>
                    {rcsbFvRowAxis}
                    {
                        this.state.rowConfigData.map(rowData=>{
                            const rowId: string = "RcsbFvRow_"+Math.random().toString(36).substr(2);
                            this.rcsbFvRowArrayIds.push(rowId);
                            const rowConfigData = this.configRow(rowId,rowData);
                            rowConfigData.isAxis = false;
                            return (<RcsbFvRow key={rowId} id={rowId} rowConfigData={rowConfigData} xScale={this.xScale} selection={this.selection} contextManager={this.props.contextManager}/>);
                        })
                    }
                </div>
                <div id={this.boardId+"_tooltip"} className={classes.rcsbFvTooltip} />
                <div id={this.boardId+"_tooltipDescription"} className={classes.rcsbFvTooltipDescription} />
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
        return out;
    }

    /**Adds a new track to the board
     * @param configRow Track configuration object
     * */
    private addRow(configRow: RcsbFvRowConfigInterface): void{
        const rowConfigData: Array<RcsbFvRowConfigInterface> = this.state.rowConfigData;
        rowConfigData.push(configRow);
        this.setState({rowConfigData: rowConfigData, boardConfigData:this.state.boardConfigData} as RcsbFvBoardState);
        //this.setScale();
    }

    /**Updates board configuration
     * @param configData Board and track configuration interface
     * */
    private updateBoardConfig(configData: Partial<RcsbFvBoardFullConfigInterface>): void {
        if(configData.rowConfigData!=null){
            this.setState({rowConfigData: configData.rowConfigData} );
        }
        if(configData.boardConfigData!=null){
            this.setState({boardConfigData: configData.boardConfigData} );
        }
    }

    //TODO
    private updateTrackData(): void{

    }

    componentDidMount(): void {
        this.subscription = this.subscribe();
        const tooltipDiv: HTMLDivElement | null = document.querySelector("#"+this.boardId+"_tooltip");
        if(tooltipDiv != null)
            tooltipDiv.setAttribute("popper-hidden","");

        const tooltipDescriptionDiv: HTMLDivElement | null = document.querySelector("#"+this.boardId+"_tooltipDescription");
        if(tooltipDescriptionDiv != null)
            tooltipDescriptionDiv.setAttribute("popper-hidden","");
    }

    componentWillUnmount(): void {
        console.warn("Component RcsbFvBoard (id: "+this.boardId+") unmount, unsubscribing all events");
        this.props.contextManager.unsubscribeAll();
    }
    /**Subscribe class to rxjs events (adding tracks, change scale, update board config)
     * @return rxjs Subscription object
     * */
    private subscribe(): Subscription{
        return this.props.contextManager.subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EventType.ADD_TRACK){
                this.addRow(obj.eventData as RcsbFvRowConfigInterface);
            }else if(obj.eventType===EventType.SCALE){
                this.currentScale = obj.eventData as ScaleTransformInterface;
            }else if(obj.eventType===EventType.UPDATE_BOARD_CONFIG){
                this.updateBoardConfig(obj.eventData as RcsbFvBoardFullConfigInterface);
            }
        });
    }

    /**Unsubscribe class to rxjs events. Useful if many panels are created an destroyed.*/
    private unsubscribe(): void{
        this.subscription.unsubscribe();
    }

    /**To be removed*/
    private setScale(){
        if(this.currentScale!=null) {
            this.props.contextManager.next({
                eventType: EventType.SCALE,
                eventData: this.currentScale
            } as RcsbFvContextManagerInterface);
        }
    }

}