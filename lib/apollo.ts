import { ApolloClient, InMemoryCache } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";

const apolloClient = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
  cache:
    process.env.NODE_ENV === "production"
      ? new InMemoryCache({
          typePolicies: {
            Query: {
              fields: {
                links: relayStylePagination(),
              },
            },
          },
        })
      : new InMemoryCache(),
});

export default apolloClient;
