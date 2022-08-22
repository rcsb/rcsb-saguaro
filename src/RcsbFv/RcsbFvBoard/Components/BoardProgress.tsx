import * as React from "react";
import {RcsbFvDOMConstants} from "../../RcsbFvConfig/RcsbFvDOMConstants";
import classes from "../../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvDefaultConfigValues} from "../../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface} from "../../RcsbFvConfig/RcsbFvConfigInterface";
import {Subscription} from "rxjs";
import {EventType, RcsbFvContextManager, RowReadyInterface} from "../../RcsbFvContextManager/RcsbFvContextManager";
import {RowStatusMap} from "../Utils/RowStatusMap";
import {computePosition, detectOverflow} from "@floating-ui/dom";

interface BoardProgressInterface {
    readonly boardId:string;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
    readonly contextManager: RcsbFvContextManager;
    readonly rowConfigData: Array<RcsbFvRowConfigInterface>;
    readonly rowStatusMap: RowStatusMap;
}

export class BoardProgress extends React.Component <BoardProgressInterface> {

    private subscription: Subscription;
    private tooltipDiv: HTMLDivElement;
    private refDiv: HTMLDivElement;

    render() {
        return (<div id={this.props.boardId+RcsbFvDOMConstants.PROGRESS_DIV_DOM_ID_PREFIX} style={{position:"absolute", top:0, left:0, visibility:"hidden", minWidth:150}} className={classes.rowTrackBoardSatus} >LOADING <span/></div>);
    }

    componentDidMount(): void {
        this.subscription = this.subscribe();
        const refDiv: HTMLDivElement | null= document.querySelector("#"+this.props.boardId);
        if(refDiv == null)
            throw "Main board DOM element not found";
        this.refDiv = refDiv;
        const tooltipDiv: HTMLDivElement  | null= document.querySelector("#"+this.props.boardId+RcsbFvDOMConstants.PROGRESS_DIV_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            throw "Tooltip DOM element not found";
        this.tooltipDiv = tooltipDiv;
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
        const offsetHeight: number = this.props.boardConfigData.includeAxis === true ? 0 : -RcsbFvDefaultConfigValues.trackAxisHeight - 2;
        computePosition(this.refDiv,this.tooltipDiv,{
            placement:'right-start',
            middleware:[{
                name: 'middleware',
                async fn(middlewareArguments) {
                    const overflow = await detectOverflow(middlewareArguments,{
                        rootBoundary: "viewport"
                    });
                    if(overflow.top > offsetHeight)
                        return {y:overflow.top+middlewareArguments.y - offsetHeight};
                    return {};
                },
            }]
        }).then(({x, y}) => {
            Object.assign(this.tooltipDiv.style, {
                left: `${x}px`,
                top: `${y+offsetHeight}px`,
                visibility: 'visible'
            });
        });
    }

    private statusComplete(){
        this.tooltipDiv.style.visibility = "hidden";
        this.props.contextManager.next({
            eventType: EventType.BOARD_READY,
            eventData: null
        })
    }

}