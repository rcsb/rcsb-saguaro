import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';

export interface RequestTranslateInterface {
    entryId: string;
    asymId: string;
    callBack: (n: any)=>void;
}

export default class RcsbInstanceToEntity{

    yosemiteClient: ApolloClient<any> = new ApolloClient({
        uri: 'http://data-staging.rcsb.org/graphql'
    });

    public request(requestConfig: RequestTranslateInterface): void {
        this.yosemiteClient.query({
            query: gql`query queryInstanceToEntity($entryId: String! $asymId: String!){
                polymer_entity_instance(
                    entry_id:$entryId
                    asym_id:$asymId
                ){
                    rcsb_polymer_entity_instance_container_identifiers {
                        entity_id
                    }
                }
            }`,
            variables: {
                entryId: requestConfig.entryId,
                asymId: requestConfig.asymId
            }
        }).then(result => {
            requestConfig.callBack(result);
        }).catch(error => console.error(error));
    }
}