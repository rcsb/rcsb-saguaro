import {RcsbFv,RcsbFvQuery} from '../RcsbFv/RcsbFv';
import {RcsbFvDisplayConfigInterface, RcsbFvRowConfigInterface} from "../RcsbFv/RcsbFvInterface";
import {ProteinSeqeunceAlignmentJson} from "../RcsbGraphQL/RcsbAlignmentInterface";
import {RcsbFvTrackDataElementInterface} from "../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";
import {RequestTranslateInterface} from "../RcsbGraphQL/RcsbInstanceToEntity";

export interface RcsbWebAppInterface{
    elementId:string;
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

    constructor(config: RcsbWebAppInterface) {
        this.rcsbFv = new RcsbFv({rowConfigData: null, boardConfigData: null, elementId: config.elementId});
    }

    public buildUniprotFv(upAcc: string): void{
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
                    includeAxis: true
                });
                const track: RcsbFvRowConfigInterface = {
                    trackId: "mainSequenceTrack_" + requestConfig.queryId,
                    displayType: "sequence",
                    trackColor: "#F9F9F9",
                    displayColor: "#000000",
                    rowTitle: requestConfig.queryId,
                    trackData: [{begin: 1, val: result.data.alignment.query_sequence}]
                };
                //this.rcsbFv.addTrack(track);
                this.rowConfigData.push(track);
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
            //this.rcsbFv.addTrack(track);
            this.rowConfigData.push(track);
        });
        callBack();
    }

    private collectAnnotations(requestConfig: CollectAnnotationsInterface): void {
        const randomRgba = ()=>{
            var o = Math.round, r = Math.random, s = 255;
            return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
        };

        this.rcsbFvQuery.requestAnnotations({
            queryId: requestConfig.queryId,
            reference: requestConfig.reference,
            source: requestConfig.source,
            callBack: result => {
                const data: Array<Annotations> = result.data.annotations as Array<Annotations>;
                const annotations = new Map();
                data.forEach(ann => {
                    ann.items.forEach(d => {
                        const type = d.type;
                        const positions = d.positions;
                        if (annotations.has(type)) {
                            positions.forEach(p => {
                                annotations.get(type).push(p);
                            })
                        } else {
                            annotations.set(type, positions);
                        }
                    });
                });
                annotations.forEach((data, type) => {
                    let displayType = "block";
                    if (data[0].end == null) {
                        displayType = "pin";
                    }
                    const track:RcsbFvRowConfigInterface = {
                        trackId: "annotationTrack_"+type,
                        displayType: displayType,
                        trackColor: "#F9F9F9",
                        displayColor: randomRgba(),
                        rowTitle: type,
                        trackData: data
                    };
                    //this.rcsbFv.addTrack(track);
                    this.rowConfigData.push(track);
                });
                this.rcsbFv.setBoardData(this.rowConfigData);
                this.rcsbFv.init();
            }
        });
    }
}
