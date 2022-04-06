import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
  ResolverInterface,
  Root,
  UseMiddleware
} from "type-graphql";

import { Comment } from "../entity/comment";

import { IsAuth } from "../utils/middleware/isAuth";
import { MyContext } from "../types";
import { Post } from "../entity/post";

@Resolver(Comment)
export class CommentResolver implements ResolverInterface<Comment> {
  //TODO: delete this query - devonly
  @Query(() => [Comment])
  async getComments() {
    const comments = await Comment.find();
    return comments;
  }

  @FieldResolver()
  async author(@Root() comment: Comment, @Ctx() { userLoader }: MyContext) {
    const users = await userLoader.load(comment.authorId);
    return users;
  }

  @FieldResolver()
  @UseMiddleware(IsAuth({ throwError: false, returnValue: null }))
  async voteStatus(
    @Root() comment: Comment,
    @Ctx() { req, commentVoteLoader: loader }: MyContext
  ) {
    const { userId } = req.session;
    const vote = await loader.load({ commentId: comment.id, userId });
    if (!vote) return null;
    return vote.value;
  }

  @Query(() => [Comment])
  async comments(@Arg("postId", () => ID) postId: number) {
    const comments = await Comment.find({
      where: { postId },
      order: { createdAt: "ASC" }
    });
    return comments;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth())
  async writeComment(
    @Arg("body", () => String) body: string,
    @Arg("postId", () => ID) postId: number,
    @Arg("parentId", () => ID, { nullable: true }) parentId: number | null,
    @Ctx()
    { req }: MyContext
  ): Promise<Boolean> {
    const { userId } = req.session;
    await Comment.insert({
      authorId: userId,
      postId,
      body,
      parentId
    });
    await Post.getRepository().increment({ id: postId }, "totalComments", 1);
    return true;
  }
}
