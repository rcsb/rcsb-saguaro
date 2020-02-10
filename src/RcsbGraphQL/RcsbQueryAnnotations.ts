import RcsbQuery from "./RcsbQuery";
import {AnnotationFeatures} from "./Types/GqlTypes";
import * as query from "./Queries/QueryAnnotations.graphql";

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