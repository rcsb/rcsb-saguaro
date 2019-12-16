import {DISPLAY_TYPES, INTERPOLATION_TYPES, RcsbFvDefaultConfigValues} from './RcsbFvDefaultConfigValues';
import {RcsbFvDisplayConfigInterface, RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import {RcsbFvTrackData, RcsbFvDataManager} from "../RcsbFvDataManager/RcsbFvDataManager";

export class RcsbFvConfig implements RcsbFvRowConfigInterface{
    trackId: string;
    displayType: string;
    length: number;
    elementId?: string;
    trackData?: string | RcsbFvTrackData;
    displayConfig?: Array<RcsbFvDisplayConfigInterface>;
    trackHeight?: number;
    trackColor?: string;
    displayColor?: string;
    displayDomain?: [number,number];
    interpolationType? : string;

    constructor(args:RcsbFvRowConfigInterface) {
        this.updateConfig(args);
    }

    public updateConfig(args:RcsbFvRowConfigInterface) {

        //external config
        if(typeof args.trackId === "string" ) {
            this.trackId = args.trackId;
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
            this.trackData = RcsbFvDataManager.processData(args.trackData);
        }
        if(args.displayConfig instanceof Array) {
            this.displayConfig = args.displayConfig;
        }

        //default config available
        if(typeof args.trackHeight === "number"){
            this.trackHeight = args.trackHeight;
        }else if(typeof this.displayType === "string"){
            if(this.displayType === DISPLAY_TYPES.AXIS){
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
    }

    configCheck() : boolean{
        return (typeof this.length === "number" && typeof this.elementId === "string")
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

    resetTrackData(): void {
        this.trackData = undefined;
    }

    addTrackData( data: string | RcsbFvTrackData ): void {
        if(typeof data === "string"){
            this.trackData = data;
        }else{
            if(typeof this.trackData === "undefined"){
                this.trackData = new RcsbFvTrackData();
            }
            (RcsbFvDataManager.processData(data) as RcsbFvTrackData).forEach(d=>{
                (this.trackData as RcsbFvTrackData).push(d);
            });
        }
    }

    updateTrackData(data: string | RcsbFvTrackData):void{
        this.trackData = RcsbFvDataManager.processData(data);
    }

}
