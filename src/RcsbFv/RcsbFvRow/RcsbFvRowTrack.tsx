import * as React from "react";
import {RcsbFvTrack} from "../RcsbFvTrack/RcsbFvTrack";
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {EventType, RcsbFvContextManager} from "../RcsbFvContextManager/RcsbFvContextManager";
import {ScaleLinear} from "d3-scale";
import {RcsbSelection} from "../../RcsbBoard/RcsbSelection";

import {asapScheduler, asyncScheduler, Subscription} from 'rxjs';

/**Board track  annotations cell React component interface*/
interface RcsbFvRowTrackInterface {
    id: string;
    rowTrackConfigData: RcsbFvRowConfigInterface;
    readonly contextManager: RcsbFvContextManager;
    readonly xScale: ScaleLinear<number,number>;
    readonly selection: RcsbSelection;
    readonly callbackRcsbFvRow: (height: number)=>void;
    readonly rowNumber: number;
    readonly firstRow: boolean;
    readonly lastRow: boolean;
    readonly addBorderBottom: boolean;
}

/**Board track  annotations cell React component style*/
interface RcsbFvRowTrackStyleInterface {
    width: number;
    height: number;
}

/**Board track  annotations cell React component state*/
interface RcsbFvRowTrackState {
    readonly rowTrackConfigData: RcsbFvRowConfigInterface;
    readonly rowTrackHeight: number;
    readonly mounted: boolean;
}

export class RcsbFvRowTrack extends React.Component <RcsbFvRowTrackInterface, RcsbFvRowTrackState> {

    /**Board track configuration object*/
    private readonly configData : RcsbFvRowConfigInterface;
    /**Track Protein Feature Viewer object*/
    private rcsbFvTrack : RcsbFvTrack;
    /**Feature Viewer builder Async task*/
    private asyncTask: Subscription | null = null;

    readonly state : RcsbFvRowTrackState = {
        rowTrackHeight:RcsbFvDefaultConfigValues.trackHeight + this.rowBorderHeight(),
        rowTrackConfigData: this.props.rowTrackConfigData,
        mounted: false
    };

    constructor(props: RcsbFvRowTrackInterface) {
        super(props);
        this.configData = this.props.rowTrackConfigData;
    }

    render(){
        return (
            <div className={classes.rcsbFvRowTrack} style={this.configStyle()}>
                <div id={this.props.id} style={this.borderStyle()}/>
            </div>
        );
    }

    componentDidMount(): void{
        this.asyncTask = asyncScheduler.schedule(()=>{
            this.rcsbFvTrack = new RcsbFvTrack(this.configData, this.props.xScale, this.props.selection, this.props.contextManager);
            this.updateHeight();
            this.props.contextManager.next({eventType:EventType.BOARD_READY, eventData:this.props.id});
        });
    }

    componentWillUnmount(): void {
        if(this.asyncTask)
            this.asyncTask.unsubscribe();
        if(this.rcsbFvTrack != null) {
            this.rcsbFvTrack.unsubscribe();
        }
    }

    /**This method is called when the final track height is known, it updates React Component height State*/
    private updateHeight(): void{
        const height: number | null = this.rcsbFvTrack.getTrackHeight();
        if(height != null) {
            this.setState({
                    rowTrackHeight: height + this.rowBorderHeight(),
                    mounted: true
                } as RcsbFvRowTrackState,
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
        if(typeof this.configData.trackWidth === "number"){
            width = this.configData.trackWidth + 2*RcsbFvDefaultConfigValues.borderWidth;
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
        if(this.props.addBorderBottom || this.props.lastRow)
            style.borderBottom = this.props.rowTrackConfigData.borderWidth ?? RcsbFvDefaultConfigValues.borderWidth + "px solid #DDD";
        if(this.props.firstRow)
            style.borderTop = this.props.rowTrackConfigData.borderWidth ?? RcsbFvDefaultConfigValues.borderWidth + "px solid #DDD";
        return style;
    }

    private rowBorderHeight(): number {
        return (this.props.firstRow  ? this.props.rowTrackConfigData.borderWidth ?? RcsbFvDefaultConfigValues.borderWidth : 0) +
            ((this.props.addBorderBottom || this.props.lastRow) ? this.props.rowTrackConfigData.borderWidth ?? RcsbFvDefaultConfigValues.borderWidth : 0);
    }

}
