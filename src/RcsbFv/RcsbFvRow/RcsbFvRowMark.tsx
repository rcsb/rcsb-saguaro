import * as React from "react";
import classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

interface RcsbFvRowMarkInterface  {
    clickCallback?:()=>void;
    hoverCallback?:()=>void;
}

export class RcsbFvRowMark extends React.Component <RcsbFvRowMarkInterface,{}> {

    public render(): JSX.Element {
        return (<div onClick={this.props.clickCallback} style={{display:"inline-block", width:6, height:6, marginBottom: 4, marginRight:5}} className={classes.rcsbFvRowMark} >
            <div/>
        </div>);
    }

}