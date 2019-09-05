import * as React from "react";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.css";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";

interface RcsbFvRowTitleInterface {
    data: RcsbFvRowConfigInterface;
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
            <div className={classes.rowTitle} style={this.configStyle()}>
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
        let height : number = RcsbFvDefaultConfigValues.trackHeight;
        if(typeof this.configData.rowTitleWidth === "number"){
            width = this.configData.rowTitleWidth;
        }
        if(typeof this.configData.trackHeight === "number"){
            height = this.configData.trackHeight;
        }
        return {
            width: width,
            height: height
        };
    }
}
