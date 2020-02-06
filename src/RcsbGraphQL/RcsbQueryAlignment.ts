import RcsbQuery from "./RcsbQuery";
import {RcsbAlignmentInterface} from "./RcsbAlignmentInterface";
import * as query from "./Queries/QueryAlignments.graphql";

export interface RequestAlignmentInterface {
    queryId: string;
    from: string;
    to: string;
    callBack: (n: RcsbAlignmentInterface)=>void;
}

interface AlignmentResponseInterface{
    alignment: RcsbAlignmentInterface;
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
