import {RcsbFvConstants} from '../RcsbFvConstants/RcsbFvConstants';
import {RcsbFvDefaultConfigValues, DISPLAY_TYPES} from './RcsbFvDefaultConfigValues';
import {RcsbFvDisplayConfigInterface, RcsbFvRowConfigInterface} from "../RcsbFvInterface";

export class RcsbFvConfig implements RcsbFvRowConfigInterface{
    displayType: string | Array<string>;
    length: number;
    elementId?: string;
    trackData?: any;
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    trackHeight?: number;
    trackColor?: string;
    displayColor?: string;
    displayDomain?: Array<number>;

    constructor(args:RcsbFvRowConfigInterface) {

        //external config
        if(typeof args.length === "number"){
            this.length = args.length;
        }
        if(typeof args.displayType === "string" || typeof args.displayType === "object"){
            this.displayType = args.displayType;
        }else{
            console.error(args);
            throw "Fatal error: Display type not found";
        }
        if(typeof args.elementId === "string") {
            this.elementId = args.elementId;
        }
        if(typeof args.trackData  !== null) {
            this.trackData = args.trackData;
        }
        if(args.displayConfig instanceof Array) {
            this.displayConfig = args.displayConfig;
        }

        //default config available
        if(typeof args.trackHeight === "number"){
            this.trackHeight = args.trackHeight;
        }else{
            this.trackHeight = RcsbFvDefaultConfigValues.trackHeight;
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
    }

    configCheck() : boolean{
        if(typeof this.length === "number" && typeof this.elementId === "string"){
            return true;
        }
        return false;
    }

}
