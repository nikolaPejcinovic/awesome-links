import { enumType, objectType } from "nexus";
import { Context } from "../context";
import { Link } from "./Link";

export const User = objectType({
  name: "User",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("email");
    t.string("image");
    t.field("role", { type: Role });
    t.list.field("bookmarks", {
      type: Link,
      resolve: async (parent, _args, ctx: Context) =>
        ctx.prisma.user.findUnique({ where: { id: parent.id } }).bookmarks(),
    });
  },
});

const Role = enumType({
  name: "Role",
  members: ["ADMIN", "USER"],
});
