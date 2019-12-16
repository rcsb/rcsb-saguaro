import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';

interface AnnotationReferenceInterface {
    NCBI_GENOME: string;
    NCBI_PROTEIN: string;
    PDB_ENTITY: string;
    PDB_INSTANCE: string;
    UNIPROT: string;
}

interface AnnotationSourceInterface {
    PDB_ENTITY: string;
    PDB_INSTANCE: string;
    UNIPROT: string;
}

interface RequestAnnotationsInterface {
    queryId: string;
    reference: string;
    source: Array<string>;
    callBack: (n: any)=>void;
}

export default class RcsbQuery{

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

    borregoClient: ApolloClient<any> = new ApolloClient({
        uri: 'http://bioinsilico.rcsb.org:8080/graphql'
    });

    public requestAnnotations(requestConfig: RequestAnnotationsInterface): void{
        console.log(requestConfig.source);
        this.borregoClient.query({
            query:gql`query queryAnnotations($queryId: String!, $reference: AnnotationReference, $source:[AnnotationSource]){
                annotations(
                    queryId:$queryId
                    reference:$reference
                    sources:$source
                ){
                    items {
                        type
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
            requestConfig.callBack(result);
        }).catch(error => console.error(error));
    }
}