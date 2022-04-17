import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import cors from "cors";
import { createClient } from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

import { AppDataSource } from "./data-source";

import {
  COOKIE_NAME,
  cors_origin,
  port,
  SESSION_SECRET,
  __prod__
} from "./constants";

import { createApolloConfig } from "./apollo";

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
      origin: cors_origin,
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
      secret: SESSION_SECRET,
      resave: false
    })
  );

  app.get("/", (_req, res) => res.send("hello"));

  const apolloConfig = await createApolloConfig()

  const apolloServer = new ApolloServer(apolloConfig);

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(port, () => {
    console.log("express server started");
  });
}

main();
