import { PrismaClient } from "@prisma/client";
import prisma from "../lib/prisma";
import { Claims, getSession } from "@auth0/nextjs-auth0";

export type Context = {
  user?: Claims;
  accessToken?: string;
  prisma: PrismaClient;
};

export const createContext = async (req, res): Promise<Context> => {
  const session = await getSession(req, res);

  if (!session) return { prisma };

  const { user, accessToken } = session;

  return {
    user,
    accessToken,
    prisma,
  };
};
