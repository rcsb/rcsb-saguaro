import * as React from "react";
import {RcsbFvTrack} from "../RcsbFvTrack/RcsbFvTrack";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import {RcsbFvContextManagerClass} from "../RcsbFvContextManager/RcsbFvContextManager";

interface RcsbFvRowTrackInterface {
    id: string;
    data: RcsbFvRowConfigInterface;
    contextManager: RcsbFvContextManagerClass;
    callbackRcsbFvRow(height: number): void;
}

interface RcsbFvRowTrackStyleInterface {
    width: number;
    height: number;
}

interface RcsbFvRowTrackState {
    rowTrackHeight: number;
    mounted: boolean;
}

export default class RcsbFvRowTrack extends React.Component <RcsbFvRowTrackInterface, RcsbFvRowTrackState> {

    configData : RcsbFvRowConfigInterface = null;
    rcsbFvTrack : RcsbFvTrack = null;
    readonly state : RcsbFvRowTrackState = {
        rowTrackHeight:RcsbFvDefaultConfigValues.trackHeight,
        mounted: false
    };

    constructor(props: RcsbFvRowTrackInterface) {
        super(props);
        this.configData = this.props.data;
    }

    render(){
        return (
            <div className={classes.rcsbFvRowTrack} style={this.configStyle()}>
                <div id={this.props.id} />
            </div>
        );
    }

    componentDidMount(): void{
        this.rcsbFvTrack = new RcsbFvTrack(this.configData, this.updateHeight.bind(this));
        this.updateHeight();
    }

    componentWillUnmount(): void {
        this.rcsbFvTrack.unsubscribe();
        this.rcsbFvTrack = null;
        this.configData = null;
    }

    updateHeight(): void{
        const height: number = this.rcsbFvTrack.getTrackHeight();
        this.setState({rowTrackHeight:height,mounted:true} as RcsbFvRowTrackState);
        this.props.callbackRcsbFvRow(height);
    }

    configStyle() : RcsbFvRowTrackStyleInterface {
        let width : number = RcsbFvDefaultConfigValues.trackWidth;
        if(typeof this.configData.trackWidth === "number"){
            width = this.configData.trackWidth;
        }
        return {
            width: width,
            height: this.state.rowTrackHeight
        };
    }

}
