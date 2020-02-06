import RcsbQuery from "./RcsbQuery";
import {AlignmentResponse} from "./RcsbAlignmentInterface";
import * as query from "./Queries/QueryAlignments.graphql";
//import {SequenceReference} from "./RcsbSequenceReferenceInterface";

export enum SequenceReference {
    PDB_ENTITY = "PDB_ENTITY",
    PDB_INSTANCE = "PDB_INSTANCE",
    UNIPROT = "UNIPROT",
    NCBI_GENOME = "NCBI_GENOME",
    NCBI_PROTEIN = "NCBI_PROTEIN"
}

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
