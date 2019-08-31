import { RcsbBoard } from '../../RcsbBoard/RcsbBoard';
import { RcsbTrack } from '../../RcsbBoard/RcsbTrack';
import {RcsbFvConstants} from '../RcsbFvConstants/RcsbFvConstants';
import {RcsbFvDefaultConfigValues, DISPLAY_TYPES} from '../RcsbFvConfig/RcsbFvDefaultConfigValues';
import {RcsbFvDisplay} from "./RcsbFvDisplay";
import {RcsbFvConfig} from "../RcsbFvConfig/RcsbFvConfig";

export class RcsbFvTrack {

    private rcsbBoard: RcsbBoard = new RcsbBoard();
    private rcsbTrack: RcsbTrack = new RcsbTrack();
    private rcsbFvDisplay: RcsbFvDisplay = null;
    private rcsbFvConfig: RcsbFvConfig = new RcsbFvConfig();
    private elementId: string = null;
    private trackData: object = null;

    public constructor(args:Map<string,any>) {
        this.buildTrack(args);
    }

    private buildTrack(args:Map<string,any>) : void{
        this.setConfig(args);
        if(this.rcsbFvConfig.has(RcsbFvConstants.ELEMENT_ID) && this,this.rcsbFvConfig.has(RcsbFvConstants.MASTER_BOARD_ID)){
            this.init(this.rcsbFvConfig.get(RcsbFvConstants.ELEMENT_ID), this.rcsbFvConfig.get(RcsbFvConstants.MASTER_BOARD_ID));
        }
        if(this.rcsbFvConfig.has(RcsbFvConstants.TRACK_DATA)){
            this.load(this.rcsbFvConfig.get(RcsbFvConstants.TRACK_DATA));
        }
        if(  this.rcsbFvConfig.has(RcsbFvConstants.ELEMENT_ID) &&
            (this.rcsbFvConfig.has(RcsbFvConstants.TRACK_DATA) || this.rcsbFvConfig.get(RcsbFvConstants.DISPLAY_TYPE) === DISPLAY_TYPES.AXIS)){
            this.start();
        }
    }

    public setConfig(args:Map<string,any>) : void{
        this.rcsbFvConfig.setConfig(args);
    }

    private initRcsbBoard(){
        this.rcsbBoard.setRange(-1*RcsbFvDefaultConfigValues.INCREASED_VIEW, this.rcsbFvConfig.get(RcsbFvConstants.LENGTH)+RcsbFvDefaultConfigValues.INCREASED_VIEW);
        this.rcsbTrack.height( this.rcsbFvConfig.get(RcsbFvConstants.TRACK_HEIGHT) );
        this.rcsbTrack.color( this.rcsbFvConfig.get(RcsbFvConstants.TRACK_COLOR) );
        this.rcsbFvDisplay = new RcsbFvDisplay(this.rcsbFvConfig.getConfig());
        this.rcsbTrack.display( this.rcsbFvDisplay.initDisplay() );
    }

    public init(elementId: string, masterBoardId: string) : void{
        if(document.getElementById(elementId)!== null) {
            this.elementId = elementId;
            if (this.rcsbFvConfig.configCheck()) {
                this.rcsbBoard.attach(document.getElementById(elementId), masterBoardId);
                this.initRcsbBoard();
            }
        }else{
            throw "HTML element "+elementId+" not found";
        }
    }

    public load(features: any) : void{
        this.trackData = features;
        if(this.rcsbFvConfig.get(RcsbFvConstants.DISPLAY_TYPE) instanceof Array){
            const displayIds: Array<string> = this.rcsbFvDisplay.getDisplayIds();
            const featuresHash: any = {};
            for(let f of features){
                const id: string = displayIds.shift();
                featuresHash[id]=f;
            }
            this.rcsbTrack.load(featuresHash);
        }else {
            this.rcsbTrack.load(features);
        }
    }

    public start() : void{
        this.rcsbBoard.addTrack([this.rcsbTrack.getTrack()]);
        this.rcsbBoard.start();
    }

    public setScale(obj: any) : void {
        this.rcsbBoard.setScale(obj);
    }

    public setSelection(obj: any) : void {
        this.rcsbBoard.setSelection(obj);
    }
}