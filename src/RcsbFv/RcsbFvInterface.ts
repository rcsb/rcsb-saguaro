import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "./RcsbFvDataManager/RcsbFvDataManager";
import {LocationViewInterface} from "../RcsbBoard/RcsbBoard";

export interface RcsbFvBoardConfigInterface {
    elementId: string;
    length: number;
    rowTitleWidth?: number;
    trackWidth?: number;
    includeAxis?: boolean;
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
}

interface CommonConfigInterface{
    displayColor?: string;
    displayType: string;
    dynamicDisplay?: boolean;
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
    updateDataOnMove?: (d:LocationViewInterface)=>Promise<RcsbFvTrackData>;
}

export interface RcsbFvDisplayConfigInterface extends CommonConfigInterface{
    displayData?: RcsbFvTrackData;
    displayId?: string;
}

export interface RcsbFvRowConfigInterface extends CommonConfigInterface{
    trackId: string;
    length? : number;
    elementId?:string;
    trackHeight?: number;
    trackColor?: string;
    rowTitle?: string;
    trackData?: RcsbFvTrackData;
    displayDomain?: [number,number];
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    trackWidth?: number;
    rowTitleWidth?: number;
    interpolationType?: string;
    isAxis?: boolean;
    overlap?:boolean;
}
