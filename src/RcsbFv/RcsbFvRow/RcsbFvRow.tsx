import * as React from "react";
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvRowTitle} from "./RcsbFvRowTitle";
import {RcsbFvRowTrack} from "./RcsbFvRowTrack";
import {RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface,
    TrackVisibilityInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {ScaleLinear} from "d3-scale";
import {RcsbSelection} from "../../RcsbBoard/RcsbSelection";
import {Subscription} from "rxjs";
import {CSSTransition} from 'react-transition-group';

/**Board track React component interface*/
interface RcsbFvRowInterface {
    readonly id: string;
    readonly rowNumber: number;
    readonly rowConfigData: RcsbFvRowConfigInterface;
    readonly contextManager: RcsbFvContextManager;
    readonly xScale: ScaleLinear<number,number>;
    readonly selection: RcsbSelection;
}

/**Board track React state interface*/
interface RcsbFvRowState {
    readonly rowHeight: number;
    readonly mounted: boolean;
    readonly rowConfigData: RcsbFvRowConfigInterface;
    readonly display: boolean;
}


/**Board track React Component className*/
export class RcsbFvRow extends React.Component <RcsbFvRowInterface, RcsbFvRowState> {

    readonly state : RcsbFvRowState = {
        rowHeight:RcsbFvDefaultConfigValues.trackHeight,
        display: true,
        mounted: false,
        rowConfigData: this.props.rowConfigData
    };

    /**Subscription to events*/
    private subscription: Subscription;

    constructor(props: RcsbFvRowInterface) {
        super(props);
    }

    render(){
        let classNames:string = classes.rcsbFvRow;
        if(this.props.rowConfigData.displayType === RcsbFvDisplayTypes.AXIS){
            classNames += " "+classes.rcsbFvRowAxis;
        }
        return (
            <CSSTransition
                in={this.state.display}
                timeout={RcsbFvDefaultConfigValues.rowHideTransitionTimeout}
                classNames={classes.rcsbFvRow}
                onEntering={()=>{
                    this.props.contextManager.next({eventType: EventType.UPDATE_GLOW, eventData:""});
                }}
                onExited={()=>{
                    this.props.contextManager.next({eventType: EventType.UPDATE_GLOW, eventData:""});
                }}>
                <div className={classNames} style={this.configStyle()}>
                    <RcsbFvRowTitle data={this.props.rowConfigData} rowTitleHeight={this.state.rowHeight} />
                    <RcsbFvRowTrack id={this.props.id} rowNumber={this.props.rowNumber} rowTrackConfigData={this.props.rowConfigData} xScale={this.props.xScale} selection={this.props.selection} contextManager={this.props.contextManager} callbackRcsbFvRow={this.callbackRcsbFvRowTrack.bind(this)}/>
                </div>
            </CSSTransition>
        );
    }

    componentDidMount(): void{
        this.subscription = this.subscribe();
    }

    componentWillUnmount(): void {
        if(this.subscription != null) {
            this.subscription.unsubscribe();
        }
    }

    /**Subscribe className to rxjs events (adding tracks, change scale, update board config)
     * @return rxjs Subscription object
     * */
    private subscribe(): Subscription{
        return this.props.contextManager.subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EventType.TRACK_HIDE){
                const vis: TrackVisibilityInterface = obj.eventData as TrackVisibilityInterface;
                if(vis.trackId === this.props.rowConfigData.trackId){
                   this.changeClass(vis.visibility);
                }
            }
        });
    }

    private changeClass(display: boolean): void{
        this.setState({display:display});
    }

    /**This function will be called once the final height of the track is known*/
    private callbackRcsbFvRowTrack(rcsbRowTrackHeight: number): void {
        this.setState({rowHeight: rcsbRowTrackHeight, mounted:true} as RcsbFvRowState);
    }

    /**Returns the full track width (title+annotations) and height
     * @return Board track full width
     * */
    configStyle(): React.CSSProperties {
        let titleWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.props.rowConfigData.rowTitleWidth === "number"){
            titleWidth = this.props.rowConfigData.rowTitleWidth;
        }
        let trackWidth : number = RcsbFvDefaultConfigValues.trackWidth;
        if(typeof this.props.rowConfigData.trackWidth === "number"){
            trackWidth = this.props.rowConfigData.trackWidth;
        }
        return {
            width: (titleWidth + trackWidth + 2),
            height: this.state.rowHeight,
        };
    }

}
