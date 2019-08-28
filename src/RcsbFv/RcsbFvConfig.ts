import {RcsbFvConstants} from './RcsbFvConstants';
import {RcsbFvDefaultConfigValues, TRACK_TYPES} from './RcsbFvDefaultConfigValues';

export class RcsbFvConfig {

    private trackConfig: Map<string,any> = new Map([
        [RcsbFvConstants.LENGTH, null],
        [RcsbFvConstants.TYPE, null]
    ]);

    get(key:string) : any{
        if(this.trackConfig.has(key)){
            return this.trackConfig.get(key);
        }
        return null;
    }

    has(key:string) : boolean {
        return this.trackConfig.has(key);
    }

    configCheck() : boolean{
        for(const key in this.trackConfig){
            if(this.trackConfig.get(key)===null){
                console.error("Configuration "+key+" value not found");
                return false;
            }
        }
        return true;
    }

    getConfig() : Map<string,any>{
        return this.trackConfig;
    }

    setConfig(args:Map<string,any>) : void {

        //external config
        if(args.has(RcsbFvConstants.LENGTH) && typeof +args.get(RcsbFvConstants.LENGTH) === "number"){
            this.trackConfig.set(RcsbFvConstants.LENGTH, +args.get(RcsbFvConstants.LENGTH));
        }
        if(args.has(RcsbFvConstants.TYPE)){
            this.trackConfig.set(RcsbFvConstants.TYPE, args.get(RcsbFvConstants.TYPE));
        }
        if(args.has(RcsbFvConstants.ELEMENT_ID)) {
            this.trackConfig.set(RcsbFvConstants.ELEMENT_ID, args.get(RcsbFvConstants.ELEMENT_ID));
        }
        if(args.has(RcsbFvConstants.TRACK_DATA)) {
            this.trackConfig.set(RcsbFvConstants.TRACK_DATA, args.get(RcsbFvConstants.TRACK_DATA));
        }
        if(args.has(RcsbFvConstants.DISPLAY_CONFIG)) {
            this.trackConfig.set(RcsbFvConstants.DISPLAY_CONFIG, this.parseDisplayConfig(args.get(RcsbFvConstants.DISPLAY_CONFIG)));
        }

        //default config available
        if(args.has(RcsbFvConstants.HEIGHT) && typeof +args.get(RcsbFvConstants.HEIGHT) === "number"){
            this.trackConfig.set(RcsbFvConstants.HEIGHT, +args.get(RcsbFvConstants.HEIGHT));
        }else{
            this.trackConfig.set(RcsbFvConstants.HEIGHT, +RcsbFvDefaultConfigValues.HEIGHT);
        }
        if(args.has(RcsbFvConstants.TRACK_COLOR)){
            this.trackConfig.set(RcsbFvConstants.TRACK_COLOR, args.get(RcsbFvConstants.TRACK_COLOR));
        }else{
            this.trackConfig.set(RcsbFvConstants.TRACK_COLOR, RcsbFvDefaultConfigValues.TRACK_COLOR);
        }
        if(args.has(RcsbFvConstants.DISPLAY_COLOR)){
            this.trackConfig.set(RcsbFvConstants.DISPLAY_COLOR, args.get(RcsbFvConstants.DISPLAY_COLOR));
        }else{
            this.trackConfig.set(RcsbFvConstants.DISPLAY_COLOR, RcsbFvDefaultConfigValues.DISPLAY_COLOR);
        }
        if(args.has(RcsbFvConstants.DISPLAY_DOMAIN)){
            this.trackConfig.set(RcsbFvConstants.DISPLAY_DOMAIN, args.get(RcsbFvConstants.DISPLAY_DOMAIN));
        }else{
            this.trackConfig.set(RcsbFvConstants.DISPLAY_DOMAIN, RcsbFvDefaultConfigValues.DISPLAY_DOMAIN);
        }
    }

    private parseDisplayConfig(displayArray: any) : Array<Map<string,any>> {
        const out: Array<Map<string, any>> = new Array<Map<string, any>>();
        for(const d of displayArray){
            out.push(new Map(Object.entries(d)));
        }
        return out;
    }
}
