import * as React from "react";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvDOMConstants} from "../RcsbFvConfig/RcsbFvDOMConstants";
import {CSSTransition} from "react-transition-group";
import {FaBars as menu, FaSearchMinus as zoomOut, FaSearchPlus as zoomIn, FaRegArrowAltCircleRight as moveRight, FaRegArrowAltCircleLeft as moveLeft} from 'react-icons/fa';
import {RcsbFvBoardConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {ScaleLinear} from "d3-scale";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {DomainViewInterface} from "../RcsbFvContextManager/RcsbFvContextManager";

export interface RcsbFvUIConfigInterface {
    readonly boardId: string;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
    readonly xScale: ScaleLinear<number,number>;
    readonly setDomain: (domainData: DomainViewInterface) => void;
}

export interface RcsbFvUIStateInterface {
    collapse: boolean;
}

export interface RcsbFvUIButtonInterface {
    icon: JSX.Element;
    callback: ()=>void;
}

export class RcsbFvUI extends React.Component<RcsbFvUIConfigInterface, RcsbFvUIStateInterface> {

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

    readonly state: RcsbFvUIStateInterface = {
        collapse: false
    }

    render(): JSX.Element{
        return (
            <div id={this.props.boardId+RcsbFvDOMConstants.UI_DOM_ID_PREFIX} className={classes.rcsbUI+" "+classes.rcsbSmoothDivHide}>
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

    buildButton(buttonConfig: RcsbFvUIButtonInterface): JSX.Element{
        buttonConfig.icon.props.className = classes.rcsbIcon;
        buttonConfig.icon.props.onClick = buttonConfig.callback;
        return(
            <div className={classes.rcsbUIButton}>
                {buttonConfig.icon}
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
        const min: number | undefined = this.props.boardConfigData.range != null ? this.props.boardConfigData.range.min : 1;
        if(max == null)
            return;

        const currentDomain: Array<number> = this.props.xScale.domain();
        const deltaZoom: number = Math.floor((currentDomain[1]-currentDomain[0])*0.1);
        const x: number = currentDomain[0]+deltaZoom;
        const y: number = currentDomain[1]-deltaZoom;
        if( (y-x)>20)
            this.props.setDomain({domain:[x,y]});
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
            this.props.setDomain({domain:[x,y]});
        else
            this.props.setDomain({domain:[(min-RcsbFvDefaultConfigValues.increasedView),max+RcsbFvDefaultConfigValues.increasedView]});
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
            this.props.setDomain({domain:[x,y]});
        else
            this.props.setDomain({domain:[(min-RcsbFvDefaultConfigValues.increasedView),max+RcsbFvDefaultConfigValues.increasedView]});
    }

}