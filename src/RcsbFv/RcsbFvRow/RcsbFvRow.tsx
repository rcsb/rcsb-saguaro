import * as React from "react";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import RcsbFvRowTitle from "./RcsbFvRowTitle";
import RcsbFvRowTrack from "./RcsbFvRowTrack";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";

interface RcsbFvRowInterface {
    id: string;
    data: RcsbFvRowConfigInterface;
}

interface RcsbFvRowStyleInterface{
    width: number;
    height: number;
}

export default class RcsbFvRow extends React.Component <RcsbFvRowInterface, {}> {

    configData : RcsbFvRowConfigInterface = null;

    constructor(props: RcsbFvRowInterface) {
        super(props);
        this.configData = this.props.data;
    }

    render(){
        return (
            <div className={"RcsbFvRow"} style={this.configStyle()}>
                <RcsbFvRowTitle data={this.configData}/>
                <RcsbFvRowTrack id={this.props.id} data={this.configData}/>
            </div>
        );
    }

    configStyle() : RcsbFvRowStyleInterface {
        let titleWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.configData.rowTitleWidth === "number"){
            titleWidth = this.configData.rowTitleWidth;
        }

        let trackWidth : number = RcsbFvDefaultConfigValues.trackWidth;
        if(typeof this.configData.trackWidth === "number"){
            trackWidth = this.configData.trackWidth;
        }

        let height : number = RcsbFvDefaultConfigValues.trackHeight;
        if(typeof this.configData.trackHeight === "number"){
            height = this.configData.trackHeight;
        }

        return {
            width: (titleWidth+trackWidth),
            height: height
        };
    }

}
