import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "./RcsbFvDataManager/RcsbFvDataManager";

export interface RcsbFvBoardConfigInterface {
    length: number;
    rowTitleWidth?: number;
    trackWidth?: number;
    includeAxis?: boolean;
    elementClickCallBack:()=>void;
}

export interface RcsbFvDisplayConfigInterface{
    displayColor: string;
    interpolationType?: string;
    displayData?: string | RcsbFvTrackData;
    displayType: string;
    displayId?: string;
    dynamicDisplay?: boolean;
    elementClickCallBack:()=>void;
}

export interface RcsbFvRowConfigInterface {
    trackId: string;
    displayType: string;
    length? : number;
    elementId?:string;
    trackHeight?: number;
    trackColor?: string;
    displayColor?: string;
    rowTitle?: string;
    trackData?: string | RcsbFvTrackData;
    displayDomain?: [number,number];
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    trackWidth?: number;
    rowTitleWidth?: number;
    interpolationType?: string;
    isAxis?: boolean;
    dynamicDisplay?: boolean;
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
}
