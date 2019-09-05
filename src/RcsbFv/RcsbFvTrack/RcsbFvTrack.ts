import {RcsbBoard} from '../../RcsbBoard/RcsbBoard';
import {RcsbTrack} from '../../RcsbBoard/RcsbTrack';
import {RcsbFvDefaultConfigValues, DISPLAY_TYPES} from '../RcsbFvConfig/RcsbFvDefaultConfigValues';
import {RcsbFvDisplay} from "./RcsbFvDisplay";
import {RcsbFvConfig} from "../RcsbFvConfig/RcsbFvConfig";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import {RcsbFvContextManagerInterface} from "../RcsbFvContextManager/RcsbFvContextManager";

export class RcsbFvTrack {

    private rcsbBoard: RcsbBoard = new RcsbBoard();
    private rcsbTrack: RcsbTrack = new RcsbTrack();
    private rcsbFvDisplay: RcsbFvDisplay = null;
    private rcsbFvConfig: RcsbFvConfig;
    private elementId: string = null;
    private trackData: string | Array<object> = null;

    public constructor(args:RcsbFvRowConfigInterface) {
        this.buildTrack(args);
    }

    private buildTrack(args:RcsbFvRowConfigInterface) : void{
        this.setConfig(args);
        if(typeof this.rcsbFvConfig.elementId === "string"){
            this.init(this.rcsbFvConfig.elementId);
        }
        if(typeof this.rcsbFvConfig.trackData !== null){
            this.load(this.rcsbFvConfig.trackData);
        }
        if(
            (typeof this.rcsbFvConfig.elementId === "string") &&
            (typeof this.rcsbFvConfig.trackData !== null || this.rcsbFvConfig.displayType === DISPLAY_TYPES.AXIS)
        ){
            this.start();
        }
    }

    public setConfig(args: RcsbFvRowConfigInterface) : void{
        this.rcsbFvConfig = new RcsbFvConfig(args);
    }

    private initRcsbBoard(){
        this.rcsbBoard.setRange(-1*RcsbFvDefaultConfigValues.increasedView, this.rcsbFvConfig.length+RcsbFvDefaultConfigValues.increasedView);
        this.rcsbTrack.height( this.rcsbFvConfig.trackHeight );
        this.rcsbTrack.color( this.rcsbFvConfig.trackColor );
        this.rcsbFvDisplay = new RcsbFvDisplay(this.rcsbFvConfig);
        this.rcsbTrack.display( this.rcsbFvDisplay.initDisplay() );
    }

    public init(elementId: string) : void{
        if(document.getElementById(elementId)!== null) {
            this.elementId = elementId;
            if (this.rcsbFvConfig.configCheck()) {
                this.rcsbBoard.attach(document.getElementById(elementId));
                this.initRcsbBoard();
            }
        }else{
            throw "HTML element "+elementId+" not found";
        }
    }

    public load(trackData: string | Array<object>) : void{
        this.trackData = trackData;
        if(this.rcsbFvConfig.displayType instanceof Array){
            const displayIds: Array<string> = this.rcsbFvDisplay.getDisplayIds();
            const trackDataHash: {[key: string]: string | object} = {};
            for(let f of trackData){
                const id: string = displayIds.shift();
                trackDataHash[id]=f;
            }
            this.rcsbTrack.load(trackDataHash);
        }else {
            this.rcsbTrack.load(trackData);
        }
    }

    public start() : void{
        this.rcsbBoard.addTrack([this.rcsbTrack.getTrack()]);
        this.rcsbBoard.start();
    }

    public setScale(obj: RcsbFvContextManagerInterface) : void {
        this.rcsbBoard.setScale(obj);
    }

    public setSelection(obj: RcsbFvContextManagerInterface) : void {
        this.rcsbBoard.setSelection(obj);
    }
}