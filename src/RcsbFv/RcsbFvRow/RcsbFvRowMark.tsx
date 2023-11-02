import React from "react";
import classes from "../../scss/RcsbFvRow.module.scss";
import {ReactNode} from "react";

export interface RcsbFvRowMarkInterface<T> extends RcsbFvRowMarkPublicInterface<T>{
    isGlowing: boolean;
}

export interface RcsbFvRowMarkPublicInterface<T> extends RcsbFvRowMarkCallbackInterface {
    externalRowMark?: {
        component:typeof React.Component<T>;
        props:T;
    }
}

interface RcsbFvRowMarkCallbackInterface {
    clickCallback?:()=>void;
    hoverCallback?:()=>void;
}

export class RcsbFvRowMark<T> extends React.Component <RcsbFvRowMarkInterface<T>,{}> {

    public render(): ReactNode {
        return (<div className={classes.rcsbFvRowMark} style={{display:"inline-block"}}>
            <div>
                {
                    this.props.externalRowMark ? <this.props.externalRowMark.component isGlowing={this.props.isGlowing} clickCallback={this.props.clickCallback} hoverCallback={this.props.hoverCallback} {...this.props.externalRowMark.props}/> : (
                        <div onClick={this.props.clickCallback} onMouseOver={this.props.hoverCallback} style={{width:6, height:6, marginBottom: 4, marginRight:5}} >
                            <div className={classes.rcsbFvRowMarkComponent}/>
                        </div>
                    )
                }
            </div>
        </div>);
    }

}