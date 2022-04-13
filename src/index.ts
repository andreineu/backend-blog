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

import connectRedis from "connect-redis";

import { AppDataSource } from "./data-source";
import { UserResolver } from "./resolvers/user";
import { PostResolver } from "./resolvers/post";

import {
  COOKIE_NAME,
  cors_origin,
  port,
  redis_url,
  SESSION_SECRET,
  __prod__
} from "./constants";
import { VoteResolver } from "./resolvers/vote";
import { userLoader } from "./utils/loaders/userLoader";
import { postVoteLoader, commentVoteLoader } from "./utils/loaders/voteLoader";

import { CommentResolver } from "./resolvers/comment";
import { CommunityResolver } from "./resolvers/community";
import { communityLoader } from "./utils/loaders/communityLoader";
;
import Redis from "ioredis"

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

  const RedisStore = connectRedis(session)
  const redisClient = new Redis(redis_url)

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redisClient, disableTTL: true }),
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
        httpOnly: false,
        secure: __prod__,
        domain: __prod__ ? ".andreineu.ru" : undefined,
        sameSite: "lax"
      },
      secret: SESSION_SECRET,
      resave: false
    })
  );

  app.get("/", (_req, res) => res.send("working 👍"));

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
