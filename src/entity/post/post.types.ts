import {
  ObjectType,
  Field,
  InputType,
  Int,
  registerEnumType,
  ArgsType,
  ID
} from "type-graphql";
import { Post } from ".";
import { pageInfo, PaginationArgs, SortKeys } from "../../types";

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post])
  items: Post[];
  @Field(() => pageInfo)
  pageInfo: pageInfo;
}

@ArgsType()
export class GetPostsArgs extends PaginationArgs {
  @Field(() => SortKeys, { nullable: true })
  sortKey?: SortKeys;

  @Field(() => ID, { nullable: true })
  userId?: number;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => ID, { nullable: true })
  communityId?: number;

  @Field(() => String, { nullable: true })
  communityName?: string;
}

@ArgsType()
export class PostInputArgs {
  @Field()
  body: string;

  @Field()
  title: string;

  @Field(() => ID, { nullable: true })
  communityId?: number;
}
