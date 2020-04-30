import * as React from "react";
import {RcsbFvDisplayTypes, RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvRow} from "../RcsbFvRow/RcsbFvRow";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "../RcsbFvInterface";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

import {
    EventType, RcsbFvContextManager,
    RcsbFvContextManagerInterface, ResetInterface, ScaleTransformInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";

export interface RcsbFvBoardFullConfigInterface {
    rowConfigData: Array<RcsbFvRowConfigInterface>;
    boardConfigData: RcsbFvBoardConfigInterface;
}

interface RcsbFvBoardInterface extends RcsbFvBoardFullConfigInterface {
    contextManager: RcsbFvContextManager;
}

interface RcsbFvBoardState {
    rowConfigData: Array<RcsbFvRowConfigInterface>;
    boardConfigData: RcsbFvBoardConfigInterface;
    verticalTrackHeight: number;
}

interface RcsbFvBoardStyleInterface{
    width: number;
}

interface RowHeightInterface {
    rowId: string;
    height: number;
}

export class RcsbFvBoard extends React.Component <RcsbFvBoardInterface, RcsbFvBoardState > {

    boardId : string = "RcsbFvBoard_"+Math.random().toString(36).substr(2);
    rcsbFvRowArrayIds : Array<string> = new Array<string>();
    currentScale: ScaleTransformInterface;
    private subscription: Subscription;
    private rowHeights: Array<RowHeightInterface> = new Array<RowHeightInterface>();

    readonly state : RcsbFvBoardState = {
        rowConfigData: this.props.rowConfigData,
        boardConfigData: this.props.boardConfigData,
        verticalTrackHeight: 0
    };

    render(){
        let rcsbFvRowAxis = null;
        if(this.state.boardConfigData.includeAxis === true){
            const rowId: string = "RcsbFvRow_"+Math.random().toString(36).substr(2);
            this.rcsbFvRowArrayIds.push(rowId);
            const rowData:RcsbFvRowConfigInterface = {displayType:RcsbFvDisplayTypes.AXIS, trackId:"axisId_"+Math.random().toString(36).substr(2), boardId:this.boardId};
            const rowConfigData: RcsbFvRowConfigInterface = this.configRow(rowId,rowData);
            rowConfigData.isAxis = true;
            rcsbFvRowAxis = <RcsbFvRow key={rowId} id={rowId} rowConfigData={rowConfigData} contextManager={this.props.contextManager} callbackRcsbFvBoard={this.callbackRcsbFvRow.bind(this)}/>;
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
                            return (<RcsbFvRow key={rowId} id={rowId} rowConfigData={rowConfigData} contextManager={this.props.contextManager} callbackRcsbFvBoard={this.callbackRcsbFvRow.bind(this)}/>);
                        })
                    }
                </div>
                <div className={classes.rcsbFvVerticalTrack} style={this.configVerticalTrackStyle()}>
                </div>
                <div id={this.boardId+"_tooltip"} className={classes.rcsbFvTooltip} />
                <div id={this.boardId+"_tooltipDescription"} className={classes.rcsbFvTooltipDescription} />
            </div>
        );
    }

    private callbackRcsbFvRow(id:string, height: number): void {
        this.rowHeights.push({
            rowId: id,
            height: height
        });
    }

    private updateVerticalTrack(){
        let n = 0;
        this.rowHeights.forEach(e=>{
            n += e.height+1
        });
        this.setState({verticalTrackHeight:(n+2)});
    }

    private configVerticalTrackStyle(){
        return {
            height: this.state.verticalTrackHeight
        };
    }

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

    private addRow(configRow: RcsbFvRowConfigInterface): void{
        const rowConfigData: Array<RcsbFvRowConfigInterface> = this.state.rowConfigData;
        rowConfigData.push(configRow);
        this.setState({rowConfigData: rowConfigData, boardConfigData:this.state.boardConfigData} as RcsbFvBoardState);
        //this.setScale();
    }

    private updateBoardConfig(configData: RcsbFvBoardFullConfigInterface): void {
        this.setState({rowConfigData: configData.rowConfigData, boardConfigData: configData.boardConfigData} );
    }

    //TODO
    private updateTrackData(): void{

    }

    componentDidMount(): void {
        this.subscription = this.subscribe();
        const tooltipDiv: HTMLDivElement = document.querySelector("#"+this.boardId+"_tooltip");
        tooltipDiv.setAttribute("popper-hidden",null);

        const tooltipDescriptionDiv: HTMLDivElement = document.querySelector("#"+this.boardId+"_tooltipDescription");
        tooltipDescriptionDiv.setAttribute("popper-hidden",null);

        this.updateVerticalTrack();
    }

    componentWillUnmount(): void {
        console.warn("Component RcsbFvBoard (id: "+this.boardId+") unmount, unsubscribing all events");
        this.props.contextManager.unsubscribeAll();
    }

    private subscribe(): Subscription{
        return this.props.contextManager.asObservable().subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EventType.ADD_TRACK){
                this.addRow(obj.eventData as RcsbFvRowConfigInterface);
            }else if(obj.eventType===EventType.SCALE){
                this.currentScale = obj.eventData as ScaleTransformInterface;
            }else if(obj.eventType===EventType.UPDATE_BOARD_CONFIG){
                this.updateBoardConfig(obj.eventData as RcsbFvBoardFullConfigInterface);
            }
        });
    }

    private unsubscribe(): void{
        this.subscription.unsubscribe();
    }

    private setScale(){
        if(this.currentScale!=null) {
            this.props.contextManager.next({
                eventType: EventType.SCALE,
                eventData: this.currentScale
            } as RcsbFvContextManagerInterface);
        }
    }

}