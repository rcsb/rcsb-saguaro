import * as React from "react";
import {RcsbFvConstants} from "../RcsbFvConstants/RcsbFvConstants";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import RcsbFvRowTitle from "./RcsbFvRowTitle";
import RcsbFvRowTrack from "./RcsbFvRowTrack";

interface RcsbFvRowInterface {
    id: string;
    data: Map<string, any>;
}

export default class RcsbFvRow extends React.Component <RcsbFvRowInterface, {}> {

    configData : Map<string, any> = null;

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

    configStyle() : any {
        let titleWidth : number = RcsbFvDefaultConfigValues.ROW_TITLE_WIDTH;
        if(this.configData.has(RcsbFvConstants.ROW_TITLE_WIDTH)){
            titleWidth = this.configData.get(RcsbFvConstants.ROW_TITLE_WIDTH);
        }

        let trackWidth : number = RcsbFvDefaultConfigValues.TRACK_WIDTH;
        if(this.configData.has(RcsbFvConstants.TRACK_WIDTH)){
            trackWidth = this.configData.get(RcsbFvConstants.TRACK_WIDTH);
        }

        let height : number = RcsbFvDefaultConfigValues.TRACK_HEIGHT;
        if(this.configData.has(RcsbFvConstants.TRACK_HEIGHT)){
            height = this.configData.get(RcsbFvConstants.TRACK_HEIGHT);
        }

        return {
            width: (titleWidth+trackWidth),
            height: height
        };
    }

}
