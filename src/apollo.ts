import { ApolloServerExpressConfig } from "apollo-server-express";
import { buildSchema, NonEmptyArray } from "type-graphql";

import { CommentResolver } from "./models/comment/comment.resolver";
import { CommunityResolver } from "./models/community/community.resolver";
import { PostResolver } from "./models/post/post.resolver";
import { UserResolver } from "./models/user/user.resolver";
import { VoteResolver } from "./models/vote/vote.resolver";

import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";

import { Container } from "typedi"

import { createLoaders } from "./utils/loaders";

export const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
  UserResolver,
  PostResolver,
  VoteResolver,
  CommentResolver,
  CommunityResolver
]

export const createApolloConfig = async (): Promise<ApolloServerExpressConfig> => ({
  schema: await buildSchema({ resolvers, container: Container }),
  context: ({ req, res }) => ({
    req,
    res,
    loaders: createLoaders()
  }),
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({}),
    ApolloServerPluginLandingPageDisabled()
  ]
})