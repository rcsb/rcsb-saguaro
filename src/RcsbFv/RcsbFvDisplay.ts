import {RcsbDisplay} from '../RcsbBoard/RcsbDisplay';
import {RcsbFvConstants} from './RcsbFvConstants';
import {TRACK_TYPES} from './RcsbFvDefaultConfigValues';

export class RcsbFvDisplay {

    private displayClosure : RcsbDisplay = new RcsbDisplay();
    private displayIds: Array<string> = [];

    public initDisplay(config: Map<string, any>) : object{
        if (typeof config.get(RcsbFvConstants.TYPE) === "string") {
            return this.singleDisplay(config.get(RcsbFvConstants.TYPE), config);
        }else if(config.get(RcsbFvConstants.TYPE) instanceof Array){
            return this.composedDisplay(config);
        }else{
            throw "Display type "+config.get(RcsbFvConstants.TYPE)+" not supported";
        }
    }

    public getDisplayIds(){
        return this.displayIds;
    }

    private composedDisplay(config: Map<string, any>) : object{
        const display = this.displayClosure.composite();
        const displayTypeArray: Array<string> = config.get(RcsbFvConstants.TYPE);
        let i = 0;
        for(let displayType of displayTypeArray){
            const displayId: string = "displayId_"+Math.trunc(Math.random()*1000);
            let displayConfig: Map<string, any> = config;
            if(config.has(RcsbFvConstants.DISPLAY_CONFIG)) {
                displayConfig = this.setDisplayConfig(config, config.get(RcsbFvConstants.DISPLAY_CONFIG)[i]);
                i++;
            }
            display.add( displayId, this.singleDisplay(displayType, displayConfig) );
            this.displayIds.push(displayId);
        }
        return display;
    }

    private setDisplayConfig(config: Map<string, any>, displayConfig: Map<string, any>) : Map<string, any>{
        const out: Map<string, any> = new Map(config);
        displayConfig.forEach((v,k)=>{
            out.set(k,v);
        });
        return out;
    }

    private singleDisplay(type: string, config: Map<string, any>) {
        switch (type) {
            case TRACK_TYPES.AXIS:
                return this.axisDisplay();
            case TRACK_TYPES.SEQUENCE:
                return this.sequenceDisplay(config.get(RcsbFvConstants.DISPLAY_COLOR));
            case TRACK_TYPES.BLOCK:
                return this.blockDisplay(config.get(RcsbFvConstants.DISPLAY_COLOR));
            case TRACK_TYPES.PIN:
                return this.pinDisplay(config.get(RcsbFvConstants.DISPLAY_COLOR), config.get(RcsbFvConstants.DISPLAY_DOMAIN));
            default:
                throw "Track type " + config.get(RcsbFvConstants.TYPE) + " is not supported";
        }
    }

    private axisDisplay(){
        return this.displayClosure.axis();
    }

    private sequenceDisplay(color:string) : object{
        const display = this.displayClosure.sequence();
        display.color(color);
        return display;
    }

    private blockDisplay(color:string) : object{
        const display = this.displayClosure.block();
        display.color(color);
        return display;
    }

    private pinDisplay(color: string, domain:Array<number>) : object{
        const display = this.displayClosure.pin();
        display.color(color);
        display.domain(domain);
        return display;
    }
}
