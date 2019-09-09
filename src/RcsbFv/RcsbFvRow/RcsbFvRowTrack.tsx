import * as React from "react";
import {RcsbFvTrack} from "../RcsbFvTrack/RcsbFvTrack";
import {RcsbFvConstants} from "../RcsbFvConstants/RcsbFvConstants";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvContextManager, RcsbFvContextManagerInterface} from "../RcsbFvContextManager/RcsbFvContextManager";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";

interface RcsbFvRowTrackInterface {
    id: string;
    data: RcsbFvRowConfigInterface;
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
        this.subscribe();
    }

    render(){
        return (
            <div className={classes.rcsbFvRowTrack} style={this.configStyle()}>
                <div id={this.props.id} />
            </div>
        );
    }

    componentDidMount(): void{
        this.rcsbFvTrack = new RcsbFvTrack(this.configData);
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

    subscribe(): void{
        RcsbFvContextManager.asObservable().subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===RcsbFvConstants.SCALE_CHANGED) {
                this.setScale(obj);
            }else if(obj.eventType===RcsbFvConstants.ELEMENT_SELECTED){
                this.setSelection(obj);
            }
        });
    }

    setScale(obj:RcsbFvContextManagerInterface) : void{
        this.rcsbFvTrack.setScale(obj);
    }

    setSelection(obj:RcsbFvContextManagerInterface) : void{
        this.rcsbFvTrack.setSelection(obj);
    }
}
