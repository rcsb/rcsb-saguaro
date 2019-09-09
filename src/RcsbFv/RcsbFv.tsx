import * as React from "react";
import * as ReactDom from "react-dom";
import RcsbFvBoard from "./RcsbFvBoard/RcsbFvBoard";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "./RcsbFvInterface";
import {DISPLAY_TYPES} from "./RcsbFvConfig/RcsbFvDefaultConfigValues";

export default class RcsbFv {
    rowConfigData: Array<RcsbFvRowConfigInterface>;
    boardConfigData: RcsbFvBoardConfigInterface;
    elementId: string;

    constructor(rowConfigData: Array<RcsbFvRowConfigInterface>, boardConfigData: RcsbFvBoardConfigInterface, elementId: string){
        this.rowConfigData = rowConfigData;
        this.boardConfigData = boardConfigData;
        this.elementId = elementId;
        this.init();
    }

    private init(){
        ReactDom.render(
            <RcsbFvBoard rowConfigData={this.rowConfigData} boardConfigData={this.boardConfigData} />,
            document.getElementById(this.elementId)
        );
    }
}