import {
    RcsbFvColorGradient,
    RcsbFvTrackData,
    RcsbFvTrackDataElementInterface
} from "../../RcsbDataManager/RcsbDataManager";
import {LocationViewInterface} from "../../RcsbBoard/RcsbBoard";
import {RcsbFvDisplayTypes} from "./RcsbFvDefaultConfigValues";
import * as React from "react";
import {SelectionInterface} from "../../RcsbBoard/RcsbSelection";

/** Main PFV board configuration */
export interface RcsbFvBoardConfigInterface {
    /**Length of the board. If <length> is provided the board track coordinates will range from 1 to <length>*/
    length? : number;
    /**Range of the board. If <range> is provided the board track coordinates will range from <min> to <max>*/
    range?:{
        min:number;
        max:number;
    };
    /**Width of the track title cells*/
    rowTitleWidth?: number;
    /**Width of the track annotation cells*/
    trackWidth?: number;
    /**Include axis track. It will be displayed in the first board track*/
    includeAxis?: boolean;
    /**Show tooltip when hovering track annotations*/
    includeTooltip?: boolean;
    /**Function that will be called when a track annotation is clicked*/
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void;
    /**Function that will be called when hovering a track annotation*/
    elementEnterCallBack?:(d?:RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void;
    /**Function that will be called when mouse-leaving a track annotation*/
    elementLeaveCallBack?:(d?:RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void;
    /**Function that will be called when selection changes*/
    selectionChangeCallBack?:(selection: Array<SelectionInterface>)=>void;
    /**Feature cells border color*/
    borderColor?: string;
    /**Feature cells border width*/
    borderWidth?: number;
    /**Hide all row bottom border except for the last one*/
    hideInnerBorder?:boolean;
    /**Hide PFV tracks main frame border glow*/
    hideTrackFrameGlow?: boolean;
    /**Set highlight hover position*/
    highlightHoverPosition?:boolean;
    /**Set highlight hover track elements*/
    highlightHoverElement?:boolean;
    /**Function call on hover event*/
    highlightHoverCallback?:(n:Array<RcsbFvTrackDataElementInterface>)=>void;
    /**Hide row hover glow*/
    hideRowGlow?: boolean;
}

//TODO Create additionalConfig to encode display type specific configuration
interface CommonConfigInterface{
    /**Annotation elements color*/
    displayColor?: string | RcsbFvColorGradient;
    /**Type of data representation*/
    displayType: RcsbFvDisplayTypes;
    /**Type of data representation*/
    dynamicDisplay?: boolean;
    /**Flag used in sequence display type to force displaying a line when sequence objects are not visible*/
    nonEmptyDisplay?: boolean;
    /**Function that will be called when annotations in this track are clicked*/
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void;
    /**Function that will be called when clicking annotations in this track*/
    elementEnterCallBack?:(d?:RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void;
    /**Function that will be called when mouse-leaving a track annotation*/
    elementLeaveCallBack?:(d?:RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void;
    /**Show tooltip when hovering annotations in this specific track*/
    includeTooltip?: boolean;
    /**Function that will be called to update track displayed data when the board is moved or zoomed*/
    updateDataOnMove?: (d:LocationViewInterface)=>Promise<RcsbFvTrackData>;
    /**Residue density threshold used to display/hide annotations*/
    minRatio?:number;
    /**Only data that fall in the current feature viewer range in rendered*/
    selectDataInRangeFlag?: boolean;
    /**Hide tracks with no visible data*/
    hideEmptyTrackFlag?: boolean;
}

/**Display config object for composite displays*/
export interface RcsbFvDisplayConfigInterface extends CommonConfigInterface{
    /**Data structure containing the annotations for the display*/
    displayData?: RcsbFvTrackData;
    /**Id used to identify the display*/
    displayId?: string;
}

export interface RcsbFvLink {
    visibleTex: string;
    url?: string;
    style?:React.CSSProperties;
    isThirdParty?:boolean;
}

/**
 * Board track configuration object
 */
export interface RcsbFvRowConfigInterface extends CommonConfigInterface{
    /**DOM element Id where the PFV will be rendered*/
    boardId?: string;
    /**Id used to identify the board track*/
    trackId: string;
    /**Length of the track. If length is provided the track coordinates will range from 1 to <length>*/
    length? : number;
    /**Range of the track. If range is provided the track coordinates will range from <min> to <max>*/
    range?:{
        min:number;
        max:number;
    };
    /**DOM element Id where the board track is displayed*/
    elementId?:string;
    /**Full length of the track*/
    trackHeight?: number;
    /**Background color of the track*/
    trackColor?: string;
    /**Row title text or link*/
    rowTitle?: string|RcsbFvLink;
    /**Row title txt prefix*/
    rowPrefix?: string;
    /**Compute the title/prefix width based on the relative proportion length*/
    fitTitleWidth?: boolean;
    /**Color displayed between track title and track annotations*/
    titleFlagColor?: string;
    /**Data structure containing the annotations*/
    trackData?: RcsbFvTrackData;
    /**Y scale domain range*/
    displayDomain?: [number,number];
    /**Array of display configurations in composite displays*/
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    /**Full length of the track*/
    trackWidth?: number;
    /**Length of the track title cell*/
    rowTitleWidth?: number;
    /**Interpolation type for sequence scalar annotations*/
    interpolationType?: string;
    /**If true, track annotations can overlap*/
    overlap?:boolean;
    /**The track must dbe hide*/
    trackVisibility?:boolean;
    /**Sequence feature cell Border color*/
    borderColor?:string;
    /**Feature cell border width*/
    borderWidth?: number;
    /**Set highlight hover position*/
    highlightHoverPosition?:boolean;
    /**Set highlight hover track elements*/
    highlightHoverElement?:boolean;
    /**Function call on hover event*/
    highlightHoverCallback?:(n:Array<RcsbFvTrackDataElementInterface>)=>void;
    /**Hide bottom border (last row is ignored)*/
    hideInnerBorder?:boolean;
    /**Hide row hover glow*/
    hideRowGlow?: boolean;
}
