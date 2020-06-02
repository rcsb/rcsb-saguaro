import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../RcsbDataManager/RcsbDataManager";
import {LocationViewInterface} from "../RcsbBoard/RcsbBoard";

export interface RcsbFvBoardConfigInterface {
    elementId: string;
    length: number;
    rowTitleWidth?: number;
    trackWidth?: number;
    includeAxis?: boolean;
    includeTooltip?: boolean;
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
    elementEnterCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
}

interface CommonConfigInterface{
    displayColor?: string;
    displayType: string;
    dynamicDisplay?: boolean;
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
    elementEnterCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
    includeTooltip?: boolean;
    updateDataOnMove?: (d:LocationViewInterface)=>Promise<RcsbFvTrackData>;
}

export interface RcsbFvDisplayConfigInterface extends CommonConfigInterface{
    displayData?: RcsbFvTrackData;
    displayId?: string;
}

export interface RcsbFvRowConfigInterface extends CommonConfigInterface{
    boardId?: string;
    trackId: string;
    length? : number;
    elementId?:string;
    trackHeight?: number;
    trackColor?: string;
    rowTitle?: string;
    titleFlagColor?: string;
    trackData?: RcsbFvTrackData;
    displayDomain?: [number,number];
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    trackWidth?: number;
    rowTitleWidth?: number;
    interpolationType?: string;
    isAxis?: boolean;
    overlap?:boolean;
}
