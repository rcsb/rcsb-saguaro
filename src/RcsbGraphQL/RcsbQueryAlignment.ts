import RcsbQuery from "./RcsbQuery";
import {AlignmentResponse} from "./Types/GqlTypes";
import * as query from "./Queries/QueryAlignments.graphql";

export interface RequestAlignmentInterface {
    queryId: string;
    from: string;
    to: string;
    callBack: (n: AlignmentResponse)=>void;
}

interface AlignmentResponseInterface{
    alignment: AlignmentResponse;
}

export default class RcsbQueryAlignment extends RcsbQuery{

    public request(requestConfig: RequestAlignmentInterface): void{
        this.borregoClient.query<AlignmentResponseInterface>({
            query:query,
            variables:{
                queryId:requestConfig.queryId,
                from:requestConfig.from,
                to:requestConfig.to
            }
        }).then(result=>{
            requestConfig.callBack(result.data.alignment);
        }).catch(error => console.error(error));
    }
}
