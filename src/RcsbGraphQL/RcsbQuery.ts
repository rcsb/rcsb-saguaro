import ApolloClient from 'apollo-boost';
import * as configGraphQL from "../../codegen.json";

export default class RcsbQuery{

    borregoClient: ApolloClient<any> = new ApolloClient({
        uri: (<any>configGraphQL).schema
    });

}
