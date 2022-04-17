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
        message: "already voted"
      };
    }

    if (alreadyVoted) {

      AppDataSource.transaction(async (entityManager) => {
        try {
          await entityManager.delete(PostVote, {
            userId,
            postId,
          })
          const post = await entityManager.findOne(Post, {
            where: { id: postId },
            relations: { author: true }
          });


          post.author.rating -= realValue;
          post.rating -= realValue;
          post.author.save();
          post.save();

          return { voted: false, message: "removed vote" };
        } catch (error) {
          return { voted: false, message: "database error" };

        }
      })
      // await PostVote.remove(oldVote);
    }

    AppDataSource.transaction(async (entityManager) => {
      await entityManager.insert(PostVote, {
        userId,
        postId,
        value: realValue
      })
      const post = await entityManager.findOne(Post, {
        where: { id: postId },
        relations: { author: true }
      });

      post.author.rating += realValue;
      post.rating += realValue;
      post.author.save();
      post.save();

    })

    return {
      voted: true,
      message: realValue === 1 ? "upvoted" : "downvoted"
    };
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
        message: "already voted"
      };
    }
    if (alreadyVoted) {
      await CommentVote.remove(oldVote);
      return { voted: false, message: "removed vote" };
    }

    await CommentVote.insert({
      userId,
      commentId,
      value: realValue
    });

    return {
      voted: true,
      message: realValue === 1 ? "upvoted" : "downvoted"
    };
  }
}
