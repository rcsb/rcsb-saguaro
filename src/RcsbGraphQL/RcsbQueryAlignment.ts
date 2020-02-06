import RcsbQuery from "./RcsbQuery";
import {AlignmentResponse} from "./RcsbAlignmentInterface";
import * as query from "./Queries/QueryAlignments.graphql";
import {SequenceReference} from "./RcsbSequenceReferenceInterface";

export interface SequenceReferenceInterface {
    PDB_ENTITY: string;
    PDB_INSTANCE: string;
    UNIPROT: string;
    NCBI_GENOME: string;
    NCBI_PROTEIN: string;
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

    readonly sequenceReference:SequenceReferenceInterface = {
        NCBI_GENOME: "NCBI_GENOME",
        NCBI_PROTEIN: "NCBI_PROTEIN",
        PDB_ENTITY: "PDB_ENTITY",
        PDB_INSTANCE: "PDB_INSTANCE",
        UNIPROT: "UNIPROT"
    };

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
