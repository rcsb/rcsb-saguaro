import {RcsbFvTrackData, RcsbFvTrackDataArray} from "./RcsbFvDataManager/RcsbFvDataManager";

export interface RcsbFvBoardConfigInterface {
    length: number;
    rowTitleWidth?: number;
    trackWidth?: number;
    includeAxis?: boolean;
}

export interface RcsbFvDisplayConfigInterface{
    displayColor: string;
}

export interface RcsbFvRowConfigInterface {
    displayType: string | Array<string>;
    length? : number;
    elementId?:string;
    trackHeight?: number;
    trackColor?: string;
    displayColor?: string;
    rowTitle?: string;
    trackData?: string | RcsbFvTrackData | RcsbFvTrackDataArray;
    displayDomain?: [number,number];
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    trackWidth?: number;
    rowTitleWidth?: number;
    interpolationType?: string;
    isAxis?: boolean;
}
