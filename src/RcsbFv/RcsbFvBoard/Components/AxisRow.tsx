import * as React from "react";
import {RcsbFvRow} from "../../RcsbFvRow/RcsbFvRow";
import {RowConfigFactory} from "../Utils/RowConfigFactory";
import {RcsbFvContextManager} from "../../RcsbFvContextManager/RcsbFvContextManager";
import {RcsbScaleInterface} from "../../../RcsbBoard/RcsbD3/RcsbD3ScaleFactory";
import {RcsbSelection} from "../../../RcsbBoard/RcsbSelection";
import {RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface} from "../../RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvDisplayTypes} from "../../RcsbFvConfig/RcsbFvDefaultConfigValues";
import uniqid from "uniqid";
import {ReactNode} from "react";

interface AxisRowInterface {
    readonly boardId: string;
    readonly contextManager: RcsbFvContextManager;
    readonly xScale: RcsbScaleInterface;
    readonly selection: RcsbSelection;
    readonly boardConfigData: RcsbFvBoardConfigInterface;
}

export class AxisRow extends React.Component<AxisRowInterface,{axisKey:string}>{

    readonly state: {axisKey:string} = {
        axisKey: uniqid("rcsbFvAxis_key_")
    };

    render(): ReactNode {
        const rowId: string = uniqid("rcsbFvAxis_");
        const rowConfig:RcsbFvRowConfigInterface = {displayType:RcsbFvDisplayTypes.AXIS, innerTrackId:rowId, trackId:rowId, boardId:this.props.boardId};
        return(<div key={this.state.axisKey}><RcsbFvRow
            id={rowId}
            boardId={this.props.boardId}
            rowNumber={0}
            rowConfigData={RowConfigFactory.getConfig(rowId, this.props.boardId, rowConfig, this.props.boardConfigData)}
            xScale={this.props.xScale}
            selection={this.props.selection}
            contextManager={this.props.contextManager}
            renderSchedule={"fixed"}
        /></div>);
    }


    componentDidUpdate(prevProps: Readonly<AxisRowInterface>, prevState: Readonly<{axisKey:string}>, snapshot?: any) {
        if(
            prevProps.boardConfigData.length != this.props.boardConfigData.length ||
            prevProps.boardConfigData.range?.min != this.props.boardConfigData.range?.min ||
            prevProps.boardConfigData.range?.max != this.props.boardConfigData.range?.max ||
            prevProps.boardConfigData.trackWidth != this.props.boardConfigData.trackWidth
        ){
            this.setState({
                axisKey:uniqid("rcsbFvAxis_key_")
            });
        }

    }
}