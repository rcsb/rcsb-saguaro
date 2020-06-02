import {RcsbFvDisplayTypes, InterpolationTypes, RcsbFvDefaultConfigValues} from './RcsbFvDefaultConfigValues';
import {RcsbFvDisplayConfigInterface, RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import {
    RcsbFvTrackData,
    RcsbDataManager,
    RcsbFvTrackDataElementInterface
} from "../../RcsbDataManager/RcsbDataManager";
import {LocationViewInterface} from "../../RcsbBoard/RcsbBoard";

export class RcsbFvConfig implements RcsbFvRowConfigInterface{
    trackId: string;
    boardId: string;
    displayType: string;
    length: number;
    elementId?: string;
    trackData?: RcsbFvTrackData;
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    trackHeight?: number;
    trackWidth?: number;
    trackColor?: string;
    displayColor?: string;
    displayDomain?: [number,number];
    interpolationType? : string;
    dynamicDisplay?: boolean;
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
    elementEnterCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
    includeTooltip?: boolean;
    updateDataOnMove?:(d:LocationViewInterface)=>Promise<RcsbFvTrackData>;
    overlap:boolean = false;

    constructor(args:RcsbFvRowConfigInterface) {
        this.updateConfig(args);
    }

    public updateConfig(args:RcsbFvRowConfigInterface) {

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
        if(typeof args.trackData  !== "undefined") {
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
        if(typeof args.trackWidth === "number"){
            this.trackWidth = args.trackWidth;
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
        }else if(typeof this.trackColor !== "string"){
            this.trackColor = RcsbFvDefaultConfigValues.trackColor;
        }
        if(typeof args.displayColor === "string"){
            this.displayColor = args.displayColor;
        }else if(this.displayColor !== "string"){
            this.displayColor = RcsbFvDefaultConfigValues.displayColor;
        }
        if(args.displayDomain instanceof Array){
            this.displayDomain = args.displayDomain;
        }else if( !(this.displayDomain instanceof Array) ){
            this.displayDomain = RcsbFvDefaultConfigValues.displayDomain;
        }
        if(typeof args.interpolationType === "string"){
            this.interpolationType = this.getInterpolationType(args.interpolationType);
        }else if(this.interpolationType !== "string"){
            this.interpolationType = RcsbFvDefaultConfigValues.interpolationType;
        }
        if(typeof args.includeTooltip === "boolean"){
            this.includeTooltip = args.includeTooltip;
        }else{
            this.includeTooltip = true;
        }
        this.overlap = args.overlap === true;
    }

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

    resetTrackData(): void {
        this.trackData = undefined;
    }

    addTrackData( data: RcsbFvTrackData ): void {
        if(typeof this.trackData === "undefined"){
            this.trackData = new RcsbFvTrackData();
        }
        (RcsbDataManager.processData(data) as RcsbFvTrackData).forEach(d=>{
            (this.trackData as RcsbFvTrackData).push(d);
        });
    }

    updateTrackData(data: RcsbFvTrackData):void{
        this.trackData = RcsbDataManager.processData(data);
    }

}
