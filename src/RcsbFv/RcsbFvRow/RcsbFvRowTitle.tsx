import * as React from "react";
import {RcsbFvConstants} from "../RcsbFvConstants/RcsbFvConstants";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.css";

interface RcsbFvRowTitleInterface {
    data: any;
}

export default class RcsbFvRowTitle extends React.Component <RcsbFvRowTitleInterface, {}> {

    configData : Map<string, any> = null;

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
        if(this.configData.has(RcsbFvConstants.ROW_TITLE)){
            return String(this.configData.get(RcsbFvConstants.ROW_TITLE)).toUpperCase();
        }
        return null;
    }

    configStyle() : any {
        let width : number = RcsbFvDefaultConfigValues.ROW_TITLE_WIDTH;
        let height : number = RcsbFvDefaultConfigValues.TRACK_HEIGHT;
        if(this.configData.has(RcsbFvConstants.ROW_TITLE_WIDTH)){
            width = this.configData.get(RcsbFvConstants.ROW_TITLE_WIDTH);
        }
        if(this.configData.has(RcsbFvConstants.TRACK_HEIGHT)){
            height = this.configData.get(RcsbFvConstants.TRACK_HEIGHT);
        }
        return {
            width: width,
            height: height
        };
    }
}
