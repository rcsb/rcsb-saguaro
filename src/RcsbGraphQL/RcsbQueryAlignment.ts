import gql from 'graphql-tag';
import RcsbQuery from "./RcsbQuery";
import {ProteinSeqeunceAlignmentJson} from "./RcsbAlignmentInterface";

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
    callBack: (n: AlignmentListInterface)=>void;
}

export interface AlignmentListInterface{
    query_sequence: string;
    target_alignment: Array<ProteinSeqeunceAlignmentJson>;
}

interface AlignmentResponseInterface{
    alignment: AlignmentListInterface;
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
            query:gql`query queryAlignment($queryId: String!, $from: SequenceReference, $to:SequenceReference){
                alignment(
                    queryId:$queryId
                    from:$from
                    to:$to
                ){
                    query_sequence
                    target_alignment {
                        target_id
                        target_sequence
                        coverage {
                            query_coverage
                            query_length
                            target_coverage
                            target_length
                        }
                        aligned_regions {
                            query_begin
                            query_end
                            target_begin
                            target_end
                            exon_shift
                        }
                    }

                } 
            }`,
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
