import * as React from "react";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvDOMConstants} from "../RcsbFvConfig/RcsbFvDOMConstants";
import {CSSTransition} from "react-transition-group";
import {FaBars} from 'react-icons/fa';

export interface RcsbFvUIConfigInterface {
    boardId: string;
    config: Array<RcsbFvUIButtonInterface>;
}

export interface RcsbFvUIStateInterface {
    collapse: boolean;
}

export interface RcsbFvUIButtonInterface {
    icon: JSX.Element;
    callback: ()=>void;
}

export class RcsbFvUI extends React.Component<RcsbFvUIConfigInterface, RcsbFvUIStateInterface> {

    readonly state: RcsbFvUIStateInterface = {
        collapse: true
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
                           <FaBars style={{padding:2}}/>
                        </div>
                    </CSSTransition>
                    <CSSTransition
                        in={!this.state.collapse}
                        timeout={300}
                        classNames={classes.rcsbExpandUI}>
                        <div style={{position:"absolute"}} className={classes.rcsbExpandUI} onMouseLeave={this.changeState.bind(this,{collapse: true})}>
                            <div className={classes.rcsbTopUI}/>
                            {
                                this.props.config.map(button=>{
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

}