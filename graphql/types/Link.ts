import { Role } from "@prisma/client";
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { Context } from "../context";
import { User } from "./User";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("title");
    t.nonNull.string("url");
    t.nonNull.string("description");
    t.nonNull.string("imageUrl");
    t.nonNull.string("category");
    t.list.field("users", {
      type: User,
      resolve: async (parent, _args, ctx: Context) =>
        await ctx.prisma.link.findUnique({ where: { id: parent.id } }).users(),
    });
  },
});

export const Edge = objectType({
  name: "Edge",
  definition(t) {
    t.string("cursor");
    t.field("node", {
      type: Link,
    });
  },
});

export const PageInfo = objectType({
  name: "PageInfo",
  definition(t) {
    t.string("endCursor");
    t.boolean("hasNextPage");
  },
});

export const Response = objectType({
  name: "Response",
  definition(t) {
    t.field("pageInfo", { type: PageInfo });
    t.list.field("edges", { type: Edge });
  },
});

export const LinksQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("links", {
      type: Response,
      args: {
        first: intArg(),
        after: stringArg(),
      },
      resolve: async (_, args, ctx: Context) => {
        let queryResults = null;

        if (args.after) {
          queryResults = await ctx.prisma.link.findMany({
            take: args.first,
            skip: 1,
            cursor: {
              id: args.after,
            },
          });
        } else {
          queryResults = await ctx.prisma.link.findMany({
            take: args.first,
          });
        }

        if (queryResults.length > 0) {
          const lastLinkInResults = queryResults[queryResults.length - 1];
          const myCursor = lastLinkInResults.id;

          const secondQueryResults = await ctx.prisma.link.findMany({
            take: args.first,
            cursor: {
              id: myCursor,
            },
            // orderBy: {
            //   index: 'asc'
            // }
          });

          return {
            pageInfo: {
              endCursor: myCursor,
              hasNextPage: secondQueryResults.length >= args.first,
            },
            edges: queryResults.map((link) => ({
              cursor: link.id,
              node: link,
            })),
          };
        }

        return {
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
          edges: [],
        };
      },
    });
  },
});

export const CreateLinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createLink", {
      type: Link,
      args: {
        title: nonNull(stringArg()),
        url: nonNull(stringArg()),
        description: nonNull(stringArg()),
        imageUrl: nonNull(stringArg()),
        category: nonNull(stringArg()),
      },
      resolve: async (_, args, ctx: Context) => {
        if (!ctx.user) {
          throw new Error(`You need to be logged in to perform an action`);
        }

        const user = await ctx.prisma.user.findUnique({
          where: {
            email: ctx.user.email,
          },
        });

        if (user.role !== Role.ADMIN) {
          throw new Error("Must be an admin");
        }

        return await ctx.prisma.link.create({
          data: { ...args },
        });
      },
    });
  },
});
