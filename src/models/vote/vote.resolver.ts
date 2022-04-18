import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Resolver,
  UseMiddleware
} from "type-graphql";

import { Service } from "typedi";

import { IsAuth } from "src/utils/middleware/isAuth";
import { MyContext } from "src/types";
import { VoteService } from "./vote.service";

@ObjectType()
class VoteResponse {
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => Boolean, { nullable: true })
  voted?: boolean;
}

@Service()
@Resolver()
export class VoteResolver {
  constructor(private readonly voteService: VoteService) { }
  @Mutation(() => VoteResponse, { nullable: true })
  @UseMiddleware(IsAuth())
  async votePost(
    @Arg("value", () => Int) value: number,
    @Arg("postId", () => Int) postId: number,
    @Ctx() { req }: MyContext
  ): Promise<VoteResponse> {
    return this.voteService.votePost(value, postId, req.session.userId)

  }

  @Mutation(() => VoteResponse, { nullable: true })
  @UseMiddleware(IsAuth())
  async voteComment(
    @Arg("value", () => Int) value: number,
    @Arg("commentId", () => Int) commentId: number,
    @Ctx() { req }: MyContext
  ): Promise<VoteResponse> {
    return this.voteService.voteComment(value, commentId, req.session.userId)
  }
}

