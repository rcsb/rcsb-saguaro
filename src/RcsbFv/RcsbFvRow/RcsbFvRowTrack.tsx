import * as React from "react";
import {RcsbFvTrack} from "../RcsbFvTrack/RcsbFvTrack";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {
    EVENT_TYPE,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import {ScaleTransform, SelectionInterface} from "../../RcsbBoard/RcsbBoard";

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
            if(obj.eventType===EVENT_TYPE.SCALE) {
                this.setScale(obj.eventData as ScaleTransform);
            }else if(obj.eventType===EVENT_TYPE.SELECTION){
                this.setSelection(obj.eventData as SelectionInterface);
            }
        });
    }

    setScale(obj:ScaleTransform) : void{
        this.rcsbFvTrack.setScale(obj);
    }

    setSelection(obj:SelectionInterface) : void{
        this.rcsbFvTrack.setSelection(obj);
    }
}
