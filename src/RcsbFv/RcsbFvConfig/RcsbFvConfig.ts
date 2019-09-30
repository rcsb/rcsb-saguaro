import {DISPLAY_TYPES, INTERPOLATION_TYPES, RcsbFvDefaultConfigValues} from './RcsbFvDefaultConfigValues';
import {RcsbFvDisplayConfigInterface, RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import {RcsbFvTrackData, RcsbFvTrackDataArray, RcsbFvDataManager} from "../RcsbFvDataManager/RcsbFvDataManager";

export class RcsbFvConfig implements RcsbFvRowConfigInterface{
    displayType: string | Array<string>;
    length: number;
    elementId?: string;
    trackData?: string | RcsbFvTrackData | RcsbFvTrackDataArray;
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    trackHeight?: number;
    trackColor?: string;
    displayColor?: string;
    displayDomain?: [number,number];
    interpolationType? : string;

    constructor(args:RcsbFvRowConfigInterface) {

        //external config
        if(typeof args.length === "number"){
            this.length = args.length;
        }
        if(typeof args.displayType === "string" || typeof args.displayType === "object"){
            this.displayType = args.displayType;
        }else{
            throw "Fatal error: Display type not found";
        }
        if(typeof args.elementId === "string") {
            this.elementId = args.elementId;
        }
        if(typeof args.trackData  !== "undefined") {
            this.trackData = RcsbFvDataManager.processData(args.trackData);
        }
        if(args.displayConfig instanceof Array) {
            this.displayConfig = args.displayConfig;
        }

        //default config available
        if(typeof args.trackHeight === "number"){
            this.trackHeight = args.trackHeight;
        }else{
            if(this.displayType === DISPLAY_TYPES.AXIS){
                this.trackHeight = RcsbFvDefaultConfigValues.trackAxisHeight;
            }else {
                this.trackHeight = RcsbFvDefaultConfigValues.trackHeight;
            }
        }
        if( typeof args.trackColor === "string"){
            this.trackColor = args.trackColor;
        }else{
            this.trackColor = RcsbFvDefaultConfigValues.trackColor;
        }
        if(typeof args.displayColor === "string"){
            this.displayColor = args.displayColor;
        }else{
            this.displayColor = RcsbFvDefaultConfigValues.displayColor;
        }
        if(args.displayDomain instanceof Array){
            this.displayDomain = args.displayDomain;
        }else{
            this.displayDomain = RcsbFvDefaultConfigValues.displayDomain;
        }
        if(typeof args.interpolationType === "string"){
            this.interpolationType = this.getInterpolationType(args.interpolationType);
        }else{
            this.interpolationType = RcsbFvDefaultConfigValues.interpolationType;
        }
    }

    configCheck() : boolean{
        if(typeof this.length === "number" && typeof this.elementId === "string"){
            return true;
        }
        return false;
    }

    getInterpolationType(type: string): string{
        switch (type) {
            case INTERPOLATION_TYPES.STEP: {
                return INTERPOLATION_TYPES.STEP;
            }
            case INTERPOLATION_TYPES.BASIS: {
                return INTERPOLATION_TYPES.BASIS;
            }
            case INTERPOLATION_TYPES.CARDINAL: {
                return INTERPOLATION_TYPES.CARDINAL;
            }
            case INTERPOLATION_TYPES.LINEAR: {
                return INTERPOLATION_TYPES.LINEAR;
            }
            default: {
                return INTERPOLATION_TYPES.STEP;
            }
        }
    }





}
