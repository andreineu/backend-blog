import { ObjectType, Field, ArgsType, registerEnumType } from "type-graphql";
import { Community } from "./community.entity";
import { PageInfo, PaginationArgs } from "src/types";

@ArgsType()
export class CommunityInput {
  @Field()
  name: string;

  @Field()
  summary: string;

  @Field()
  rules: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ArgsType()
export class CommunityUpdateArgs {
  @Field({ nullable: true })
  summary?: string;

  @Field({ nullable: true })
  rules?: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType()
export class PaginatedCommunities {
  @Field(() => [Community])
  items: Community[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

export enum CommunitySortKeys {
  FOLLOWER_COUNT = "followerCount",
  CREATED_AT = "createdAt"
}

registerEnumType(CommunitySortKeys, {
  name: "CommunitySortKeys"
});

@ArgsType()
export class getCommunitiesArgs extends PaginationArgs {
  @Field(() => CommunitySortKeys, { nullable: true })
  sortKey?: CommunitySortKeys;
}
