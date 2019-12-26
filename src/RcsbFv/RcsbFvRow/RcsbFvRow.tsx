import * as React from "react";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import RcsbFvRowTitle from "./RcsbFvRowTitle";
import RcsbFvRowTrack from "./RcsbFvRowTrack";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

interface RcsbFvRowInterface {
    id: string;
    data: RcsbFvRowConfigInterface;
}

interface RcsbFvRowStyleInterface{
    width: number;
    height: number;
}

interface RcsbFvRowState {
    rowHeight: number;
    mounted: boolean;
}

export default class RcsbFvRow extends React.Component <RcsbFvRowInterface, RcsbFvRowState> {

    configData : RcsbFvRowConfigInterface = null;
    readonly state : RcsbFvRowState = {
            rowHeight:RcsbFvDefaultConfigValues.trackHeight,
            mounted: false
    };

    constructor(props: RcsbFvRowInterface) {
        super(props);
        this.configData = this.props.data;
    }

    render(){
        let classNames:string = classes.rcsbFvRow;
        if(this.configData.isAxis === true){
            classNames += " "+classes.rcsbFvRowAxis;
        }
        return (
            <div className={classNames} style={this.configStyle()}>
                <RcsbFvRowTitle data={this.configData} rowTitleHeight={this.state.rowHeight}/>
                <RcsbFvRowTrack id={this.props.id} data={this.configData} callbackRcsbFvRow={this.callbackRcsbFvRowTrack.bind(this)}/>
            </div>
        );
    }

    callbackRcsbFvRowTrack(rcsbRowTrackHeight: number): void {
        this.setState({rowHeight: rcsbRowTrackHeight, mounted:true} as RcsbFvRowState);
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
        return {
            width: (titleWidth+trackWidth),
            height: this.state.rowHeight
        };
    }

}
