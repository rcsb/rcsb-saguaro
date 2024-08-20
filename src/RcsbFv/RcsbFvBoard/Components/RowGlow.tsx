import React from "react";
import {RcsbFvDOMConstants} from "../../RcsbFvConfig/RcsbFvDOMConstants";
import * as classes from "../../../scss/RcsbFvRow.module.scss";
import {RcsbFvDefaultConfigValues} from "../../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {EventType, RcsbFvContextManager} from "../../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";
import {RcsbFvBoardConfigInterface} from "../../RcsbFvConfig/RcsbFvConfigInterface";

interface RowGlowInterface {
    readonly boardId: string;
    readonly contextManager: RcsbFvContextManager;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
}

export class RowGlow extends React.Component <RowGlowInterface>{

    private subscription: Subscription;

    render() {
        return (<div id={this.props.boardId+RcsbFvDOMConstants.GLOW_ROW_DOM_ID_SUFFIX} className={classes.rcsbNoRowGlow}>
            <div style={{borderWidth: RcsbFvDefaultConfigValues.rowGlowWidth, borderColor: RcsbFvDefaultConfigValues.rowGlowColor }}/>
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
                case EventType.ROW_HOVER:
                    this.updateGlow(o.eventData as string|null);
                    break;
            }
        });
    }

    private updateGlow(id: string|null): void{
        if(id){
            this.displayGlow(id);
        }else{
            this.hideGlow();
        }
    }

    private displayGlow(id:string): void{
        const boardDiv: HTMLElement | null = document.getElementById(this.props.boardId);
        const rowDiv: HTMLElement | null = document.getElementById(id);
        if (rowDiv != null && boardDiv != null) {
            const top: number = rowDiv.offsetTop - boardDiv.offsetTop;
            const height: number = rowDiv.getBoundingClientRect().height - 2 * RcsbFvDefaultConfigValues.rowGlowWidth;
            const glowDiv: HTMLElement | null = document.getElementById(this.props.boardId + RcsbFvDOMConstants.GLOW_ROW_DOM_ID_SUFFIX);
            if (glowDiv != null) {
                const innerGlowDiv: HTMLElement | undefined = glowDiv.getElementsByTagName("div")[0];
                const trackWidth: number = this.props.boardConfigData.trackWidth ??  RcsbFvDefaultConfigValues.trackWidth;
                const titleWidth: number = this.props.boardConfigData.rowTitleWidth ?? RcsbFvDefaultConfigValues.rowTitleWidth;
                glowDiv.style.top = top + "px";
                glowDiv.style.marginLeft = titleWidth + RcsbFvDefaultConfigValues.titleAndTrackSpace + "px";
                glowDiv.className = classes.rcsbRowGlow;
                innerGlowDiv.style.height = height + "px";
                innerGlowDiv.style.width = trackWidth + "px";
            }
        }
    }

    private hideGlow(): void{
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
}