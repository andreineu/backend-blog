import "reflect-metadata";

import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";

import cors from "cors";

import session from "express-session";
import { TypeormStore } from "typeorm-store";

import { AppDataSource } from "./data-source";
import { UserResolver } from "./resolvers/user";
import { PostResolver } from "./resolvers/post";

import {
  COOKIE_NAME,
  cors_origin,
  port,
  SESSION_SECRET,
  __prod__
} from "./constants";
import { VoteResolver } from "./resolvers/vote";
import { userLoader } from "./utils/loaders/userLoader";
import { postVoteLoader, commentVoteLoader } from "./utils/loaders/voteLoader";

import { CommentResolver } from "./resolvers/comment";
import { CommunityResolver } from "./resolvers/community";
import { communityLoader } from "./utils/loaders/communityLoader";
import { Session } from "./entity/session";

async function main() {
  await AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization:", err);
    });
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: cors_origin,
      credentials: true
    })
  );

  const sessionRepository = Session.getRepository();
  const sessionStore = new TypeormStore({ repository: sessionRepository });

  app.use(
    session({
      name: COOKIE_NAME,
      store: sessionStore,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
        httpOnly: true,
        domain: __prod__ ? "app.vercel" : undefined,
        secure: __prod__,
        sameSite: __prod__ ? "none" : undefined
      },
      secret: SESSION_SECRET,
      resave: false
    })
  );

  app.get("/", (_req, res) => res.send("hello"));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        PostResolver,
        VoteResolver,
        CommentResolver,
        CommunityResolver
      ]
    }),
    context: ({ req, res }) => ({
      req,
      res,
      userLoader,
      postVoteLoader,
      commentVoteLoader,
      communityLoader
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({}),
      ApolloServerPluginLandingPageDisabled()
    ]
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(port, () => {
    console.log("express server started");
  });
}

main();
