export interface RcsbFvBoardConfigInterface {
    length: number;
    rowTitleWidth?: number;
    trackWidth?: number;
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
    trackData?: any;
    displayDomain?: Array<number>;
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    trackWidth?: number;
    rowTitleWidth?: number;
}
