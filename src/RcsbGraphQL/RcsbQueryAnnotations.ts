import RcsbQuery from "./RcsbQuery";
import {AnnotationFeatures} from "./RcsbAnnotationInterface";
import * as query from "./Queries/QueryAnnotations.graphql";

export interface AnnotationSourceInterface {
    PDB_ENTITY: string;
    PDB_INSTANCE: string;
    UNIPROT: string;
}

export interface RequestAnnotationsInterface {
    queryId: string;
    reference: string;
    source: Array<string>;
    callBack: (n: Array<AnnotationFeatures>)=>void;
}

interface AnnotationsResultInterface {
    annotations: Array<AnnotationFeatures>;
}

export default class RcsbQueryAnnotations extends RcsbQuery{

    readonly annotationSource:AnnotationSourceInterface = {
        PDB_ENTITY: "PDB_ENTITY",
        PDB_INSTANCE: "PDB_INSTANCE",
        UNIPROT: "UNIPROT"
    };

    public request(requestConfig: RequestAnnotationsInterface): void{
        this.borregoClient.query<AnnotationsResultInterface>({
            query:query,
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