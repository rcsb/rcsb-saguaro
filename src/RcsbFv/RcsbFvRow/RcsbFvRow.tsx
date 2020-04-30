import * as React from "react";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvRowTitle} from "./RcsbFvRowTitle";
import {RcsbFvRowTrack} from "./RcsbFvRowTrack";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvContextManager} from "../RcsbFvContextManager/RcsbFvContextManager";

interface RcsbFvRowInterface {
    id: string;
    rowConfigData: RcsbFvRowConfigInterface;
    contextManager: RcsbFvContextManager;
    callbackRcsbFvBoard(id:string, height: number): void;
}

interface RcsbFvRowStyleInterface{
    width: number;
    height: number;
}

interface RcsbFvRowState {
    rowHeight: number;
    mounted: boolean;
    rowConfigData: RcsbFvRowConfigInterface;
}

export class RcsbFvRow extends React.Component <RcsbFvRowInterface, RcsbFvRowState> {

    readonly state : RcsbFvRowState = {
        rowHeight:RcsbFvDefaultConfigValues.trackHeight,
        mounted: false,
        rowConfigData: this.props.rowConfigData
    };

    constructor(props: RcsbFvRowInterface) {
        super(props);
    }

    render(){
        let classNames:string = classes.rcsbFvRow;
        if(this.props.rowConfigData.isAxis === true){
            classNames += " "+classes.rcsbFvRowAxis;
        }
        return (
            <div className={classNames} style={this.configStyle()}>
                <RcsbFvRowTitle data={this.props.rowConfigData} rowTitleHeight={this.state.rowHeight}/>
                <RcsbFvRowTrack id={this.props.id} rowTrackConfigData={this.props.rowConfigData} contextManager={this.props.contextManager} callbackRcsbFvRow={this.callbackRcsbFvRowTrack.bind(this)}/>
            </div>
        );
    }

    callbackRcsbFvRowTrack(rcsbRowTrackHeight: number): void {
        this.setState({rowHeight: rcsbRowTrackHeight, mounted:true} as RcsbFvRowState);
        this.props.callbackRcsbFvBoard(this.props.id,rcsbRowTrackHeight);
    }

    configStyle() : RcsbFvRowStyleInterface {
        let titleWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.props.rowConfigData.rowTitleWidth === "number"){
            titleWidth = this.props.rowConfigData.rowTitleWidth;
        }
        let trackWidth : number = RcsbFvDefaultConfigValues.trackWidth;
        if(typeof this.props.rowConfigData.trackWidth === "number"){
            trackWidth = this.props.rowConfigData.trackWidth;
        }
        return {
            width: (titleWidth+trackWidth+2),
            height: this.state.rowHeight
        };
    }

}
