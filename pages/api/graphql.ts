import { ApolloServer } from "apollo-server-micro";
import Cors from "micro-cors";
import { resolvers } from "../../graphql/resolvers";
import { typeDefs } from "../../graphql/schema";

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

const startServer = apolloServer.start();

const cors = Cors();

const handler = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Headers"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, PATCH, DELETE, OPTIONS, HEAD"
  );
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  await startServer;

  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
};

export default cors(handler);

export const config = {
  api: {
    bodyParse: false,
  },
};
