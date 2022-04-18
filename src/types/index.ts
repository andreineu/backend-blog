import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import {
  ObjectType,
  Field,
  registerEnumType,
  ArgsType,
  Int
} from "type-graphql";
import { createLoaders } from "../utils/loaders";

export type MyContext = {
  req: Request & {
    session: Session & Partial<SessionData> & { userId: number };
  };
  res: Response;

  loaders: ReturnType<typeof createLoaders>;
};

@ObjectType()
export class PageInfo {
  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => String)
  endCursor: string;
}

export enum SortKeys {
  RATING = "rating",
  CREATED_AT = "createdAt"
}

registerEnumType(SortKeys, {
  name: "SortKeys"
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
