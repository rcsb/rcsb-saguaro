import {RcsbFvDisplayTypes, InterpolationTypes, RcsbFvDefaultConfigValues} from './RcsbFvDefaultConfigValues';
import {RcsbFvDisplayConfigInterface, RcsbFvRowExtendedConfigInterface} from "./RcsbFvConfigInterface";
import {
    RcsbFvTrackData,
    RcsbDataManager,
    RcsbFvTrackDataElementInterface, RcsbFvColorGradient
} from "../../RcsbDataManager/RcsbDataManager";
import {LocationViewInterface} from "../../RcsbBoard/RcsbBoard";
import {RcsbFvTooltipInterface} from "../RcsbFvTooltip/RcsbFvTooltipInterface";

/**Board track configuration manager className*/
export class RcsbFvConfig implements RcsbFvRowExtendedConfigInterface{
    trackId: string;
    boardId: string;
    displayType: RcsbFvDisplayTypes;
    length: number;
    range: {
        min: number;
        max:number;
    };
    elementId?: string;
    trackData?: RcsbFvTrackData;
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    trackHeight?: number;
    trackWidth?: number;
    trackColor?: string;
    displayColor?: string | RcsbFvColorGradient;
    displayDomain?: [number,number];
    interpolationType? : string;
    dynamicDisplay?: boolean;
    nonEmptyDisplay?: boolean;
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void;
    elementEnterCallBack?:(d?:RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void;
    elementLeaveCallBack?:(d?:RcsbFvTrackDataElementInterface, e?: MouseEvent)=>void;
    includeTooltip?: boolean;
    updateDataOnMove?:(d:LocationViewInterface)=>Promise<RcsbFvTrackData>;
    overlap:boolean = false;
    minRatio?:number;
    selectDataInRangeFlag?: boolean;
    hideEmptyTrackFlag?: boolean;
    highlightHoverPosition?:boolean;
    highlightHoverElement?:boolean;
    highlightHoverCallback?:(n:Array<RcsbFvTrackDataElementInterface>)=>void;
    hideInnerBorder?:boolean;
    hideRowGlow?:boolean;
    tooltipGenerator?: RcsbFvTooltipInterface;

    constructor(args:RcsbFvRowExtendedConfigInterface) {
        this.updateConfig(args);
    }

    /**Update board track configuration. This method sets some attributes to default values when configuration values are not available.
     * @param args Board track configuration object
     * */
    public updateConfig(args:RcsbFvRowExtendedConfigInterface): void {

        //external config
        if(typeof args.trackId === "string" ) {
            this.trackId = args.trackId;
        }
        if(typeof args.boardId === "string"){
            this.boardId = args.boardId;
        }
        if(typeof args.length === "number"){
            this.length = args.length;
        }
        if(typeof args.range === "object" && typeof args.range.min === "number" && typeof args.range.max === "number"){
            this.range = args.range;
        }
        if(typeof args.displayType === "string" ){
            this.displayType = args.displayType;
        }else{
            throw "Fatal error: Display type not found";
        }
        if(typeof args.elementId === "string") {
            this.elementId = args.elementId;
        }
        if(typeof args.trackData  != "undefined") {
            this.trackData = RcsbDataManager.processData(args.trackData);
        }
        if(args.displayConfig instanceof Array) {
            this.displayConfig = args.displayConfig;
        }
        if(typeof args.elementClickCallBack === "function"){
            this.elementClickCallBack = args.elementClickCallBack;
        }
        if(typeof args.elementEnterCallBack === "function"){
            this.elementEnterCallBack = args.elementEnterCallBack;
        }
        if(typeof args.elementLeaveCallBack === "function"){
            this.elementLeaveCallBack = args.elementLeaveCallBack;
        }
        if(typeof args.updateDataOnMove === "function"){
            this.updateDataOnMove = args.updateDataOnMove;
        }
        if(typeof args.dynamicDisplay === "boolean"){
            this.dynamicDisplay = args.dynamicDisplay;
        }
        if(typeof args.nonEmptyDisplay === "boolean"){
            this.nonEmptyDisplay = args.nonEmptyDisplay;
        }
        if(typeof args.trackWidth === "number"){
            this.trackWidth = args.trackWidth;
        }
        if(typeof args.minRatio === "number"){
            this.minRatio = args.minRatio;
        }
        if(typeof args.selectDataInRangeFlag === "boolean"){
            this.selectDataInRangeFlag = args.selectDataInRangeFlag;
        }
        if(typeof args.hideEmptyTrackFlag === "boolean"){
            this.hideEmptyTrackFlag = args.hideEmptyTrackFlag;
        }
        if(typeof args.highlightHoverPosition === "boolean"){
            this.highlightHoverPosition = args.highlightHoverPosition;
        }
        if(typeof args.highlightHoverElement === "boolean"){
            this.highlightHoverElement = args.highlightHoverElement;
        }
        if(typeof args.highlightHoverCallback === "function"){
            this.highlightHoverCallback = args.highlightHoverCallback;
        }

        //default config available
        if(typeof args.trackHeight === "number"){
            this.trackHeight = args.trackHeight;
        }else if(this.displayType === RcsbFvDisplayTypes.AXIS){
            this.trackHeight = RcsbFvDefaultConfigValues.trackAxisHeight;
        }else {
            this.trackHeight = RcsbFvDefaultConfigValues.trackHeight;
        }

        if( typeof args.trackColor === "string"){
            this.trackColor = args.trackColor;
        }else if(typeof this.trackColor != "string"){
            this.trackColor = RcsbFvDefaultConfigValues.trackColor;
        }
        if(typeof args.displayColor === "string" || (args.displayColor != null && typeof args.displayColor === "object")){
            this.displayColor = args.displayColor;
        }else if(this.displayColor == null){
            this.displayColor = RcsbFvDefaultConfigValues.displayColor;
        }
        if(args.displayDomain instanceof Array){
            this.displayDomain = args.displayDomain;
        }else if( !(this.displayDomain instanceof Array) ){
            this.displayDomain = RcsbFvDefaultConfigValues.displayDomain;
        }
        if(typeof args.interpolationType === "string"){
            this.interpolationType = this.getInterpolationType(args.interpolationType);
        }else if(typeof this.interpolationType != "string"){
            this.interpolationType = RcsbFvDefaultConfigValues.interpolationType;
        }
        if(typeof args.includeTooltip === "boolean"){
            this.includeTooltip = args.includeTooltip;
        }else{
            this.includeTooltip = true;
        }
        if(typeof args.hideInnerBorder === "boolean"){
            this.hideInnerBorder = args.hideInnerBorder;
        }else{
            this.hideInnerBorder = RcsbFvDefaultConfigValues.hideInnerBorder;
        }
        if(typeof args.hideRowGlow === "boolean"){
            this.hideRowGlow = args.hideRowGlow;
        }else{
            this.hideRowGlow = RcsbFvDefaultConfigValues.hideRowGlow;
        }
        if(typeof args.tooltipGenerator === "object")
            this.tooltipGenerator = args.tooltipGenerator;
        this.overlap = args.overlap === true;
    }

    /**Check if sequence length and DOM element Id are available
     * @return boolean
     * */
    configCheck() : boolean{
        return ( (typeof this.length === "number" || typeof this.range === "object") && typeof this.elementId === "string")
    }

    getInterpolationType(type: string): string{
        switch (type) {
            case InterpolationTypes.STEP: {
                return InterpolationTypes.STEP;
            }
            case InterpolationTypes.BASIS: {
                return InterpolationTypes.BASIS;
            }
            case InterpolationTypes.CARDINAL: {
                return InterpolationTypes.CARDINAL;
            }
            case InterpolationTypes.LINEAR: {
                return InterpolationTypes.LINEAR;
            }
            default: {
                return InterpolationTypes.STEP;
            }
        }
    }

    /**Deletes board track annotation data*/
    resetTrackData(): void {
        this.trackData = undefined;
    }

    /**Load board track annotation data
     * @param data New board track annotation data
     * */
    addTrackData( data: RcsbFvTrackData ): void {
        if(typeof this.trackData === "undefined"){
            this.trackData = new RcsbFvTrackData();
        }
        (RcsbDataManager.processData(data) as RcsbFvTrackData).forEach(d=>{
            (this.trackData as RcsbFvTrackData).push(d);
        });
    }

    /**Load board track annotation data
     * @param data New board track annotation data
     * */
    updateTrackData(data: RcsbFvTrackData):void{
        this.trackData = RcsbDataManager.processData(data);
    }

}
