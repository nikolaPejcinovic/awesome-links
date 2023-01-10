import { gql, useQuery } from "@apollo/client";
import Head from "next/head";
import { NexusGenRootTypes } from "nexus-typegen";
import { AwesomeLink } from "../components/AwesomeLink";

const AllLinksQuery = gql`
  query ($first: Int, $after: String) {
    links(first: $first, after: $after) {
      edges {
        node {
          id
          title
          url
          description
          imageUrl
          category
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export default function Home() {
  const { data, loading, error, fetchMore } = useQuery<{
    links: NexusGenRootTypes["Response"];
  }>(AllLinksQuery, { variables: { first: 2 } });

  if (loading) return <p>Loading</p>;

  if (error) return <p>Error</p>;

  const { endCursor, hasNextPage } = data.links.pageInfo;

  return (
    <div>
      <Head>
        <title>Awesome Links</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto max-w-5xl my-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.links.edges.map(({ node }) => (
            <AwesomeLink key={node.id} {...node} />
          ))}
        </div>
        {hasNextPage ? (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded ny-10"
            onClick={() =>
              fetchMore({
                variables: { after: endCursor },
                updateQuery: (previousQueryResult, { fetchMoreResult }) => ({
                  ...fetchMoreResult,
                  links: {
                    ...fetchMoreResult.links,
                    edges: [
                      ...previousQueryResult.links.edges,
                      ...fetchMoreResult.links.edges,
                    ],
                  },
                }),
              })
            }
          >
            more
          </button>
        ) : (
          <p className="my=10 text-center font-medium">
            You have reached the end
          </p>
        )}
      </div>
    </div>
  );
}
