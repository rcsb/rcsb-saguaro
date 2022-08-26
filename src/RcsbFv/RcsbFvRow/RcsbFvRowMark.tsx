import * as React from "react";
import classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

export interface RcsbFvRowMarkInterface  {
    component?: JSX.Element;
    clickCallback?:()=>void;
    hoverCallback?:()=>void;
}

export class RcsbFvRowMark extends React.Component <RcsbFvRowMarkInterface,{}> {

    public render(): JSX.Element {
        return (<div className={classes.rcsbFvRowMark} style={{display:"inline-block"}}>
            <div>
                <div onClick={this.props.clickCallback} onMouseOver={this.props.hoverCallback} style={{width:6, height:6, marginBottom: 4, marginRight:5}} >
                    <div className={classes.rcsbFvRowMarkComponent}/>
                </div>
            </div>
        </div>);
    }

}