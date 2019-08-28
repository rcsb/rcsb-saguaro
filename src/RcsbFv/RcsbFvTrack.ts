import { RcsbBoard } from '../RcsbBoard/RcsbBoard';
import {RcsbFvConstants} from './RcsbFvConstants';
import {RcsbFvDefaultConfigValues, TRACK_TYPES} from './RcsbFvDefaultConfigValues';
import {RcsbFvDisplay} from "./RcsbFvDisplay";
import {RcsbFvConfig} from "./RcsbFvConfig";

export class RcsbFvTrack {

    private boardClosure: any = null;
    private trackClosure: any = null;
    private rcsbFvDisplay: RcsbFvDisplay = null;
    private rcsbFvConfig: RcsbFvConfig = new RcsbFvConfig();
    private elementId: string = null;
    private trackData: object = null;

    public constructor(args:object) {
        this.boardClosure = RcsbBoard.board();
        this.trackClosure = RcsbBoard.track();
        this.buildTrack(new Map(Object.entries(args)));
    }

    private buildTrack(args:Map<string,any>) : void{
        this.setConfig(args);
        if(this.rcsbFvConfig.has(RcsbFvConstants.ELEMENT_ID)){
            this.init(this.rcsbFvConfig.get(RcsbFvConstants.ELEMENT_ID));
        }
        if(this.rcsbFvConfig.has(RcsbFvConstants.TRACK_DATA)){
            this.load(this.rcsbFvConfig.get(RcsbFvConstants.TRACK_DATA));
        }
        if(  this.rcsbFvConfig.has(RcsbFvConstants.ELEMENT_ID) &&
            (this.rcsbFvConfig.has(RcsbFvConstants.TRACK_DATA) || this.rcsbFvConfig.get(RcsbFvConstants.TYPE) === TRACK_TYPES.AXIS)){
            this.start();
        }
    }

    public setConfig(args:Map<string,any>) : void{
        this.rcsbFvConfig.setConfig(args);
    }

    private initRcsbBoard(){
        this.boardClosure.from(-1*RcsbFvDefaultConfigValues.INCREASED_VIEW);
        this.boardClosure.to( this.rcsbFvConfig.get(RcsbFvConstants.LENGTH));
        this.boardClosure.max( this.rcsbFvConfig.get(RcsbFvConstants.LENGTH)+RcsbFvDefaultConfigValues.INCREASED_VIEW);

        this.trackClosure.height( this.rcsbFvConfig.get(RcsbFvConstants.HEIGHT) );
        this.trackClosure.color( this.rcsbFvConfig.get(RcsbFvConstants.TRACK_COLOR) );
        this.rcsbFvDisplay = new RcsbFvDisplay();
        this.trackClosure.display( this.rcsbFvDisplay.initDisplay(this.rcsbFvConfig.getConfig()) );
    }

    public init(elementId: string) : void{
        if(document.getElementById(elementId)!== null) {
            this.elementId = elementId;
            if (this.rcsbFvConfig.configCheck()) {
                this.boardClosure(document.getElementById(elementId));
                this.initRcsbBoard();
            }
        }else{
            throw "HTML element "+elementId+" not found";
        }
    }

    public load(features: any) : void{
        this.trackData = features;
        if(this.rcsbFvConfig.get(RcsbFvConstants.TYPE) instanceof Array){
            const displayIds: Array<string> = this.rcsbFvDisplay.getDisplayIds();
            const featuresHash: any = {};
            for(let f of features){
                const id: string = displayIds.shift();
                featuresHash[id]=f;
            }
            this.trackClosure.load(featuresHash);
        }else {
            this.trackClosure.load(features);
        }
    }

    public start() : void{
        this.boardClosure.add_track([this.trackClosure]);
        this.boardClosure.start();
    }

}