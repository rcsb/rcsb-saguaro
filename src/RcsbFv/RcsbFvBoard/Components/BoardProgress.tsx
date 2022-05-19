import * as React from "react";
import {RcsbFvDOMConstants} from "../../RcsbFvConfig/RcsbFvDOMConstants";
import classes from "../../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvDefaultConfigValues} from "../../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {createPopper} from "@popperjs/core";
import {RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface} from "../../RcsbFvConfig/RcsbFvConfigInterface";
import {Subscription} from "rxjs";
import {EventType, RcsbFvContextManager, RowReadyInterface} from "../../RcsbFvContextManager/RcsbFvContextManager";
import {RowStatusMap} from "../Utils/RowStatusMap";

interface BoardProgressInterface {
    readonly boardId:string;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
    readonly contextManager: RcsbFvContextManager;
    readonly rowConfigData: Array<RcsbFvRowConfigInterface>;
    readonly rowStatusMap: RowStatusMap;
}

export class BoardProgress extends React.Component <BoardProgressInterface> {

    private subscription: Subscription;

    render() {
        return (<div id={this.props.boardId+RcsbFvDOMConstants.PROGRESS_DIV_DOM_ID_PREFIX} {...{[RcsbFvDOMConstants.POPPER_HIDDEN]:""}} className={classes.rowTrackBoardSatus} >LOADING <span/></div>);
    }

    componentDidMount() {
        this.subscription = this.subscribe();
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
    }


    private subscribe(): Subscription{
        return this.props.contextManager.subscribe((o)=>{
            switch (o.eventType){
                case EventType.ROW_READY:
                    this.rowReady(o.eventData as RowReadyInterface);
                    break;
            }
        });
    }

    /**Row Track Board Ready Event
     * @param rowData
     * */
    private rowReady(rowData:RowReadyInterface):void{
        this.props.rowStatusMap.set(rowData.rowId,true);
        if(this.props.rowStatusMap.complete()){
            this.statusComplete();
        }else{
            if(this.props.rowStatusMap.ready() == 1)
                this.showStatus();
            const statusDiv : HTMLElement | null = document.querySelector("#"+this.props.boardId+RcsbFvDOMConstants.PROGRESS_DIV_DOM_ID_PREFIX+" > span");
            if(statusDiv != null)
                statusDiv.innerHTML = Math.ceil(this.props.rowStatusMap.ready()/this.props.rowStatusMap.size()*100).toString()+"%";
        }
    }

    private showStatus(): void{
        const refDiv: HTMLDivElement | null= document.querySelector("#"+this.props.boardId);
        if(refDiv == null)
            return;
        const tooltipDiv: HTMLDivElement | null= document.querySelector("#"+this.props.boardId+RcsbFvDOMConstants.PROGRESS_DIV_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            return;
        const offsetHeight: number = this.props.boardConfigData.includeAxis === true ? 0 : -RcsbFvDefaultConfigValues.trackAxisHeight - 2;
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

    private statusComplete(){
        const tooltipDiv: HTMLDivElement | null= document.querySelector("#"+this.props.boardId+RcsbFvDOMConstants.PROGRESS_DIV_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            return;
        tooltipDiv.setAttribute(RcsbFvDOMConstants.POPPER_HIDDEN,"");
        this.props.contextManager.next({
            eventType: EventType.BOARD_READY,
            eventData: null
        })
    }

}