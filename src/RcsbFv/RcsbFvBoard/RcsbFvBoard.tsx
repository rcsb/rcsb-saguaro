import * as React from "react";
import {DISPLAY_TYPES, RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import RcsbFvRow from "../RcsbFvRow/RcsbFvRow";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "../RcsbFvInterface";

import {
    EVENT_TYPE,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, ResetInterface, ScaleTransformInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";

interface RcsbFvBoardInterface {
    rowConfigData: Array<RcsbFvRowConfigInterface>;
    boardConfigData: RcsbFvBoardConfigInterface;
}

interface RcsbFvBoardState {
    rowConfigData: Array<RcsbFvRowConfigInterface>;
    boardConfigData: RcsbFvBoardConfigInterface;
}

interface RcsbFvBoardStyleInterface{
    width: number;
}

export default class RcsbFvBoard extends React.Component <RcsbFvBoardInterface, RcsbFvBoardState> {

    boardId : string = "RcsbFvBoard_"+Math.random().toString(36).substr(2);
    rcsbFvRowArrayIds : Array<string> = new Array<string>();
    currentScale: ScaleTransformInterface;
    private subscription: Subscription;

    readonly state : RcsbFvBoardState = {
        rowConfigData: this.props.rowConfigData,
        boardConfigData: this.props.boardConfigData
    } as RcsbFvBoardState;

    render(){
        let rcsbFvRowAxis = null;
        if(this.state.boardConfigData.includeAxis === true){
            const rowId: string = "RcsbFvRow_"+Math.random().toString(36).substr(2);
            this.rcsbFvRowArrayIds.push(rowId);
            const rowData:RcsbFvRowConfigInterface = {displayType:DISPLAY_TYPES.AXIS, trackId:"axisId_"+Math.random().toString(36).substr(2)};
            const data: RcsbFvRowConfigInterface = this.configRow(rowId,rowData);
            data.isAxis = true;
            rcsbFvRowAxis = <RcsbFvRow key={rowId} id={rowId} data={data} />;
        }
        return (
            <div id={this.boardId}>
                {rcsbFvRowAxis}
                {

                    this.state.rowConfigData.map(rowData=>{
                        const rowId: string = "RcsbFvRow_"+Math.random().toString(36).substr(2);
                        this.rcsbFvRowArrayIds.push(rowId);
                        const data = this.configRow(rowId,rowData);
                        data.isAxis = false;
                        return (<RcsbFvRow key={rowId} id={rowId} data={data} />);
                    })
                }
            </div>
        );
    }

    configStyle() : RcsbFvBoardStyleInterface {
        let titleWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.state.boardConfigData.rowTitleWidth === "number"){
            titleWidth = this.state.boardConfigData.rowTitleWidth;
        }

        let trackWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.state.boardConfigData.trackWidth === "number"){
            trackWidth = this.state.boardConfigData.trackWidth;
        }

        return {
            width: (titleWidth+trackWidth)
        };
    }

    configRow(id:string, config: RcsbFvRowConfigInterface) : RcsbFvRowConfigInterface{
        const out: RcsbFvRowConfigInterface = Object.assign({},config);
        out.elementId = id;
        if(typeof this.state.boardConfigData.length === "number"){
            out.length = this.state.boardConfigData.length;
        }
        if(typeof this.state.boardConfigData.rowTitleWidth === "number"){
            out.rowTitleWidth = this.state.boardConfigData.rowTitleWidth;
        }
        if(typeof this.state.boardConfigData.trackWidth === "number"){
            out.trackWidth = this.state.boardConfigData.trackWidth;
        }
        if(typeof this.state.boardConfigData.elementClickCallBack === "function"){
            out.elementClickCallBack = this.state.boardConfigData.elementClickCallBack;
        }
        return out;
    }

    addRow(configRow: RcsbFvRowConfigInterface): void{
        const rowConfigData: Array<RcsbFvRowConfigInterface> = this.state.rowConfigData;
        rowConfigData.push(configRow);
        this.setState({rowConfigData: rowConfigData, boardConfigData:this.state.boardConfigData} as RcsbFvBoardState);
        //this.setScale();
    }

    componentDidMount(): void {
        this.subscription = this.subscribe();
    }

    componentWillUnmount(): void {
        console.warn("Component RcsbFvBoard unmount");
    }

    private subscribe(): Subscription{
        return RcsbFvContextManager.asObservable().subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EVENT_TYPE.ADD_TRACK){
                this.addRow(obj.eventData as RcsbFvRowConfigInterface);
            }else if(obj.eventType===EVENT_TYPE.SCALE){
                this.currentScale = obj.eventData as ScaleTransformInterface;
            }
        });
    }

    unsubscribe(): void{
        this.subscription.unsubscribe();
    }

    setScale(){
        if(this.currentScale!=null) {
            RcsbFvContextManager.next({
                eventType: EVENT_TYPE.SCALE,
                eventData: this.currentScale
            } as RcsbFvContextManagerInterface);
        }
    }

}