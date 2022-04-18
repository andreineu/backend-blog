import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  ResolverInterface,
  Root,
  UseMiddleware
} from "type-graphql";

import { CommentInputArgs } from "./comment.types";
import { Comment } from "./comment.entity";

import { IsAuth } from "src/utils/middleware/isAuth";
import { MyContext } from "src/types";
import { Service } from "typedi";
import { CommentService } from "./comment.service";

@Service()
@Resolver(Comment)
export class CommentResolver implements ResolverInterface<Comment> {
  constructor(private readonly commentService: CommentService) { }

  @FieldResolver()
  async author(@Root() comment: Comment, @Ctx() { loaders }: MyContext) {
    const users = await loaders.user.load(comment.authorId);
    return users;
  }

  @FieldResolver()
  @UseMiddleware(IsAuth({ throwError: false, returnValue: null }))
  async voteStatus(
    @Root() comment: Comment,
    @Ctx() { req, loaders }: MyContext
  ) {
    const vote = await loaders.commentVote.load({
      commentId: comment.id,
      userId: req.session.userId
    });
    if (!vote) return null;
    return vote.value;
  }

  @Query(() => [Comment])
  async comments(@Arg("postId", () => Int) postId: number) {
    return this.commentService.getByPostId(postId);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth())
  async writeComment(
    @Args(() => CommentInputArgs) args: CommentInputArgs,
    @Ctx()
    { req }: MyContext
  ): Promise<Boolean> {
    return this.commentService.create(req.session.userId, args);
  }
}
