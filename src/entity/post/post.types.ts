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
import { PageInfo, PaginationArgs, SortKeys } from "../../types";

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post])
  items: Post[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

@ArgsType()
export class GetPostsArgs extends PaginationArgs {
  @Field(() => SortKeys, { nullable: true })
  sortKey?: SortKeys;

  @Field(() => Int, { nullable: true })
  userId?: number;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => Int, { nullable: true })
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

  @Field(() => Int, { nullable: true })
  communityId?: number;
}
