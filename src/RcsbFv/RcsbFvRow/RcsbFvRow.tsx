import * as React from "react";
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvRowTitle} from "./RcsbFvRowTitle";
import {RcsbFvRowTrack} from "./RcsbFvRowTrack";
import {RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
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
import {RcsbFvDOMConstants} from "../RcsbFvConfig/RcsbFvDOMConstants";

/**Board track React component interface*/
interface RcsbFvRowInterface {
    readonly id: string;
    readonly boardId: string;
    readonly rowNumber: number;
    readonly rowConfigData: RcsbFvRowConfigInterface;
    readonly contextManager: RcsbFvContextManager;
    readonly xScale: ScaleLinear<number,number>;
    readonly selection: RcsbSelection;
    readonly firstRow: boolean;
    readonly lastRow: boolean;
    readonly addBorderBottom: boolean;
}

/**Board track React state interface*/
interface RcsbFvRowState {
    readonly rowHeight: number;
    readonly mounted: boolean;
    readonly rowConfigData: RcsbFvRowConfigInterface;
    readonly display: boolean;
    readonly titleGlow: boolean;
}


/**Board track React Component className*/
export class RcsbFvRow extends React.Component <RcsbFvRowInterface, RcsbFvRowState> {

    readonly state : RcsbFvRowState = {
        rowHeight:RcsbFvDefaultConfigValues.trackHeight,
        display: true,
        mounted: false,
        rowConfigData: this.props.rowConfigData,
        titleGlow:false
    };

    /**Subscription to events*/
    private subscription: Subscription;

    constructor(props: RcsbFvRowInterface) {
        super(props);
    }

    render(){
        const classNames:string = this.props.rowConfigData.displayType === RcsbFvDisplayTypes.AXIS ? classes.rcsbFvRow+" "+classes.rcsbFvRowAxis : classes.rcsbFvRow;
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
                <div onMouseEnter={()=>{this.hoverRow(true)}} onMouseLeave={()=>{this.hoverRow(false)}}
                     className={classNames+((this.state.titleGlow && this.state.display)? " "+classes.rcsbFvGlowTitle : "")}
                     style={this.configStyle()}>
                    <RcsbFvRowTitle data={this.props.rowConfigData} rowTitleHeight={this.state.rowHeight} />
                    <RcsbFvRowTrack
                        id={this.props.id}
                        rowNumber={this.props.rowNumber}
                        rowTrackConfigData={this.props.rowConfigData}
                        xScale={this.props.xScale}
                        selection={this.props.selection}
                        contextManager={this.props.contextManager}
                        callbackRcsbFvRow={this.callbackRcsbFvRowTrack.bind(this)}
                        firstRow={this.props.firstRow}
                        lastRow={this.props.lastRow}
                        addBorderBottom={this.props.addBorderBottom}
                    />
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

    private hoverRow(flag: boolean): void {
        this.setState(()=>({titleGlow:flag}));
        this.props.contextManager.next({
            eventType: EventType.HOVER_ROW,
            eventData: this.props.id
        } as RcsbFvContextManagerInterface);
        if(this.props.rowConfigData.displayType != RcsbFvDisplayTypes.AXIS && !this.props.rowConfigData.hideRowGlow)
            this.glowRow();
        else
            this.hideGlowRow();
    }

    private glowRow(): void{
        const boardDiv: HTMLElement | null = document.getElementById(this.props.boardId);
        const rowDiv: HTMLElement | null = document.getElementById(this.props.id);
        if (rowDiv != null && boardDiv != null) {
            const top: number = (rowDiv.offsetTop - (boardDiv.offsetTop + boardDiv.getBoundingClientRect().height));
            const height: number = rowDiv.getBoundingClientRect().height - 2 * RcsbFvDefaultConfigValues.rowGlowWidth;
            const glowDiv: HTMLElement | null = document.getElementById(this.props.boardId + RcsbFvDOMConstants.GLOW_ROW_DOM_ID_SUFFIX);
            if (glowDiv != null) {
                const innerGlowDiv: HTMLElement | undefined = glowDiv.getElementsByTagName("div")[0];
                const trackWidth: number = this.props.rowConfigData.trackWidth ??  RcsbFvDefaultConfigValues.trackWidth;
                const titleWidth: number = (this.state.rowConfigData.rowTitleWidth ?? RcsbFvDefaultConfigValues.rowTitleWidth);
                glowDiv.style.top = top + "px";
                glowDiv.style.marginLeft = titleWidth + RcsbFvDefaultConfigValues.titleAndTrackSpace + "px";
                glowDiv.className = classes.rcsbRowGlow;
                innerGlowDiv.style.height = (height) + "px";
                innerGlowDiv.style.width = trackWidth + "px";
            }
        }
    }

    private hideGlowRow(): void{
        const glowDiv: HTMLElement | null = document.getElementById(this.props.boardId + RcsbFvDOMConstants.GLOW_ROW_DOM_ID_SUFFIX);
        if (glowDiv != null) {
            const innerGlowDiv: HTMLElement | undefined = glowDiv.getElementsByTagName("div")[0];
            glowDiv.style.top = "0px";
            glowDiv.style.marginLeft = "0px";
            glowDiv.className = classes.rcsbNoRowGlow;
            innerGlowDiv.style.height = "0px";
            innerGlowDiv.style.width = "0px";
        }
    }

    private checkHoveredRow(trackId: string){
        if(trackId != this.props.id && this.state.titleGlow){
            this.setState(()=>({titleGlow:false}));
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
            }else if(obj.eventType === EventType.HOVER_ROW){
                const trackId: string = obj.eventData as string;
                this.checkHoveredRow(trackId);
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
            trackWidth = this.props.rowConfigData.trackWidth + 2 * RcsbFvDefaultConfigValues.borderWidth;
        }
        return {
            width: (titleWidth + trackWidth + RcsbFvDefaultConfigValues.titleAndTrackSpace),
            height: this.state.rowHeight,
        };
    }

}
