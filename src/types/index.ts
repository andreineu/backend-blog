import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import {
  ObjectType,
  Field,
  registerEnumType,
  ArgsType,
  Int
} from "type-graphql";
import { communityLoader } from "../utils/loaders/communityLoader";

import { postLoader } from "../utils/loaders/PostLoader";
import { userLoader } from "../utils/loaders/UserLoader";
import { postVoteLoader, commentVoteLoader } from "../utils/loaders/voteLoader";

export type MyContext = {
  req: Request & {
    session: Session & Partial<SessionData> & { userId: number };
  };
  res: Response;
  userLoader: typeof userLoader;
  postLoader: typeof postLoader;
  postVoteLoader: typeof postVoteLoader;
  commentVoteLoader: typeof commentVoteLoader;
  communityLoader: typeof communityLoader;
};

@ObjectType()
export class pageInfo {
  @Field(() => Boolean)
  hasNextPage: boolean;
  @Field(() => String)
  endCursor: string;
}

export enum SortKeys {
  RATING = "rating",
  CREATEDAT = "createdAt"
}

registerEnumType(SortKeys, {
  name: "SortKeys",
  description: "basic sort keys"
});

@ArgsType()
export class PaginationArgs {
  @Field(() => Int)
  limit: number;

  @Field(() => String, { nullable: true })
  cursor: string | null;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
export class CreateResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => Boolean, { nullable: true })
  created?: boolean;
}
