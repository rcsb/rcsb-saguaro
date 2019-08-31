import * as React from "react";
import {RcsbFvConstants} from "../RcsbFvConstants/RcsbFvConstants";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import RcsbFvRow from "../RcsbFvRow/RcsbFvRow";

interface RcsbFvBoardInterface {
    rowConfigData: Array<any>;
    boardConfigData: Map<string,any>;
}

export default class RcsbFvBoard extends React.Component <RcsbFvBoardInterface, {}> {

    rowConfigData : Array<any> = null;
    boardConfigData : Map<string,any> = new Map();
    boardId : string = "RcsbFvBoard_"+Math.trunc(Math.random()*1000);
    rcsbFvRowArrayIds : Array<string> = new Array<string>();

    constructor(props: RcsbFvBoardInterface) {
        super(props);
        this.rowConfigData = this.props.rowConfigData;
        if(typeof this.props.boardConfigData === "object") {
            this.boardConfigData = new Map(Object.entries(this.props.boardConfigData));
        }
    }

    render(){
        return (
            <div id={this.boardId}>
                {
                    this.rowConfigData.map(rowData=>{
                        const rowId: string = "RcsbFvRow_"+Math.trunc(Math.random()*1000)
                        this.rcsbFvRowArrayIds.push(rowId);
                        const data: Map<string, any>= new Map(Object.entries(rowData));
                        return (<RcsbFvRow key={rowId} id={rowId} data={this.configRow(rowId,data)} />);
                    })
                }
            </div>
        );
    }

    configStyle() : any {
        let titleWidth : number = RcsbFvDefaultConfigValues.ROW_TITLE_WIDTH;
        if(this.boardConfigData.has(RcsbFvConstants.ROW_TITLE_WIDTH)){
            titleWidth = this.boardConfigData.get(RcsbFvConstants.ROW_TITLE_WIDTH);
        }

        let trackWidth : number = RcsbFvDefaultConfigValues.TRACK_WIDTH;
        if(this.boardConfigData.has(RcsbFvConstants.TRACK_WIDTH)){
            trackWidth = this.boardConfigData.get(RcsbFvConstants.TRACK_WIDTH);
        }

        return {
            width: (titleWidth+trackWidth),
        };
    }

    configRow(id:string, config: Map<string,any>) : Map<string,any>{
        const out : Map<string,any> = new Map(config);
        out.set( RcsbFvConstants.ELEMENT_ID, id);
        out.set( RcsbFvConstants.MASTER_BOARD_ID, this.boardId);
        this.boardConfigData.forEach((v,k)=>{
           out.set(k,v);
        });
        return out;
    }

}