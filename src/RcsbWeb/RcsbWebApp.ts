import {RcsbFv,RcsbFvQuery} from '../RcsbFv/RcsbFv';
import {
    RcsbFvBoardConfigInterface,
    RcsbFvDisplayConfigInterface,
    RcsbFvRowConfigInterface
} from "../RcsbFv/RcsbFvInterface";
import {ProteinSeqeunceAlignmentJson} from "../RcsbGraphQL/RcsbAlignmentInterface";
import {RcsbFvTrackDataElementInterface} from "../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";
import {RequestTranslateInterface} from "../RcsbGraphQL/RcsbInstanceToEntity";
import {RcsbAnnotationMap, RcsbAnnotationMapInterface} from "../RcsbAnnotationConfig/RcsbAnnotationMap";

export interface RcsbWebAppInterface{
    elementId:string;
    elementClickCallBack?:(d?:RcsbFvTrackDataElementInterface)=>void;
}

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

interface AlignmentListInterface{
    query_sequence: string;
    target_alignment: Array<ProteinSeqeunceAlignmentJson>;
}

interface Annotations {
    items: Array<AnnotationItem>;
    source: string;
    target_id: string;
}

interface AnnotationItem {
    description: string;
    feature_id: string;
    name: string;
    positions: Array<Position>;
    type: string;
    value: number;
}

interface Position{
    begin: number;
    end: number;
    value: number;
}

export class RcsbWebApp {
    private rcsbFv: RcsbFv;
    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    private rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private seqeunceConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private alignmentsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private elementClickCallBack:(d?:RcsbFvTrackDataElementInterface)=>void;
    private bottomAlignments: boolean = false;
    private rcsbAnnotationMap: RcsbAnnotationMap = new RcsbAnnotationMap();

    constructor(config: RcsbWebAppInterface) {
        this.rcsbFv = new RcsbFv({rowConfigData: null, boardConfigData: null, elementId: config.elementId});
        this.elementClickCallBack = config.elementClickCallBack;
    }

    public buildUniprotFv(upAcc: string): void{
        this.bottomAlignments = true;
        this.collectSequences({
            queryId:upAcc,
            from: this.rcsbFvQuery.sequenceReference.UNIPROT,
            to: this.rcsbFvQuery.sequenceReference.PDB_ENTITY,
            callBack:()=>{
                this.collectAnnotations({
                    queryId: upAcc,
                    reference: this.rcsbFvQuery.annotationReference.UNIPROT,
                    source:[this.rcsbFvQuery.annotationSource.UNIPROT]
                } as CollectAnnotationsInterface);
            }
        } as CollectSequencesInterface);
    }

    public buildEntityFv(entityId: string): void{
        this.collectSequences({
            queryId:entityId,
            from: this.rcsbFvQuery.sequenceReference.PDB_ENTITY,
            to: this.rcsbFvQuery.sequenceReference.UNIPROT,
            callBack:()=>{
                this.collectAnnotations({
                    queryId: entityId,
                    reference: this.rcsbFvQuery.annotationReference.PDB_ENTITY,
                    source:[this.rcsbFvQuery.annotationSource.PDB_ENTITY, this.rcsbFvQuery.annotationSource.UNIPROT]
                } as CollectAnnotationsInterface);
            }
        } as CollectSequencesInterface);
    }

    public buildInstanceFv(instanceId: string): void{
        const ids: Array<string>= instanceId.split(".");
        this.rcsbFvQuery.translateInstanceToEntity({
            entryId:ids[0],
            asymId:ids[1],
            callBack:result=>{
                const entityId:number = result.data.polymer_entity_instance.rcsb_polymer_entity_instance_container_identifiers.entity_id;
                const queryID: string = ids[0]+"."+entityId;
                this.collectSequences({
                    queryId:queryID,
                    from: this.rcsbFvQuery.sequenceReference.PDB_ENTITY,
                    to: this.rcsbFvQuery.sequenceReference.UNIPROT,
                    callBack:()=>{
                        this.collectAnnotations({
                            queryId: instanceId,
                            reference: this.rcsbFvQuery.annotationReference.PDB_INSTANCE,
                            source:[this.rcsbFvQuery.annotationSource.PDB_ENTITY, this.rcsbFvQuery.annotationSource.PDB_INSTANCE, this.rcsbFvQuery.annotationSource.UNIPROT]
                        } as CollectAnnotationsInterface);
                    }
                } as CollectSequencesInterface);
            }
        } as RequestTranslateInterface);
    }

    private collectSequences(requestConfig: CollectSequencesInterface): void {
        this.rcsbFvQuery.requestAlignment({
            queryId: requestConfig.queryId,
            from: requestConfig.from,
            to: requestConfig.to,
            callBack: result => {
                const data: AlignmentListInterface = result.data.alignment as AlignmentListInterface;
                const querySequence: string = data.query_sequence;
                const alignmentData: Array<ProteinSeqeunceAlignmentJson> = data.target_alignment;
                this.rcsbFv.setBoardConfig({
                    length: result.data.alignment.query_sequence.length,
                    includeAxis: true,
                    elementClickCallBack:this.elementClickCallBack
                } as RcsbFvBoardConfigInterface);
                const track: RcsbFvRowConfigInterface = {
                    trackId: "mainSequenceTrack_" + requestConfig.queryId,
                    displayType: "sequence",
                    trackColor: "#F9F9F9",
                    displayColor: "#000000",
                    rowTitle: requestConfig.queryId,
                    trackData: [{begin: 1, val: result.data.alignment.query_sequence}]
                };
                this.seqeunceConfigData.push(track);
                this.collectTargetAlignments(alignmentData, querySequence, requestConfig.callBack);
            }
        });
    }

    private collectTargetAlignments(targetAlignmentList: Array<ProteinSeqeunceAlignmentJson>, querySequence: string, callBack:()=>void): void{
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
                sequenceData.push({begin:region.query_begin, val:regionSequence});
                alignedBlocks.push({begin:region.query_begin, end:region.query_end});
                findMismatch(regionSequence,querySequence.substring(region.query_begin-1,region.query_end),).forEach(m=>{
                    mismatchData.push({begin:(m+region.query_begin)});
                });
            });
            const sequenceDisplay:RcsbFvDisplayConfigInterface = {
                displayType: "sequence",
                displayColor: "#000000",
                displayData: sequenceData,
                dynamicDisplay: true
            };
            const mismatchDisplay:RcsbFvDisplayConfigInterface = {
                displayType: "pin",
                displayColor: "#FF9999",
                displayData: mismatchData
            };
            const alignmentDisplay:RcsbFvDisplayConfigInterface = {
                displayType: "block",
                displayColor: "#9999FF",
                displayData: alignedBlocks
            };
            const track:RcsbFvRowConfigInterface = {
                trackId: "targetSequenceTrack_",
                displayType: "composite",
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
                const data: Array<Annotations> = result.data.annotations as Array<Annotations>;
                const annotations:Map<string,Array<RcsbFvTrackDataElementInterface>> = new Map();
                data.forEach(ann => {
                    ann.items.forEach(d => {
                        const type = d.type;
                        const positions = d.positions;
                        if (!annotations.has(type)) {
                            annotations.set(type, new Array<RcsbFvTrackDataElementInterface>());
                        }
                        positions.forEach(p => {
                            annotations.get(type).push({
                                begin:p.begin,
                                end: p.end,
                                description:d.description,
                                feature_id: d.feature_id
                            } as RcsbFvTrackDataElementInterface);
                        })
                    });
                });
                this.rcsbAnnotationMap.order().forEach(type=>{
                    if(annotations.has(type))
                        this.annotationsConfigData.push( this.buildAnnotationTrack(annotations.get(type),type) );
                });
                annotations.forEach((data, type) => {
                    if(!this.rcsbAnnotationMap.order().includes(type))
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
        const randomRgba = ()=>{
            var o = Math.round, r = Math.random, s = 255;
            return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
        };
        let displayType = "block";
        if (data[0].end == null) {
            displayType = "pin";
        }
        let displayColor = randomRgba();
        let rowTitle = type;
        const annConfig:RcsbAnnotationMapInterface = this.rcsbAnnotationMap.getConfig(type);
        if(annConfig!==null){
            displayType = annConfig.display;
            rowTitle = annConfig.title;
            displayColor = annConfig.color;

        }else{
            console.warn("Annotation config type "+type+" not found. Using random config");
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
