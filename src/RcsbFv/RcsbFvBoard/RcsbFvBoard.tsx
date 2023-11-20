import React from "react";
import {RcsbFvBoardConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import classes from "../../scss/RcsbFvRow.module.scss";

import {
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerType
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";
import {RcsbSelection} from "../../RcsbBoard/RcsbSelection";
import {RcsbFvUI} from "../RcsbFvUI/RcsbFvUI";
import {RcsbFvDOMConstants} from "../RcsbFvConfig/RcsbFvDOMConstants";
import {RcsbFvTable} from "./RcsbFvTable";
import {BoardGlow} from "./Components/BoardGlow";
import {RowGlow} from "./Components/RowGlow";
import {RcsbScaleInterface} from "../../RcsbBoard/RcsbD3/RcsbD3ScaleFactory";
import {RcsbFvRowRenderConfigInterface} from "./Utils/BoardDataState";
import {BoardProgress} from "./Components/BoardProgress";
import {ReactNode} from "react";

/**Board React component configuration interface*/
export interface RcsbFvBoardFullConfigInterface {
    readonly rowConfigData: Array<RcsbFvRowRenderConfigInterface>;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
}

/**Board React component interface*/
interface RcsbFvBoardInterface extends RcsbFvBoardFullConfigInterface {
    readonly boardId: string;
    readonly contextManager: RcsbFvContextManager;
    readonly resolve: ()=> void;
    readonly xScale: RcsbScaleInterface;
    readonly selection: RcsbSelection;
}

/**Board React component state interface*/
interface RcsbFvBoardState {
    readonly rowConfigData: Array<RcsbFvRowRenderConfigInterface>;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
    readonly progressStatus: number;
}

/**Board React Component className*/
export class RcsbFvBoard extends React.Component <RcsbFvBoardInterface, RcsbFvBoardState > {

    /**Subscription to events*/
    private subscription: Subscription;
    /**Global d3 Xscale object shaed among all board tracks*/
    private readonly xScale: RcsbScaleInterface;
    /**Global selection shared among all tracks*/
    private readonly selection:RcsbSelection;
    /**Promise resolve callback when board is complete*/
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
        this.xScale = props.xScale;
        this.selection = props.selection;
    }

    render(): ReactNode {
        this.renderStarts();
        return (
            <div className={classes.rcsbFvRootContainer} onMouseOver={this.setMouseOverCallback()} onMouseLeave={this.setMouseLeaveCallback()}>
                {
                    this.state.boardConfigData.disableMenu ? null : <RcsbFvUI boardId={this.props.boardId} boardConfigData={this.state.boardConfigData} contextManager={this.props.contextManager} xScale={this.xScale} />
                }
                <BoardGlow boardId={this.props.boardId} boardConfigData={this.state.boardConfigData} contextManager={this.props.contextManager}/>
                <RowGlow boardId={this.props.boardId} boardConfigData={this.state.boardConfigData} contextManager={this.props.contextManager}/>
                <RcsbFvTable
                    boardId={this.props.boardId}
                    xScale={this.xScale}
                    selection={this.selection}
                    contextManager={this.props.contextManager}
                    boardConfigData={this.state.boardConfigData}
                    rowConfigData={this.state.rowConfigData}
                />
                <div id={this.props.boardId+RcsbFvDOMConstants.TOOLTIP_DOM_ID_PREFIX} className={classes.rcsbFvTooltip} {...{[RcsbFvDOMConstants.POPPER_HIDDEN]:""}} />
                <div id={this.props.boardId+RcsbFvDOMConstants.TOOLTIP_DESCRIPTION_DOM_ID_PREFIX} className={classes.rcsbFvTooltipDescription} {...{[RcsbFvDOMConstants.POPPER_HIDDEN]:""}} />
                <BoardProgress boardId={this.props.boardId} boardConfigData={this.state.boardConfigData} rowConfigData={this.state.rowConfigData} contextManager={this.props.contextManager} />
            </div>
        );
    }

    componentDidMount(): void {
        this.subscription = this.subscribe();
        this.checkReadyState();
    }

    componentWillUnmount(): void {
        this.subscription.unsubscribe();
        this.props.contextManager.unsubscribeAll();
    }

    componentDidUpdate(prevProps: Readonly<RcsbFvBoardInterface>, prevState: Readonly<RcsbFvBoardState>, snapshot?: any) {
        this.checkReadyState(prevState);
    }

    /**Subscribe className to rxjs events (adding tracks, change scale, update board config)
     * @return rxjs Subscription object
     * */
    private subscribe(): Subscription {
        return this.props.contextManager.subscribe((obj:RcsbFvContextManagerType)=>{
            switch (obj.eventType){
                case EventType.UPDATE_BOARD_CONFIG:
                    this.resetReadyStatus(obj.eventResolve);
                    this.updateBoardConfig(obj.eventData);
                    break;
                case EventType.BOARD_READY:
                    this.boardReady();
                    break;
            }
        });
    }

    /**Updates board configuration
     * @param configData Board and track configuration interface
     * */
    private updateBoardConfig(configData: Partial<RcsbFvBoardFullConfigInterface>): void {
        if(configData.rowConfigData!=null && configData.boardConfigData!=null){
            this.setState({
                rowConfigData: configData.rowConfigData,
                boardConfigData: {
                    ...this.state.boardConfigData,
                    ...configData.boardConfigData
                }
            });
        }else if(configData.boardConfigData!=null){
            this.setState({
                boardConfigData: {
                    ...this.state.boardConfigData,
                    ...configData.boardConfigData
                }
            });
        }else if(configData.rowConfigData!=null){
            this.setState({
                rowConfigData: configData.rowConfigData
            });
        }
    }

    private setMouseOverCallback(): (()=>void)|undefined{
        if(this.state.boardConfigData.hideTrackFrameGlow)
            return undefined;
        else
            return this.onMouseOver.bind(this);
    }

    private setMouseLeaveCallback(): (()=>void)|undefined{
        if(this.state.boardConfigData.hideTrackFrameGlow)
            return undefined;
        else
            return this.onMouseLeave.bind(this);
    }

    private onMouseOver(): void{
        this.boardHover(true);
    }

    private onMouseLeave(): void{
        this.boardHover(false);
    }

    private resetReadyStatus( eventResolve?: ()=>void): void {
        this.resolveOnReady = eventResolve;
    }

    private checkReadyState(prevState?: Readonly<RcsbFvBoardState>): void {
        if(
            ( !this.state.rowConfigData ) ||
            ( this.state.rowConfigData.length == 0 ) ||
            ( prevState && this.state.rowConfigData.map(r=>r.key).sort().join("-") == prevState.rowConfigData.map(r=>r.key).sort().join("-") )
        ){
            this.boardReady();
        }
    }

    private renderStarts(): void {

        if(typeof this.state.boardConfigData.onFvRenderStartsCallback === "function")
            this.state.boardConfigData.onFvRenderStartsCallback();

        if(typeof this.state.boardConfigData.selectionChangeCallback === "function")
            this.selection.setSelectionChangeCallback(this.state.boardConfigData.selectionChangeCallback);

    }

    /**
     * Trigger Board Ready Event
     **/
    private boardReady(): void{
        if(typeof this.resolveOnReady === "function") {
            this.resolveOnReady();
            this.resolveOnReady = undefined;
        }
    }

    private boardHover(flag:boolean): void{
        this.props.contextManager.next({
            eventType: EventType.BOARD_HOVER,
            eventData: flag
        });
    }

}