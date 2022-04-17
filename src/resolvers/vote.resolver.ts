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

import { CommentVote, PostVote } from "../entity/vote";
import { IsAuth } from "../utils/middleware/isAuth";
import { MyContext } from "../types";
import { AppDataSource } from "../data-source";
import { Post } from "../entity/post";
import { Comment } from "../entity/comment";

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
    @Arg("postId", () => Int) postId: number,
    @Ctx() { req }: MyContext
  ): Promise<VoteResponse> {
    const { userId } = req.session;
    const realValue = value >= 1 ? 1 : -1;

    const oldVote = await PostVote.findOne({
      where: { postId, userId }
    });
    const alreadyVoted = !!oldVote;

    if (oldVote?.value === realValue) {
      return {
        voted: false,
        message: "invalid vote"
      };
    }

    return await AppDataSource.transaction(async (entityManager) => {
      if (alreadyVoted) {
        await entityManager.delete(PostVote, {
          userId,
          postId,
        })
      } else {
        await entityManager.insert(PostVote, {
          userId,
          postId,
          value: realValue
        })
      }
      const post = await entityManager.findOne(Post, {
        where: { id: postId },
        relations: { author: true }
      });

      post.author.rating += realValue;
      post.rating += realValue;
      post.author.save();
      post.save();

      if (alreadyVoted) return { voted: false, message: "removed vote" };

      return {
        voted: true,
        message: realValue === 1 ? "upvoted" : "downvoted"
      };
    }).catch(() => {
      return { voted: false, message: "database error" };
    })

  }

  @Mutation(() => VoteResponse, { nullable: true })
  @UseMiddleware(IsAuth())
  async voteComment(
    @Arg("value", () => Int) value: number,
    @Arg("commentId", () => Int) commentId: number,
    @Ctx() { req }: MyContext
  ): Promise<VoteResponse> {
    const { userId } = req.session;
    const realValue = value >= 1 ? 1 : -1;

    const oldVote = await CommentVote.findOne({
      where: { commentId, userId }
    });
    const alreadyVoted = !!oldVote;

    if (oldVote?.value === realValue) {
      return {
        voted: false,
        message: "invalid vote"
      };
    }

    return await AppDataSource.transaction(async (entityManager) => {
      if (alreadyVoted) {
        await entityManager.delete(CommentVote, {
          userId,
          commentId,
        })
      } else {
        await entityManager.insert(CommentVote, {
          userId,
          commentId,
          value: realValue
        })
      }

      const comment = await entityManager.findOne(Comment, {
        where: { id: commentId },
        relations: { author: true }
      })

      comment.author.rating += realValue;
      comment.rating += realValue;
      await comment.author.save();
      await comment.save();

      if (alreadyVoted) return { voted: false, message: "removed vote" };

      return {
        voted: true,
        message: realValue === 1 ? "upvoted" : "downvoted"
      };
    }).catch(() => {
      return { voted: false, message: "database error" };
    })
  }
}

