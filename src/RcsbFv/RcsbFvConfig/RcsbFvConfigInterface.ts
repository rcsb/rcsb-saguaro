import {RcsbFvTrackData, RcsbFvTrackDataElementInterface} from "../../RcsbDataManager/RcsbDataManager";
import {LocationViewInterface} from "../../RcsbBoard/RcsbBoard";
import {RcsbFvDisplayTypes} from "./RcsbFvDefaultConfigValues";

/** Main PFV board configuration */
export interface RcsbFvBoardConfigInterface {
    /**Length of the sequence*/
    length: number;
    /**Width of the row title cells*/
    rowTitleWidth?: number;
    /**Full length of the board*/
    trackWidth?: number;
    /**Include axis row. It will be displayed in the first board row*/
    includeAxis?: boolean;
    /**Show tooltip when hovering row annotations*/
    includeTooltip?: boolean;
    /**Function that will be called when a row annotation is clicked*/
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
    /**Function that will be called when hovering a row annotation*/
    elementEnterCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
}

//TODO Create additionalConfig to encode display type specific configuration
interface CommonConfigInterface{
    /**Annotation elements color*/
    displayColor?: string;
    /**Type of data representation*/
    displayType: RcsbFvDisplayTypes;
    /**Type of data representation*/
    dynamicDisplay?: boolean;
    nonEmptyDisplay?: boolean;
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
    /**DOM element Id where the PFV will is displayed*/
    boardId?: string;
    /**Id used to identify the board row*/
    trackId: string;
    /**Length of the sequence*/
    length? : number;
    /**DOM element Id where the row is displayed*/
    elementId?:string;
    /**Full length of the row*/
    trackHeight?: number;
    /**Background color of the row*/
    trackColor?: string;
    /**Row title text*/
    rowTitle?: string;
    /**Row title txt prefix*/
    rowPrefix?: string;
    /**Color displayed between row title and row annotations*/
    titleFlagColor?: string;
    /**Data structure containing the annotations*/
    trackData?: RcsbFvTrackData;
    /**Y scale domain range*/
    displayDomain?: [number,number];
    /**Array of display configurations in composite displays*/
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    /**Full length of the row*/
    trackWidth?: number;
    /**Length of the row title cell*/
    rowTitleWidth?: number;
    /**Interpolation type for sequence scalar annotations*/
    interpolationType?: string;
    /**Identifies the track as type axis*/
    isAxis?: boolean;
    /**If true, row annotations can overlap*/
    overlap?:boolean;
}
