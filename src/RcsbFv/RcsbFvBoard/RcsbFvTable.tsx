import * as React from "react";

import {EventType, RcsbFvContextManager,} from "../RcsbFvContextManager/RcsbFvContextManager";
import {RcsbSelection} from "../../RcsbBoard/RcsbSelection";
import {RcsbFvBoardFullConfigInterface} from "./RcsbFvBoard";
import {RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvRow} from "../RcsbFvRow/RcsbFvRow";
import classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RowConfigFactory} from "./Utils/RowConfigFactory";
import {RcsbScaleInterface} from "../../RcsbBoard/RcsbD3/RcsbD3ScaleFactory";
import {RcsbFvExtendedRowConfigInterface} from "./Utils/BoardDataState";
import {AxisRow} from "./Components/AxisRow";


interface RcsbFvTableInterface extends RcsbFvBoardFullConfigInterface {
    readonly boardId: string;
    readonly contextManager: RcsbFvContextManager;
    readonly xScale: RcsbScaleInterface;
    readonly selection: RcsbSelection;
    readonly rowConfigData: Array<RcsbFvExtendedRowConfigInterface>;
}

export class RcsbFvTable extends React.Component <RcsbFvTableInterface> {

    /**Inner div board DOM element id*/
    private readonly boardId : string;
    /**Global d3 Xscale object shaed among all board tracks*/
    private readonly xScale: RcsbScaleInterface;
    /**Global selection shared among all tracks*/
    private readonly selection:RcsbSelection;

    constructor(props: RcsbFvTableInterface) {
        super(props);
        this.xScale = props.xScale;
        this.selection = props.selection;
        this.boardId = props.boardId;
    }

    render(): JSX.Element{
        return (
            <div id={this.boardId} className={classes.rcsbFvBoard} style={this.configStyle()} onMouseLeave={this.setMouseLeaveBoardCallback()}>
                {this.props.boardConfigData.includeAxis ? this.getAxisRow(): null}
                {border(this.props.boardConfigData)}
                {
                    this.props.rowConfigData.filter((rowData: RcsbFvRowConfigInterface) =>{
                        return rowData.trackVisibility != false;
                    }).map((rowConfig, n) =>{
                        const rowId: string = rowConfig.trackId;
                        const rowNumber: number = n + (this.props.boardConfigData.includeAxis ? 1 : 0);
                        return (<div key={rowConfig.key}><RcsbFvRow
                            id={rowId}
                            boardId={this.boardId}
                            rowNumber={rowNumber}
                            rowConfigData={RowConfigFactory.getConfig(rowId,this.boardId,rowConfig,this.props.boardConfigData)}
                            xScale={this.xScale}
                            selection={this.selection}
                            contextManager={this.props.contextManager}
                            renderSchedule={ rowNumber == (this.props.boardConfigData.includeAxis ? 1 : 0) ? "sync" : (rowConfig.renderSchedule ?? "async")}
                        /></div>);
                    })
                }
                {border(this.props.boardConfigData)}
            </div>
        );
    }

    private setMouseLeaveBoardCallback(): (()=>void)|undefined{
        if(this.props.boardConfigData.highlightHoverPosition === true || typeof this.props.boardConfigData.highlightHoverCallback === "function")
            return this.mouseLeaveBoardCallback.bind(this);
        else
            return undefined;
    }

    private mouseLeaveBoardCallback(): void{
        if(this.props.boardConfigData.highlightHoverPosition === true){
            this.props.contextManager.next({
                eventType:EventType.SET_SELECTION,
                eventData:{
                    elements: null,
                    mode: "hover"
                }
            })
        }
        if(this.props.boardConfigData.highlightHoverCallback){
            this.props.boardConfigData.highlightHoverCallback(this.selection.getSelected('hover').map(r=>r.rcsbFvTrackDataElement));
        }
    }

    private getAxisRow(): JSX.Element {
        const rowId: string = "rcsbFvAxis_0";
        const rowConfig:RcsbFvRowConfigInterface = {displayType:RcsbFvDisplayTypes.AXIS, trackId:rowId, boardId:this.boardId};
        return(<AxisRow
            boardId={this.props.boardId}
            xScale={this.xScale}
            selection={this.selection}
            contextManager={this.props.contextManager}
            boardConfigData={this.props.boardConfigData}
        />);
    }

    /**Returns the full track width (title+annotations)
     * @return Board track full width
     * */
    private configStyle() : React.CSSProperties {
        let titleWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.props.boardConfigData.rowTitleWidth === "number"){
            titleWidth = this.props.boardConfigData.rowTitleWidth;
        }
        let trackWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.props.boardConfigData.trackWidth === "number"){
            trackWidth = this.props.boardConfigData.trackWidth;
        }
        return {
            width: (titleWidth+trackWidth+(this.props.boardConfigData.borderWidth ?? RcsbFvDefaultConfigValues.borderWidth)*2+RcsbFvDefaultConfigValues.titleAndTrackSpace)
        };
    }

}

function border(boardConfigData: RcsbFvBoardConfigInterface): JSX.Element {
    const height: number = RcsbFvDefaultConfigValues.borderWidth;
    return(<div
        style={{
            width: "100%",
            height
        }}
    ><div style={{
        width: boardConfigData.trackWidth,
        height:0,
        float:"right",
        borderTop: height + "px solid #DDD",
        borderLeft: RcsbFvDefaultConfigValues.borderWidth + "px solid #DDD",
        borderRight: RcsbFvDefaultConfigValues.borderWidth + "px solid #DDD"
    }}></div></div>);
}