import RcsbQuery from "./RcsbQuery";
import {RcsbAnnotationInterface} from "./RcsbAnnotationInterface";
import * as query from "./Queries/QueryAnnotations.graphql";

export interface RequestAnnotationsInterface {
    queryId: string;
    reference: string;
    source: Array<string>;
    callBack: (n: Array<RcsbAnnotationInterface>)=>void;
}

interface AnnotationsResultInterface {
    annotations: Array<RcsbAnnotationInterface>;
}

export default class RcsbQueryAnnotations extends RcsbQuery{

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