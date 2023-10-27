import * as React from "react";
import classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvDOMConstants} from "../RcsbFvConfig/RcsbFvDOMConstants";
import {CSSTransition} from "react-transition-group";
import {FaBars as menu, FaSearchMinus as zoomOut, FaSearchPlus as zoomIn, FaRegArrowAltCircleRight as moveRight, FaRegArrowAltCircleLeft as moveLeft} from 'react-icons/fa';
import {RcsbFvBoardConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {
    DomainViewInterface,
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerType
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {asyncScheduler, Subscription} from "rxjs";
import {RcsbScaleInterface} from "../../RcsbBoard/RcsbD3/RcsbD3ScaleFactory";
import {computePosition, detectOverflow} from "@floating-ui/dom";
import {ReactNode} from "react";

export interface RcsbFvUIConfigInterface {
    readonly boardId: string;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
    readonly contextManager: RcsbFvContextManager;
    readonly xScale: RcsbScaleInterface;
}

export interface RcsbFvUIStateInterface {
    collapse: boolean;
}

export interface RcsbFvUIButtonInterface {
    icon: ReactNode;
    callback: ()=>void;
}

export class RcsbFvUI extends React.Component<RcsbFvUIConfigInterface, RcsbFvUIStateInterface> {

    private tooltipDiv: HTMLDivElement;
    private refDiv: HTMLDivElement;

    /**UI config Object*/
    private readonly config: Array<RcsbFvUIButtonInterface> = [{
        icon: zoomIn({}),
        callback: this.zoomIn.bind(this)
    },{
        icon: zoomOut({}),
        callback: this.zoomOut.bind(this)
    },{
        icon: moveRight({}),
        callback: this.move.bind(this,1)
    },{
        icon: moveLeft({}),
        callback: this.move.bind(this,-1)
    }];

    private subscription: Subscription;
    private hideTask: Subscription | null = null;

    readonly state: RcsbFvUIStateInterface = {
        collapse: false
    }

    render(): ReactNode {
        return (
            <div id={this.props.boardId+RcsbFvDOMConstants.UI_DOM_ID_PREFIX} className={classes.rcsbUI+" "+classes.rcsbSmoothDivHide} style={{position:"absolute", top:0, left:0}}>
                <div style={{position:"relative"}} >
                    <CSSTransition
                        in={this.state.collapse}
                        timeout={300}
                        classNames={classes.rcsbCollapseUI}>
                        <div style={{position:"absolute"}} className={classes.rcsbCollapsedUIDiv+" "+classes.rcsbCollapseUI} onMouseEnter={this.changeState.bind(this,{collapse: false})}>
                            {
                                menu({className:classes.rcsbCollapsedIcon})
                            }
                        </div>
                    </CSSTransition>
                    <CSSTransition
                        in={!this.state.collapse}
                        timeout={300}
                        classNames={classes.rcsbExpandUI}>
                        <div style={{position:"absolute"}} className={classes.rcsbExpandUI} onMouseLeave={this.changeState.bind(this,{collapse: true})}>
                            <div className={classes.rcsbTopUI}/>
                            {
                                this.config.map(button=>{
                                    return this.buildButton(button);
                                })
                            }
                            <div className={classes.rcsbBottomUI}/>
                        </div>
                    </CSSTransition>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.subscription = this.subscribe();
        const refDiv: HTMLDivElement | null= document.querySelector("#"+this.props.boardId);
        if(refDiv == null)
            throw "Main board DOM element not found";
        this.refDiv = refDiv;
        const tooltipDiv: HTMLDivElement  | null= document.querySelector("#"+this.props.boardId+RcsbFvDOMConstants.UI_DOM_ID_PREFIX);
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
                case EventType.BOARD_HOVER:
                    this.boardHover(o.eventData as boolean);
                    break;
            }
        });
    }

    private boardHover(flag: boolean): void{
        if(flag){
            this.displayUI();
        }else{
            this.hideUI();
        }
    }

    private displayUI(): void{
        if(this.hideTask)
            this.hideTask.unsubscribe();

        const offsetHeight: number = this.props.boardConfigData.includeAxis === true ? RcsbFvDefaultConfigValues.trackAxisHeight + 2 : 0;
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
                top: `${y + offsetHeight}px`
            });
        });
        this.tooltipDiv.classList.remove(classes.rcsbSmoothDivHide);
        this.tooltipDiv.classList.add(classes.rcsbSmoothDivDisplay);
    }

    private hideUI(): void{
        const tooltipDiv: HTMLDivElement | null= document.querySelector("#"+this.props.boardId+RcsbFvDOMConstants.UI_DOM_ID_PREFIX);
        if(tooltipDiv == null)
            return;
        this.hideTask = asyncScheduler.schedule(()=>{
            tooltipDiv.classList.remove(classes.rcsbSmoothDivDisplay);
            tooltipDiv.classList.add(classes.rcsbSmoothDivHide);
        },300);
    }

    buildButton(buttonConfig: RcsbFvUIButtonInterface): ReactNode {
        return(
            <div className={classes.rcsbUIButton}>
                <div className={classes.rcsbIcon} onClick={buttonConfig.callback}>
                    {buttonConfig.icon}
                </div>
            </div>
        );
    }

    private changeState(state: RcsbFvUIStateInterface): void{
        this.setState(state);
    }

    /***************
     ** UI methods **
     ****************/

    private zoomIn(): void {
        const max: number | undefined = this.props.boardConfigData.range != null ? this.props.boardConfigData.range.max : this.props.boardConfigData.length;
        if(max == null)
            return;

        const currentDomain: Array<number> = this.props.xScale.domain();
        const deltaZoom: number = Math.floor((currentDomain[1]-currentDomain[0])*0.1);
        const x: number = currentDomain[0]+deltaZoom;
        const y: number = currentDomain[1]-deltaZoom;
        if( (y-x)>20)
            this.setDomain({domain:[x,y]});
    }

    private zoomOut(): void {
        const max: number | undefined = this.props.boardConfigData.range != null ? this.props.boardConfigData.range.max : this.props.boardConfigData.length;
        const min: number | undefined = this.props.boardConfigData.range != null ? this.props.boardConfigData.range.min : 1;
        if(max == null)
            return;

        const currentDomain: Array<number> = this.props.xScale.domain();
        const deltaZoom: number = Math.floor((currentDomain[1]-currentDomain[0])*0.1);
        const x: number = currentDomain[0]-deltaZoom > (min-RcsbFvDefaultConfigValues.increasedView) ? currentDomain[0]-deltaZoom : (min-RcsbFvDefaultConfigValues.increasedView);
        const y: number = currentDomain[1]+deltaZoom < max+RcsbFvDefaultConfigValues.increasedView ? currentDomain[1]+deltaZoom : max+RcsbFvDefaultConfigValues.increasedView;
        if( (y-x) < (max+RcsbFvDefaultConfigValues.increasedView))
            this.setDomain({domain:[x,y]});
        else
            this.setDomain({domain:[(min-RcsbFvDefaultConfigValues.increasedView),max+RcsbFvDefaultConfigValues.increasedView]});
    }

    private move(direction:1|-1): void {
        const max: number | undefined = this.props.boardConfigData.range != null ? this.props.boardConfigData.range.max : this.props.boardConfigData.length;
        const min: number | undefined = this.props.boardConfigData.range != null ? this.props.boardConfigData.range.min : 1;
        if(max == null)
            return;

        const currentDomain: Array<number> = this.props.xScale.domain();
        let deltaZoom: number = Math.floor((currentDomain[1]-currentDomain[0])*0.1);
        if(currentDomain[0]+direction*deltaZoom < (min-RcsbFvDefaultConfigValues.increasedView))
            deltaZoom = currentDomain[0] - (min-RcsbFvDefaultConfigValues.increasedView);
        else if(currentDomain[1]+direction*deltaZoom > (max+RcsbFvDefaultConfigValues.increasedView))
            deltaZoom = max+RcsbFvDefaultConfigValues.increasedView - currentDomain[1];

        const x: number = currentDomain[0]+direction*deltaZoom;
        const y: number = currentDomain[1]+direction*deltaZoom;
        if( (y-x) < (max+RcsbFvDefaultConfigValues.increasedView))
            this.setDomain({domain:[x,y]});
        else
            this.setDomain({domain:[(min-RcsbFvDefaultConfigValues.increasedView),max+RcsbFvDefaultConfigValues.increasedView]});
    }

    /**Force all board track annotation cells to set xScale. Called when a new track has been added*/
    private setScale(): void{
        if(this.props.xScale!=null) {
            this.props.contextManager.next({
                eventType: EventType.SCALE,
                eventData: this.props.boardId
            } as RcsbFvContextManagerType);
        }
    }

    /**Update d3 xScale domain
     * @param domainData new xScale domain
     * */
    private setDomain(domainData: DomainViewInterface): void {
        this.props.xScale.domain(domainData.domain);
        this.setScale();
    }
}