import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import cors from "cors";
import session from "express-session";

import connectRedis from "connect-redis";

import Redis from "ioredis"

import { AppDataSource, initializeConnection } from "./data-source";

import {
  COOKIE_NAME,
  cors_origin,
  port,
  redis_url,
  SESSION_SECRET,
  __prod__
} from "./constants";

import { createApolloConfig } from "./apollo";

async function main() {
  await initializeConnection()

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

  const apolloConfig = await createApolloConfig()

  const apolloServer = new ApolloServer(apolloConfig);

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(port, () => {
    console.log("express server started");
  });
}

main();
