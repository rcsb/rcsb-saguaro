import ApolloClient from 'apollo-boost';

export default class RcsbQueryAlignment{

    borregoClient: ApolloClient<any> = new ApolloClient({
        uri: 'http://bioinsilico.rcsb.org:8080/graphql'
    });

}
