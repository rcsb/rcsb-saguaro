import gql from 'graphql-tag';
import RcsbQuery from "./RcsbQuery";

export interface AnnotationReferenceInterface {
    NCBI_GENOME: string;
    NCBI_PROTEIN: string;
    PDB_ENTITY: string;
    PDB_INSTANCE: string;
    UNIPROT: string;
}

export interface AnnotationSourceInterface {
    PDB_ENTITY: string;
    PDB_INSTANCE: string;
    UNIPROT: string;
}

export interface RequestAnnotationsInterface {
    queryId: string;
    reference: string;
    source: Array<string>;
    callBack: (n: Array<Annotations>)=>void;
}

export interface Annotations {
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

interface AnnotationsResultInterface {
    annotations: Array<Annotations>;
}

export default class RcsbQueryAnnotations extends RcsbQuery{

    readonly annotationReference:AnnotationReferenceInterface = {
        NCBI_GENOME: "NCBI_GENOME",
        NCBI_PROTEIN: "NCBI_PROTEIN",
        PDB_ENTITY: "PDB_ENTITY",
        PDB_INSTANCE: "PDB_INSTANCE",
        UNIPROT: "UNIPROT"
    };

    readonly annotationSource:AnnotationSourceInterface = {
        PDB_ENTITY: "PDB_ENTITY",
        PDB_INSTANCE: "PDB_INSTANCE",
        UNIPROT: "UNIPROT"
    };

    public request(requestConfig: RequestAnnotationsInterface): void{
        this.borregoClient.query<AnnotationsResultInterface>({
            query:gql`query queryAnnotations($queryId: String!, $reference: AnnotationReference, $source:[AnnotationSource]){
                annotations(
                    queryId:$queryId
                    reference:$reference
                    sources:$source
                ){
                    source
                    target_id
                    items {
                        type
                        description
                        feature_id
                        positions {
                            begin
                            end
                        }
                    }
                }
            }`,
            variables:{
                queryId:requestConfig.queryId,
                reference:requestConfig.reference,
                source:requestConfig.source
            }
        }).then(result=>{
            requestConfig.callBack(result.data.annotations);
        }).catch(error => console.error(error));
    }
}