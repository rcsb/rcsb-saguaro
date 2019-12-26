import * as React from "react";
import * as ReactDom from "react-dom";
import RcsbFvBoard from "./RcsbFvBoard/RcsbFvBoard";
import {RcsbFvRowConfigInterface, RcsbFvBoardConfigInterface} from "./RcsbFvInterface";
import {
    EVENT_TYPE,
    DataInterface,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, ResetInterface, TrackInterface
} from "./RcsbFvContextManager/RcsbFvContextManager";
import {RcsbFvTrackData} from "./RcsbFvDataManager/RcsbFvDataManager";
import RcsbQueryAnnotations, {
    AnnotationReferenceInterface, AnnotationSourceInterface,
    RequestAnnotationsInterface
} from "../RcsbGraphQL/RcsbQueryAnnotations";
import RcsbQueryAlignment, {
    RequestAlignmentInterface,
    SequenceReferenceInterface
} from "../RcsbGraphQL/RcsbQueryAlignment";
import RcsbInstanceToEntity, {RequestTranslateInterface} from "../RcsbGraphQL/RcsbInstanceToEntity";
import {RcsbWebApp} from "../RcsbWeb/RcsbWebApp";

interface RcsbFvInterface {
    rowConfigData: Array<RcsbFvRowConfigInterface>;
    boardConfigData: RcsbFvBoardConfigInterface;
    elementId: string;
}

export class RcsbFv {

    private trackIds: Array<string> = new Array<string>();
    rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    boardConfigData: RcsbFvBoardConfigInterface;
    elementId: string;
    mounted: boolean = false;

    constructor(props: RcsbFvInterface){
        this.boardConfigData = props.boardConfigData;
        this.elementId = props.elementId;
        if(this.elementId===null || this.elementId===undefined){
            throw "FATAL ERROR: DOM elementId not found";
        }
        if(props.rowConfigData!=null) {
            this.rowConfigData = props.rowConfigData;
            this.identifyFvTracks(this.rowConfigData);
        }
        if(this.boardConfigData!==null) {
            this.init();
        }
    }

    public setBoardData(rowConfigData: Array<RcsbFvRowConfigInterface>): void{
        this.rowConfigData = rowConfigData;
        this.identifyFvTracks(this.rowConfigData);
    }

    public setBoardConfig(config: RcsbFvBoardConfigInterface){
        this.boardConfigData = config;
    }

    public init(){
        if(!this.mounted) {
            this.mounted = true;
            ReactDom.render(
                <RcsbFvBoard rowConfigData={this.rowConfigData} boardConfigData={this.boardConfigData}/>,
                document.getElementById(this.elementId)
            );
        }
    }

    private identifyFvTracks(rowConfigData: Array<RcsbFvRowConfigInterface>): void{
        for(const trackConfig of rowConfigData){
            if(typeof trackConfig.trackId === "undefined"){
                trackConfig.trackId = "trackId_"+Math.trunc(Math.random()*1000000);
            }
            if(!this.trackIds.includes(trackConfig.trackId)) {
                this.trackIds.push(trackConfig.trackId);
            }
        }
    }

    public getTrackIds(): Array<string>{
        return this.trackIds;
    }

    public addData(trackId:string, data:RcsbFvTrackData|string): void{
        const loadDataObj:DataInterface = {
            trackId:trackId,
            loadData:data
        };
        RcsbFvContextManager.next({
            eventType:EVENT_TYPE.ADD_DATA,
            eventData:loadDataObj
        } as RcsbFvContextManagerInterface);
    }

    public updateData(trackId:string, data:RcsbFvTrackData|string): void{
        const loadDataObj:DataInterface = {
            trackId:trackId,
            loadData:data
        };
        RcsbFvContextManager.next({
            eventType:EVENT_TYPE.UPDATE_DATA,
            eventData:loadDataObj
        } as RcsbFvContextManagerInterface);
    }

    public reset(trackId:string): void{
        const resetDataObj:ResetInterface = {
            trackId:trackId
        };
        RcsbFvContextManager.next({
            eventType:EVENT_TYPE.RESET,
            eventData:resetDataObj
        } as RcsbFvContextManagerInterface);
    }

    public addTrack(trackConfig: RcsbFvRowConfigInterface): void{
        if(this.mounted) {
            RcsbFvContextManager.next({
                eventType: EVENT_TYPE.ADD_TRACK,
                eventData: trackConfig
            } as RcsbFvContextManagerInterface)
        }
        this.identifyFvTracks(this.rowConfigData);
    }

}

export class RcsbFvQuery {
    private rcsbFvQueryAnnotations:RcsbQueryAnnotations = new RcsbQueryAnnotations();
    private rcsbFvQueryAlignment:RcsbQueryAlignment = new RcsbQueryAlignment();
    private rcsbFvInstanceToEntity:RcsbInstanceToEntity = new RcsbInstanceToEntity();

    public readonly sequenceReference:SequenceReferenceInterface = this.rcsbFvQueryAlignment.sequenceReference;
    public readonly annotationReference:AnnotationReferenceInterface = this.rcsbFvQueryAnnotations.annotationReference;
    public readonly annotationSource:AnnotationSourceInterface = this.rcsbFvQueryAnnotations.annotationSource;

    public requestAnnotations(requestConfig: RequestAnnotationsInterface): void{
        this.rcsbFvQueryAnnotations.request(requestConfig);
    }

    public requestAlignment(requestConfig: RequestAlignmentInterface): void{
        this.rcsbFvQueryAlignment.request(requestConfig);
    }

    public translateInstanceToEntity(requestConfig: RequestTranslateInterface): void{
        this.rcsbFvInstanceToEntity.request(requestConfig);

    }
}

export class RcsbFvWebApp extends RcsbWebApp{

}

