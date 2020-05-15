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

interface RcsbFvRowProvenanceStyleInterface {
    height: number;
    borderColor: string;
    backgroundColor: string;
}

export class RcsbFvRowTitle extends React.Component <RcsbFvRowTitleInterface, {}> {

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
                {
                    this.setTitle()!=null ? <div style={this.configProvenanceStyle()} className={classes.rcsbFvRowTitleProvenanceFlag} /> : null
                }
            </div>
        );
    }

    setTitle(): string {
        if(typeof this.configData.rowTitle === "string"){
            return this.configData.rowTitle;
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

    configProvenanceStyle():RcsbFvRowProvenanceStyleInterface {
        let color: string = "#FFFFFF";
        if(typeof this.props.data.titleFlagColor === "string"){
            color = this.props.data.titleFlagColor;
        }
        return {
            backgroundColor: color,
            borderColor: color,
            height: this.props.rowTitleHeight
        };
    }
}
