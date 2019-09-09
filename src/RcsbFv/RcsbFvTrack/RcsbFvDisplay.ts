import {RcsbDisplay} from '../../RcsbBoard/RcsbDisplay';
import {DISPLAY_TYPES} from '../RcsbFvConfig/RcsbFvDefaultConfigValues';
import {RcsbFvDisplayConfigInterface, RcsbFvRowConfigInterface} from "../RcsbFvInterface";

export class RcsbFvDisplay {

    private rcsbDisplay : RcsbDisplay = new RcsbDisplay();
    private displayIds: Array<string> = [];
    private displayConfig: RcsbFvRowConfigInterface;

    constructor(config: RcsbFvRowConfigInterface){
        this.displayConfig = config;
    }

    public initDisplay() : object{
        const config = this.displayConfig;
        if (typeof config.displayType === "string") {
            return this.singleDisplay(config.displayType, config);
        }else if(config.displayType instanceof Array){
            return this.composedDisplay(config);
        }else{
            throw "Display type "+config.displayType+" not supported";
        }
    }

    public getDisplayIds(){
        return this.displayIds;
    }

    private composedDisplay(config: RcsbFvRowConfigInterface) : object{
        const display = this.rcsbDisplay.composite();
        const displayTypeArray: string | Array<string> = config.displayType;
        let i = 0;
        for(let displayType of displayTypeArray){
            const displayId: string = "displayId_"+Math.trunc(Math.random()*1000);
            let displayConfig: RcsbFvRowConfigInterface = config;
            if(config.displayConfig) {
                displayConfig = this.setDisplayConfig(config, config.displayConfig[i]);
                i++;
            }
            display.add( displayId, this.singleDisplay(displayType, displayConfig) );
            this.displayIds.push(displayId);
        }
        return display;
    }

    private setDisplayConfig(config: RcsbFvRowConfigInterface, displayConfig: RcsbFvDisplayConfigInterface) : RcsbFvRowConfigInterface{
        const out: RcsbFvRowConfigInterface = Object.assign({},config);
        if(typeof displayConfig.displayColor === "string"){
            out.displayColor = displayConfig.displayColor;
        }
        return out;
    }

    private singleDisplay(type: string, config: RcsbFvRowConfigInterface) {
        switch (type) {
            case DISPLAY_TYPES.AXIS:
                return this.axisDisplay();
            case DISPLAY_TYPES.SEQUENCE:
                return this.sequenceDisplay(config.displayColor);
            case DISPLAY_TYPES.BLOCK:
                return this.blockDisplay(config.displayColor);
            case DISPLAY_TYPES.PIN:
                return this.pinDisplay(config.displayColor, config.displayDomain);
            case DISPLAY_TYPES.LINE:
                return this.lineDisplay(config.displayColor, config.displayDomain, config.interpolationType);
            case DISPLAY_TYPES.AREA:
                return this.areaDisplay(config.displayColor, config.displayDomain, config.interpolationType);
            case DISPLAY_TYPES.VLINE:
                return this.vlineDisplay(config.displayColor);
            default:
                throw "Track type " + config.displayType + " is not supported";
        }
    }

    private axisDisplay(){
        return this.rcsbDisplay.axis();
    }

    private sequenceDisplay(color:string) : object{
        const display = this.rcsbDisplay.sequence();
        display.color(color);
        return display;
    }

    private blockDisplay(color:string) : object{
        const display = this.rcsbDisplay.block();
        display.color(color);
        return display;
    }

    private vlineDisplay(color:string) : object{
        const display = this.rcsbDisplay.vline();
        display.color(color);
        return display;
    }

    private pinDisplay(color: string, domain:Array<number>) : object{
        const display = this.rcsbDisplay.pin();
        display.color(color);
        display.domain(domain);
        return display;
    }

    private lineDisplay(color: string, domain:Array<number>, interpolationType: string) : object{
        const display = this.rcsbDisplay.line();
        display.color(color);
        display.domain(domain);
        display.interpolationType(interpolationType);
        return display;
    }

    private areaDisplay(color: string, domain:Array<number>, interpolationType: string) : object{
        const display = this.rcsbDisplay.area();
        display.color(color);
        display.domain(domain);
        display.interpolationType(interpolationType);
        return display;
    }
}
