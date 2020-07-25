import {RcsbFvDisplayTypes, InterpolationTypes, RcsbFvDefaultConfigValues} from './RcsbFvDefaultConfigValues';
import {RcsbFvDisplayConfigInterface, RcsbFvRowConfigInterface} from "./RcsbFvConfigInterface";
import {
    RcsbFvTrackData,
    RcsbDataManager,
    RcsbFvTrackDataElementInterface, RcsbFvColorGradient
} from "../../RcsbDataManager/RcsbDataManager";
import {LocationViewInterface} from "../../RcsbBoard/RcsbBoard";

/**Board track configuration manager class*/
export class RcsbFvConfig implements RcsbFvRowConfigInterface{
    trackId: string;
    boardId: string;
    displayType: RcsbFvDisplayTypes;
    length: number;
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
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
    elementEnterCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
    includeTooltip?: boolean;
    updateDataOnMove?:(d:LocationViewInterface)=>Promise<RcsbFvTrackData>;
    overlap:boolean = false;
    minRatio?:number;

    constructor(args:RcsbFvRowConfigInterface) {
        this.updateConfig(args);
    }

    /**Update board track configuration. This method sets some attributes to default values when configuration values are not available.
     * @param args Board track configuration object
     * */
    public updateConfig(args:RcsbFvRowConfigInterface): void {

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

        //default config available
        if(typeof args.trackHeight === "number"){
            this.trackHeight = args.trackHeight;
        }else if(typeof this.displayType === "string"){
            if(this.displayType === RcsbFvDisplayTypes.AXIS){
                this.trackHeight = RcsbFvDefaultConfigValues.trackAxisHeight;
            }else {
                this.trackHeight = RcsbFvDefaultConfigValues.trackHeight;
            }
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
        this.overlap = args.overlap === true;
    }

    /**Check if sequence length and DOM element Id are available
     * @return boolean
     * */
    configCheck() : boolean{
        return (typeof this.length === "number" && typeof this.elementId === "string")
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
