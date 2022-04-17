import { ApolloServerExpressConfig } from "apollo-server-express";
import { buildSchema, NonEmptyArray } from "type-graphql";

import { CommentResolver } from "./resolvers/comment.resolver";
import { CommunityResolver } from "./resolvers/community.resolver";
import { PostResolver } from "./resolvers/post.resolver";
import { UserResolver } from "./resolvers/user.resolver";
import { VoteResolver } from "./resolvers/vote.resolver";

import { communityLoader } from "./utils/loaders/communityLoader";
import { userLoader } from "./utils/loaders/userLoader";
import { postVoteLoader, commentVoteLoader } from "./utils/loaders/voteLoader";

import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";

export const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
  UserResolver,
  PostResolver,
  VoteResolver,
  CommentResolver,
  CommunityResolver
]

export const createApolloConfig = async (): Promise<ApolloServerExpressConfig> => ({
  schema: await buildSchema({ resolvers }),
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
})