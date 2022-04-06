import { ObjectType, Field, ArgsType } from "type-graphql";
import { Community } from ".";
import { pageInfo, PaginationArgs } from "../../types";

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
  @Field(() => pageInfo)
  pageInfo: pageInfo;
}

@ArgsType()
export class getCommunitiesArgs extends PaginationArgs {}
