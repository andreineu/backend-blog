import "reflect-metadata";
import "dotenv";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";

import cors from "cors";

import { createClient } from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

import { AppDataSource } from "./data-source";
import { UserResolver } from "./resolvers/user";
import { PostResolver } from "./resolvers/post";

import { COOKIE_NAME, __prod__ } from "./constants";
import { VoteResolver } from "./resolvers/vote";
import { userLoader } from "./utils/loaders/UserLoader";
import { postVoteLoader, commentVoteLoader } from "./utils/loaders/voteLoader";

import { CommentResolver } from "./resolvers/comment";
import { postLoader } from "./utils/loaders/PostLoader";
import { CommunityResolver } from "./resolvers/community";
import { communityLoader } from "./utils/loaders/communityLoader";

async function main() {
  await AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization:", err);
    });
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true
    })
  );

  const redisClient = createClient();
  const RedisStore = connectRedis(session);

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
        httpOnly: true,
        secure: __prod__
      },
      secret: "arhiuoe",
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
      postLoader,
      communityLoader
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({}),
      ApolloServerPluginLandingPageDisabled()
    ]
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("express server started");
  });
}

main();
