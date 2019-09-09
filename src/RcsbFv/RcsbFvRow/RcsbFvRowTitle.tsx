import * as React from "react";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";

interface RcsbFvRowTitleInterface {
    data: RcsbFvRowConfigInterface;
    rowTitleHeight: number;
}

interface RcsbFvRowTitleStyleInterface {
    width:number;
    height: number;
}

export default class RcsbFvRowTitle extends React.Component <RcsbFvRowTitleInterface, {}> {

    configData : RcsbFvRowConfigInterface = null;

    constructor(props: RcsbFvRowTitleInterface) {
        super(props);
        this.configData = this.props.data;
        this.state = {

        };
    }

    render(){
        return (
            <div className={classes.rcsbFvRowTitle} style={this.configStyle()}>
                <div style={this.configStyle()}>{this.setTitle()}</div>
            </div>
        );
    }

    setTitle(): string {
        if(typeof this.configData.rowTitle === "string"){
            return String(this.configData.rowTitle).toUpperCase();
        }
        return null;
    }

    configStyle() : RcsbFvRowTitleStyleInterface {
        let width : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.configData.rowTitleWidth === "number"){
            width = this.configData.rowTitleWidth;
        }
        return {
            width: width,
            height: this.props.rowTitleHeight
        };
    }
}
