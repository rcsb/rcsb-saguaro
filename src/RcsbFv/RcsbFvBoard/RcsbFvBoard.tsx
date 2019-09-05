import * as React from "react";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import RcsbFvRow from "../RcsbFvRow/RcsbFvRow";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "../RcsbFvInterface";

interface RcsbFvBoardInterface {
    rowConfigData: Array<RcsbFvRowConfigInterface>;
    boardConfigData: RcsbFvBoardConfigInterface;
}

interface RcsbFvBoardStyleInterface{
    width: number;
}

export default class RcsbFvBoard extends React.Component <RcsbFvBoardInterface, {}> {

    rowConfigData : Array<RcsbFvRowConfigInterface>;
    boardConfigData : RcsbFvBoardConfigInterface;
    boardId : string = "RcsbFvBoard_"+Math.trunc(Math.random()*1000000);
    rcsbFvRowArrayIds : Array<string> = new Array<string>();

    constructor(props: RcsbFvBoardInterface) {
        super(props);
        this.rowConfigData = this.props.rowConfigData;
        this.boardConfigData = this.props.boardConfigData;
    }

    render(){
        return (
            <div id={this.boardId}>
                {
                    this.rowConfigData.map(rowData=>{
                        const rowId: string = "RcsbFvRow_"+Math.trunc(Math.random()*1000000)
                        this.rcsbFvRowArrayIds.push(rowId);
                        return (<RcsbFvRow key={rowId} id={rowId} data={this.configRow(rowId,rowData)} />);
                    })
                }
            </div>
        );
    }

    configStyle() : RcsbFvBoardStyleInterface {
        let titleWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.boardConfigData.rowTitleWidth === "number"){
            titleWidth = this.boardConfigData.rowTitleWidth;
        }

        let trackWidth : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.boardConfigData.trackWidth === "number"){
            trackWidth = this.boardConfigData.trackWidth;
        }

        return {
            width: (titleWidth+trackWidth)
        };
    }

    configRow(id:string, config: RcsbFvRowConfigInterface) : RcsbFvRowConfigInterface{
        const out: RcsbFvRowConfigInterface = Object.assign({},config);
        out.elementId = id;
        if(typeof this.boardConfigData.length === "number"){
            out.length = this.boardConfigData.length;
        }
        if(typeof this.boardConfigData.rowTitleWidth === "number"){
            out.rowTitleWidth = this.boardConfigData.rowTitleWidth;
        }
        if(typeof this.boardConfigData.length === "number"){
            out.trackWidth = this.boardConfigData.trackWidth;
        }
        return out;
    }

}