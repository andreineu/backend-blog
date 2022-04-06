import {
  Arg,
  Ctx,
  Field,
  ID,
  Int,
  Mutation,
  ObjectType,
  Resolver,
  UseMiddleware
} from "type-graphql";
import { Comment } from "../entity/comment";
import { Post } from "../entity/post";
import { CommentVote, PostVote } from "../entity/vote";
import { IsAuth } from "../utils/middleware/isAuth";
import { MyContext } from "../types";

@ObjectType()
class VoteResponse {
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => Boolean, { nullable: true })
  voted?: boolean;
}

@Resolver()
export class VoteResolver {
  @Mutation(() => VoteResponse, { nullable: true })
  @UseMiddleware(IsAuth())
  async votePost(
    @Arg("value", () => Int) value: number,
    @Arg("postId", () => ID) postId: number,
    @Ctx() { req }: MyContext
  ): Promise<VoteResponse> {
    const { userId } = req.session;
    const realVoteValue = value >= 1 ? 1 : -1;
    const oldVote = await PostVote.findOne({
      where: { postId, userId }
    });
    const alreadyVoted = !!oldVote;

    if (alreadyVoted) {
      if (oldVote.value === realVoteValue) {
        return {
          voted: false,
          message: `already ${realVoteValue === 1 ? "upvoted" : "downvoted"}`
        };
      }

      await PostVote.delete({
        userId,
        postId
      });
      await Post.update(postId, {
        rating: () => `rating + ${realVoteValue}`
      });
      return { voted: false, message: "changed vote status to undefined" };
    }

    await PostVote.insert({
      userId,
      postId,
      value: realVoteValue
    });
    await Post.update(postId, {
      rating: () => `rating + ${realVoteValue}`
    });
    return {
      voted: true,
      message: `changed vote status to ${
        realVoteValue === 1 ? "upvoted" : "downvoted"
      }`
    };
  }

  @Mutation(() => VoteResponse, { nullable: true })
  @UseMiddleware(IsAuth())
  async voteComment(
    @Arg("value", () => Int) value: number,
    @Arg("commentId", () => ID) commentId: number,
    @Ctx() { req }: MyContext
  ): Promise<VoteResponse> {
    const { userId } = req.session;
    const realVoteValue = value >= 1 ? 1 : -1;
    const oldVote = await CommentVote.findOne({
      where: { commentId, userId }
    });
    const alreadyVoted = !!oldVote;

    if (alreadyVoted) {
      if (oldVote.value === realVoteValue) {
        return {
          voted: false,
          message: `already ${realVoteValue === 1 ? "upvoted" : "downvoted"}`
        };
      }

      await CommentVote.delete({
        userId,
        commentId
      });
      await Comment.update(commentId, {
        rating: () => `rating + ${realVoteValue}`
      });
      return { voted: false, message: "changed vote status to undefined" };
    }

    await CommentVote.insert({
      userId,
      commentId,
      value: realVoteValue
    });
    await Comment.update(commentId, {
      rating: () => `rating + ${realVoteValue}`
    });
    return {
      voted: true,
      message: `changed vote status to ${
        realVoteValue === 1 ? "upvoted" : "downvoted"
      }`
    };
  }
}
