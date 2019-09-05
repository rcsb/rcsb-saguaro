import * as React from "react";
import {RcsbFvTrack} from "../RcsbFvTrack/RcsbFvTrack";
import {RcsbFvConstants} from "../RcsbFvConstants/RcsbFvConstants";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvContextManager, RcsbFvContextManagerInterface} from "../RcsbFvContextManager/RcsbFvContextManager";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.css";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";

interface RcsbFvRowTrackInterface {
    id: string;
    data: RcsbFvRowConfigInterface;
}

interface RcsbFvRowTrackStyleInterface {
    width: number;
    height: number;
}

export default class RcsbFvRowTrack extends React.Component <RcsbFvRowTrackInterface, {}> {

    configData : RcsbFvRowConfigInterface = null;
    rcsbFvTrack : RcsbFvTrack = null;

    constructor(props: RcsbFvRowTrackInterface) {
        super(props);
        this.configData = this.props.data;
        this.subscribe();
    }

    render(){
        return (
            <div className={classes.rowTrack} style={this.configStyle()}>
                <div id={this.props.id} />
            </div>
        );
    }

    componentDidMount(){
        this.rcsbFvTrack = new RcsbFvTrack(this.configData);
    }

    configStyle() : RcsbFvRowTrackStyleInterface {
        let width : number = RcsbFvDefaultConfigValues.trackWidth;
        let height : number = RcsbFvDefaultConfigValues.trackHeight;
        if(typeof this.configData.trackWidth === "number"){
            width = this.configData.trackWidth;
        }
        if(typeof this.configData.trackHeight === "number"){
            height = this.configData.trackHeight;
        }
        return {
            width: width,
            height: height
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
