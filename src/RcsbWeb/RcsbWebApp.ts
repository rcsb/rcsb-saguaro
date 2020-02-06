import {RcsbFv} from '../RcsbFv/RcsbFv';
import {
    RcsbFvBoardConfigInterface,
    RcsbFvDisplayConfigInterface,
    RcsbFvRowConfigInterface
} from "../RcsbFv/RcsbFvInterface";
import {AlignmentResponse, TargetAlignment} from "../RcsbGraphQL/RcsbAlignmentInterface";
import {RcsbFvTrackDataElementInterface} from "../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";
import {RcsbAnnotationMap, RcsbAnnotationMapInterface} from "../RcsbAnnotationConfig/RcsbAnnotationMap";
import {DISPLAY_TYPES} from "../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RequestAlignmentInterface} from "../RcsbGraphQL/RcsbQueryAlignment";
import {RcsbFvQuery} from "../RcsbGraphQL/RcsbFvQuery";
import {AnnotationFeatures, Source} from "../RcsbGraphQL/RcsbAnnotationInterface";
import {SequenceReference} from "../RcsbGraphQL/RcsbSequenceReferenceInterface";

interface CollectSequencesInterface{
    queryId: string;
    from: string;
    to: string;
    callBack: ()=>void;
}

interface CollectAnnotationsInterface{
    queryId: string;
    reference: string;
    source: Array<string>;
}

export class RcsbWebApp {
    private rcsbFv: RcsbFv;
    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    private rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private seqeunceConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private alignmentsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private boardConfigData: RcsbFvBoardConfigInterface;
    private bottomAlignments: boolean = false;
    private rcsbAnnotationMap: RcsbAnnotationMap = new RcsbAnnotationMap();

    constructor(config: RcsbFvBoardConfigInterface) {
        this.rcsbFv = new RcsbFv({rowConfigData: null, boardConfigData: null, elementId: config.elementId});
        this.boardConfigData = config;
    }

    public buildUniprotFv(upAcc: string): void{
        this.bottomAlignments = true;
        this.collectSequences({
            queryId:upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            callBack:()=>{
                this.collectAnnotations({
                    queryId: upAcc,
                    reference: SequenceReference.Uniprot,
                    source:[SequenceReference.Uniprot]
                } as CollectAnnotationsInterface);
            }
        } as CollectSequencesInterface);
    }

    public buildEntityFv(entityId: string): void{
        this.collectSequences({
            queryId:entityId,
            from: SequenceReference.PdbEntity,
            to: SequenceReference.Uniprot,
            callBack:()=>{
                this.collectAnnotations({
                    queryId: entityId,
                    reference: SequenceReference.PdbEntity,
                    source:[Source.PdbEntity, Source.Uniprot]
                } as CollectAnnotationsInterface);
            }
        } as CollectSequencesInterface);
    }

    public buildInstanceFv(instanceId: string): void{
        this.rcsbFvQuery.requestAlignment({
            queryId:instanceId,
            from:SequenceReference.PdbInstance,
            to:SequenceReference.PdbEntity,
            callBack:result=>{
                const queryID: string = result.target_alignment[0].target_id;
                this.collectSequences({
                    queryId:queryID,
                    from: SequenceReference.PdbEntity,
                    to: SequenceReference.Uniprot,
                    callBack:()=>{
                        this.collectAnnotations({
                            queryId: instanceId,
                            reference: SequenceReference.PdbInstance,
                            source:[Source.PdbEntity, Source.PdbInstance, Source.Uniprot]
                        } as CollectAnnotationsInterface);
                    }
                } as CollectSequencesInterface);
            }
        } as RequestAlignmentInterface);
    }

    private collectSequences(requestConfig: CollectSequencesInterface): void {
        this.rcsbFvQuery.requestAlignment({
            queryId: requestConfig.queryId,
            from: requestConfig.from,
            to: requestConfig.to,
            callBack: result => {
                const data: AlignmentResponse = result;
                const querySequence: string = data.query_sequence;
                const alignmentData: Array<TargetAlignment> = data.target_alignment;
                const boardConfig: RcsbFvBoardConfigInterface = this.boardConfigData;
                boardConfig.length = result.query_sequence.length;
                boardConfig.includeAxis = true;
                this.rcsbFv.setBoardConfig(boardConfig);
                const track: RcsbFvRowConfigInterface = {
                    trackId: "mainSequenceTrack_" + requestConfig.queryId,
                    displayType: DISPLAY_TYPES.SEQUENCE,
                    trackColor: "#F9F9F9",
                    displayColor: "#000000",
                    rowTitle: requestConfig.queryId,
                    trackData: [{begin: 1, value: result.query_sequence}]
                };
                this.seqeunceConfigData.push(track);
                this.collectTargetAlignments(alignmentData, querySequence, requestConfig.callBack);
            }
        } as RequestAlignmentInterface);
    }

    private collectTargetAlignments(targetAlignmentList: Array<TargetAlignment>, querySequence: string, callBack:()=>void): void{
        const findMismatch = (seqA: string,seqB: string) => {
            const out = [];
            if(seqA.length === seqB.length){
                for(let i = 0;i<seqA.length;i++){
                    if(seqA.charAt(i) !== seqB.charAt(i)){
                        out.push(i);
                    }
                }
            }
            return out;
        };
        targetAlignmentList.forEach(targetAlignment=>{
            const targetSequence = targetAlignment.target_sequence;
            const sequenceData:Array<RcsbFvTrackDataElementInterface> = [];
            const alignedBlocks:Array<RcsbFvTrackDataElementInterface> = [];
            const mismatchData:Array<RcsbFvTrackDataElementInterface> = [];
            targetAlignment.aligned_regions.forEach(region=>{
                const regionSequence = targetSequence.substring(region.target_begin-1,region.target_end);
                sequenceData.push({begin:region.query_begin, value:regionSequence} as RcsbFvTrackDataElementInterface);
                alignedBlocks.push({begin:region.query_begin, end:region.query_end, type:"ALIGNED_BLOCK"} as RcsbFvTrackDataElementInterface);
                findMismatch(regionSequence,querySequence.substring(region.query_begin-1,region.query_end),).forEach(m=>{
                    mismatchData.push({begin:(m+region.query_begin), type:"MISMATCH"} as RcsbFvTrackDataElementInterface);
                });
            });
            const sequenceDisplay:RcsbFvDisplayConfigInterface = {
                displayType: DISPLAY_TYPES.SEQUENCE,
                displayColor: "#000000",
                displayData: sequenceData,
                dynamicDisplay: true
            };
            const mismatchDisplay:RcsbFvDisplayConfigInterface = {
                displayType: DISPLAY_TYPES.PIN,
                displayColor: "#FF9999",
                displayData: mismatchData
            };
            const alignmentDisplay:RcsbFvDisplayConfigInterface = {
                displayType: DISPLAY_TYPES.BLOCK,
                displayColor: "#9999FF",
                displayData: alignedBlocks
            };
            const track:RcsbFvRowConfigInterface = {
                trackId: "targetSequenceTrack_",
                displayType: DISPLAY_TYPES.COMPOSITE,
                trackColor: "#F9F9F9",
                rowTitle: targetAlignment.target_id,
                displayConfig: [alignmentDisplay, mismatchDisplay, sequenceDisplay]
            };
            this.alignmentsConfigData.push(track);
        });
        callBack();
    }

    private collectAnnotations(requestConfig: CollectAnnotationsInterface): void {
        this.rcsbFvQuery.requestAnnotations({
            queryId: requestConfig.queryId,
            reference: requestConfig.reference,
            source: requestConfig.source,
            callBack: result => {
                const data: Array<AnnotationFeatures> = result;
                const annotations:Map<string,Array<RcsbFvTrackDataElementInterface>> = new Map();
                data.forEach(ann => {
                    ann.features.forEach(d => {
                        const type = this.rcsbAnnotationMap.setAnnotationKey(d);
                        if (!annotations.has(type)) {
                            annotations.set(type, new Array<RcsbFvTrackDataElementInterface>());
                        }
                        d.feature_positions.forEach(p => {
                            annotations.get(type).push({
                                begin:p.beg_seq_id,
                                end: p.end_seq_id,
                                description:d.description,
                                featureId: d.feature_id,
                                type:type,
                                value:p.value,
                                gValue:d.value,
                                gaps:p.gaps,
                                openBegin:p.open_begin,
                                openEnd:p.open_end
                            } as RcsbFvTrackDataElementInterface);
                        })
                    });
                });
                this.rcsbAnnotationMap.instanceOrder().forEach(type=>{
                    if(annotations.has(type))
                        this.annotationsConfigData.push( this.buildAnnotationTrack(annotations.get(type),type) );
                });
                this.rcsbAnnotationMap.entityOrder().forEach(type=>{
                    if(annotations.has(type))
                        this.annotationsConfigData.push( this.buildAnnotationTrack(annotations.get(type),type) );
                });
                this.rcsbAnnotationMap.uniprotOrder().forEach(type=>{
                    if(annotations.has(type))
                        this.annotationsConfigData.push( this.buildAnnotationTrack(annotations.get(type),type) );
                });
                annotations.forEach((data, type) => {
                    if(!this.rcsbAnnotationMap.allTypes().has(type))
                        this.annotationsConfigData.push( this.buildAnnotationTrack(data,type) );
                });
                if(this.bottomAlignments){
                    this.rowConfigData = this.seqeunceConfigData.concat(this.annotationsConfigData).concat(this.alignmentsConfigData);
                }else {
                    this.rowConfigData = this.seqeunceConfigData.concat(this.alignmentsConfigData).concat(this.annotationsConfigData);
                }
                this.rcsbFv.setBoardData(this.rowConfigData);
                this.rcsbFv.init();
            }
        });
    }

    private buildAnnotationTrack(data: Array<RcsbFvTrackDataElementInterface>, type: string):RcsbFvRowConfigInterface{
        let displayType: string = DISPLAY_TYPES.BLOCK;
        if (data[0].end == null) {
            displayType = DISPLAY_TYPES.PIN;
        }
        let displayColor:string = this.rcsbAnnotationMap.randomRgba();
        let rowTitle:string = type;

        const annConfig:RcsbAnnotationMapInterface = this.rcsbAnnotationMap.getConfig(type);
        if(annConfig!==null){
            displayType = annConfig.display;
            rowTitle = annConfig.title;
            displayColor = annConfig.color;
        }else{
            console.warn("Annotation config type "+type+" not found. Using random config");
        }

        if(displayType === DISPLAY_TYPES.COMPOSITE){
            const pin: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
            const block: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
            data.forEach(d=>{
                if(d.end!==null && d.end!==d.begin){
                    block.push(d);
                }else{
                    pin.push(d);
                }
            });
            if(pin.length>0 && block.length>0){
                const displayConfig: Array<RcsbFvDisplayConfigInterface> = new Array<RcsbFvDisplayConfigInterface>();
                displayConfig.push({
                    displayData:block,
                    displayType:DISPLAY_TYPES.BLOCK,
                    displayColor: displayColor
                } as RcsbFvDisplayConfigInterface);
                displayConfig.push({
                    displayData:pin,
                    displayType:DISPLAY_TYPES.PIN,
                    displayColor: displayColor
                } as RcsbFvDisplayConfigInterface);
                return {
                    displayType: DISPLAY_TYPES.COMPOSITE,
                    trackColor: "#F9F9F9",
                    trackId: "annotationTrack_"+type,
                    rowTitle: rowTitle,
                    displayConfig: displayConfig
                } as RcsbFvRowConfigInterface;
            }else if(pin.length > 0){
                displayType = DISPLAY_TYPES.PIN;
            }else if(block.length > 0){
                displayType = DISPLAY_TYPES.BLOCK;
            }
        }else if(displayType === DISPLAY_TYPES.BOND){
            const pin: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
            const bond: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
            data.forEach(d=>{
                if(d.end!==null && d.end!==d.begin){
                    d.isEmpty = true;
                    bond.push(d);
                }else{
                    pin.push(d);
                }
            });
            if(pin.length>0 && bond.length>0){
                const displayConfig: Array<RcsbFvDisplayConfigInterface> = new Array<RcsbFvDisplayConfigInterface>();
                displayConfig.push({
                    displayData:bond,
                    displayType:DISPLAY_TYPES.BOND,
                    displayColor: displayColor,
                } as RcsbFvDisplayConfigInterface);
                displayConfig.push({
                    displayData:pin,
                    displayType:DISPLAY_TYPES.PIN,
                    displayColor: displayColor
                } as RcsbFvDisplayConfigInterface);
                return {
                    displayType: DISPLAY_TYPES.COMPOSITE,
                    trackColor: "#F9F9F9",
                    trackId: "annotationTrack_"+type,
                    rowTitle: rowTitle,
                    displayConfig: displayConfig
                } as RcsbFvRowConfigInterface;
            }else if(pin.length > 0){
                displayType = DISPLAY_TYPES.PIN;
            }else if(bond.length > 0){
                displayType = DISPLAY_TYPES.BOND;
            }
        }

        return {
            trackId: "annotationTrack_"+type,
            displayType: displayType,
            trackColor: "#F9F9F9",
            displayColor: displayColor,
            rowTitle: rowTitle,
            trackData: data
        } as RcsbFvRowConfigInterface;
    }
}
