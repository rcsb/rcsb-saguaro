import * as React from "react";
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvRowTitle} from "./RcsbFvRowTitle";
import {RcsbFvRowTrack} from "./RcsbFvRowTrack";
import {RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvContextManager} from "../RcsbFvContextManager/RcsbFvContextManager";
import {ScaleLinear} from "d3-scale";
import {RcsbSelection} from "../../RcsbBoard/RcsbSelection";

/**Board track React component interface*/
interface RcsbFvRowInterface {
    readonly id: string;
    readonly rowConfigData: RcsbFvRowConfigInterface;
    readonly contextManager: RcsbFvContextManager;
    readonly xScale: ScaleLinear<number,number>;
    readonly selection: RcsbSelection;
}

/**Board track React style interface*/
interface RcsbFvRowStyleInterface{
    readonly width: number;
    readonly height: number;
}

/**Board track React state interface*/
interface RcsbFvRowState {
    readonly rowHeight: number;
    readonly mounted: boolean;
    readonly rowConfigData: RcsbFvRowConfigInterface;
}


/**Board track React Component class*/
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
        if(this.props.rowConfigData.displayType === RcsbFvDisplayTypes.AXIS || this.props.rowConfigData.displayType === RcsbFvDisplayTypes.UI){
            classNames += " "+classes.rcsbFvRowAxis;
        }
        return (
            <div className={classNames} style={this.configStyle()}>
                <RcsbFvRowTitle data={this.props.rowConfigData} rowTitleHeight={this.state.rowHeight} />
                <RcsbFvRowTrack id={this.props.id} rowTrackConfigData={this.props.rowConfigData} xScale={this.props.xScale} selection={this.props.selection} contextManager={this.props.contextManager} callbackRcsbFvRow={this.callbackRcsbFvRowTrack.bind(this)}/>
            </div>
        );
    }

    /**This function will be called once the final height of the track is known*/
    private callbackRcsbFvRowTrack(rcsbRowTrackHeight: number): void {
        this.setState({rowHeight: rcsbRowTrackHeight, mounted:true} as RcsbFvRowState);
    }

    /**Returns the full track width (title+annotations) and height
     * @return Board track full width
     * */
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
