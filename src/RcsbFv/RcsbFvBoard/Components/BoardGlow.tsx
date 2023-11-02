import React from "react";
import {RcsbFvDOMConstants} from "../../RcsbFvConfig/RcsbFvDOMConstants";
import classes from "../../../scss/RcsbFvRow.module.scss";
import {asyncScheduler, Subscription} from "rxjs";
import {RcsbFvDefaultConfigValues} from "../../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvBoardConfigInterface} from "../../RcsbFvConfig/RcsbFvConfigInterface";
import {EventType, RcsbFvContextManager} from "../../RcsbFvContextManager/RcsbFvContextManager";

interface BoardGlowInterface {
    readonly boardId:string;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
    readonly contextManager: RcsbFvContextManager;
}

export class BoardGlow extends React.Component <BoardGlowInterface> {

    /**Mouse Leave task*/
    private hideTask: Subscription | null = null;
    private subscription: Subscription;

    render() {
        return (<div id={this.props.boardId+RcsbFvDOMConstants.GLOW_DOM_ID_PREFIX} className={classes.rcsbNoGlow}>
            <div />
        </div>);
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
                case EventType.BOARD_HOVER:
                    this.boardHover(o.eventData as boolean);
                    break;
            }
        });
    }

    private boardHover(flag: boolean): void{
        if(flag){
            this.displayGlow();
        }else{
            this.hideGlow();
        }
    }

    private displayGlow(): void{
        if(this.hideTask)
            this.hideTask.unsubscribe();
        const mainDiv: HTMLElement | null = document.getElementById(this.props.boardId);
        if (mainDiv != null) {
            const mainDivSize: DOMRect = mainDiv.getBoundingClientRect();
            const axisDivSize: number = mainDiv.getElementsByClassName(classes.rcsbFvRowAxis)[0]?.getBoundingClientRect().height ?? 0;
            const height: number = mainDivSize.height - axisDivSize;
            const glowDiv: HTMLElement | null = document.getElementById(this.props.boardId + RcsbFvDOMConstants.GLOW_DOM_ID_PREFIX);
            if (glowDiv != null) {
                const innerGlowDiv: HTMLElement | undefined = glowDiv.getElementsByTagName("div")[0];
                const trackWidth: number = (this.props.boardConfigData.trackWidth ?? 0) + 2*(this.props.boardConfigData.borderWidth ?? RcsbFvDefaultConfigValues.borderWidth);
                const titleWidth: number = (this.props.boardConfigData.rowTitleWidth ?? RcsbFvDefaultConfigValues.rowTitleWidth);
                glowDiv.style.top = axisDivSize + "px";
                glowDiv.style.marginLeft = titleWidth + RcsbFvDefaultConfigValues.titleAndTrackSpace + "px";
                glowDiv.className = classes.rcsbGlow;
                innerGlowDiv.style.height = height + "px";
                innerGlowDiv.style.width = trackWidth + "px";
            }
        }
    }

    private hideGlow(): void {
        const glowDiv: HTMLElement|null = document.getElementById(this.props.boardId+RcsbFvDOMConstants.GLOW_DOM_ID_PREFIX);
        if(glowDiv!=null){
            this.hideTask = asyncScheduler.schedule(()=>{
                glowDiv.className = classes.rcsbNoGlow;
                this.hideTask = asyncScheduler.schedule(()=>{
                    this.hideTask = null;
                    const innerGlowDiv: HTMLElement|undefined = glowDiv.getElementsByTagName("div")[0];
                    glowDiv.style.top = "0px";
                    glowDiv.style.marginLeft = "0px";
                    innerGlowDiv.style.height = "0px";
                    innerGlowDiv.style.width = "0px";
                },300);
            },300);
        }
    }
}