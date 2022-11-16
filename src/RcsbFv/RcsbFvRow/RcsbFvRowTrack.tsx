import * as React from "react";
import {RcsbFvTrack} from "../RcsbFvTrack/RcsbFvTrack";
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {EventType, RcsbFvContextManager, RowReadyInterface} from "../RcsbFvContextManager/RcsbFvContextManager";
import {RcsbSelection} from "../../RcsbBoard/RcsbSelection";

import {asyncScheduler, Subscription} from 'rxjs';
import {RcsbScaleInterface} from "../../RcsbBoard/RcsbD3/RcsbD3ScaleFactory";

/**Board track  annotations cell React component interface*/
interface RcsbFvRowTrackInterface {
    readonly id: string;
    readonly rowTrackConfigData: RcsbFvRowConfigInterface;
    readonly contextManager: RcsbFvContextManager;
    readonly xScale: RcsbScaleInterface;
    readonly selection: RcsbSelection;
    readonly callbackRcsbFvRow: (height: number)=>void;
    readonly rowNumber: number;
    readonly renderSchedule: "async"|"sync"|"fixed";
}

/**Board track  annotations cell React component state*/
interface RcsbFvRowTrackState {
    readonly rowTrackConfigData: RcsbFvRowConfigInterface;
    readonly rowTrackHeight: number;
    readonly mounted: boolean;
}

export class RcsbFvRowTrack extends React.Component <RcsbFvRowTrackInterface, RcsbFvRowTrackState> {

    /**Track Protein Feature Viewer object*/
    private rcsbFvTrack : RcsbFvTrack;
    /**Feature Viewer builder Async task*/
    private asyncTask: Subscription | null = null;
    /**Subscription to events*/
    private subscription: Subscription;

    readonly state : RcsbFvRowTrackState = {
        rowTrackHeight:RcsbFvDefaultConfigValues.trackHeight,
        rowTrackConfigData: this.props.rowTrackConfigData,
        mounted: false
    };

    constructor(props: RcsbFvRowTrackInterface) {
        super(props);
    }

    render(){
        return (
            <div className={classes.rcsbFvRowTrack} style={this.configStyle()}>
                <div id={this.props.id} style={this.borderStyle()}/>
            </div>
        );
    }

    componentDidMount(): void{
        this.subscription = this.subscribe();
        switch (this.props.renderSchedule){
            case "sync":
                this.queueTask();
                break;
            case "fixed":
                this.rcsbFvTrackInit();
                break;
        }
    }

    componentWillUnmount(): void {
        this.subscription.unsubscribe();
        if(this.asyncTask)
            this.asyncTask.unsubscribe();
        if(this.rcsbFvTrack != null) {
            this.rcsbFvTrack.unsubscribe();
        }
    }

    private subscribe(): Subscription{
        return this.props.contextManager.subscribe((o)=>{
            switch (o.eventType){
                case EventType.ROW_READY:
                    this.renderTrack(o.eventData);
                    break;
            }
        });
    }

    private renderTrack(rowData:RowReadyInterface): void{
        if(this.props.rowNumber-rowData.rowNumber == 1){
            this.queueTask();
        }
    }

    private queueTask(): void {
        this.asyncTask = asyncScheduler.schedule(()=>{
            this.rcsbFvTrackInit();
            this.props.contextManager.next({eventType:EventType.ROW_READY, eventData:{rowId:this.props.id,rowNumber:this.props.rowNumber}});
        });
    }

    private rcsbFvTrackInit(): void {
        if(this.rcsbFvTrack)
            this.rcsbFvTrack.setConfig(this.props.rowTrackConfigData);
        else
            this.rcsbFvTrack = new RcsbFvTrack(this.props.rowTrackConfigData, this.props.xScale, this.props.selection, this.props.contextManager);
        this.updateHeight();
        if(this.props.selection.getSelected("select") && this.props.selection.getSelected("select").length>0)
            this.props.contextManager.next({
                eventType:EventType.SET_SELECTION,
                eventData: {
                    mode:"select",
                    elements:this.props.selection.getSelected("select").map(s=>({begin:s.rcsbFvTrackDataElement.begin,end:s.rcsbFvTrackDataElement.end,isEmpty:s.rcsbFvTrackDataElement.isEmpty}))
                }
            });
    }

    /**This method is called when the final track height is known, it updates React Component height State*/
    private updateHeight(): void{
        const height: number | null = this.rcsbFvTrack.getTrackHeight();
        if(height != null) {
            this.setState({
                    rowTrackHeight: height,
                    mounted: true
                },
                ()=>{
                    this.props.callbackRcsbFvRow(this.state.rowTrackHeight);
                });
        }
    }

    /**
     * @return CSS style width and height for the cell
     * */
    private configStyle() : React.CSSProperties{
        let width : number = RcsbFvDefaultConfigValues.trackWidth;
        if(typeof this.props.rowTrackConfigData.trackWidth === "number"){
            width = this.props.rowTrackConfigData.trackWidth + 2*RcsbFvDefaultConfigValues.borderWidth;
        }
        return {
            width: width,
            height: this.state.rowTrackHeight
        };
    }

    private borderStyle(): React.CSSProperties{
        const style: React.CSSProperties =  {};
        style.borderColor = this.props.rowTrackConfigData.borderColor ?? RcsbFvDefaultConfigValues.borderColor;
        if(this.props.rowTrackConfigData.displayType != RcsbFvDisplayTypes.AXIS) {
            style.borderLeft = this.props.rowTrackConfigData.borderWidth ?? RcsbFvDefaultConfigValues.borderWidth + "px solid #DDD";
            style.borderRight = this.props.rowTrackConfigData.borderWidth ?? RcsbFvDefaultConfigValues.borderWidth + "px solid #DDD";
        }
        return style;
    }



}
