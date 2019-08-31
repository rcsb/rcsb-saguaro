import * as React from "react";
import {RcsbFvTrack} from "../RcsbFvTrack/RcsbFvTrack";
import {RcsbFvConstants} from "../RcsbFvConstants/RcsbFvConstants";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvSubject} from "../RcsbFvSubject/RcsbFvSubject";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.css";

interface RcsbFvRowTrackInterface {
    id: string;
    data: any;
}

export default class RcsbFvRowTrack extends React.Component <RcsbFvRowTrackInterface, {}> {

    configData : Map<string, any> = null;
    rcsbFvTrack : RcsbFvTrack = null;

    constructor(props: RcsbFvRowTrackInterface) {
        super(props);
        this.configData = this.props.data;
        RcsbFvSubject.react.getSubject().subscribe((obj:any)=>{
            if(obj[RcsbFvConstants.EVENT_TYPE]===RcsbFvConstants.SCALE_CHANGED) {
                this.setScale(obj);
            }else if(obj[RcsbFvConstants.EVENT_TYPE]===RcsbFvConstants.ELEMENT_SELECTED){
                this.setSelection(obj);
            }
        });
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

    configStyle() : any {
        let width : number = RcsbFvDefaultConfigValues.TRACK_WIDTH;
        let height : number = RcsbFvDefaultConfigValues.TRACK_HEIGHT;
        if(this.configData.has(RcsbFvConstants.TRACK_WIDTH)){
            width = this.configData.get(RcsbFvConstants.TRACK_WIDTH);
        }
        if(this.configData.has(RcsbFvConstants.TRACK_HEIGHT)){
            height = this.configData.get(RcsbFvConstants.TRACK_HEIGHT);
        }
        return {
            width: width,
            height: height
        };
    }

    setScale(obj:any) : void{
        this.rcsbFvTrack.setScale(obj);
    }

    setSelection(obj:any) : void{
        this.rcsbFvTrack.setSelection(obj);
    }
}
