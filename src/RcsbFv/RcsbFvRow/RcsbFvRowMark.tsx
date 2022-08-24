import * as React from "react";
import classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

export interface RcsbFvRowMarkInterface  {
    component?: JSX.Element;
    clickCallback?:()=>void;
    hoverCallback?:()=>void;
}

export class RcsbFvRowMark extends React.Component <RcsbFvRowMarkInterface,{}> {

    public render(): JSX.Element {
        if(this.props.component)
            return this.props.component;
        return (<div onClick={this.props.clickCallback} onMouseOver={this.props.hoverCallback} style={{display:"inline-block", width:6, height:6, marginBottom: 4, marginRight:5}} className={classes.rcsbFvRowMark} >
            <div/>
        </div>);
    }

}