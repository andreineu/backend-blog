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


import { Post } from "./post.entity";
import { PostService } from "./post.service";
import { GetPostsArgs, PaginatedPosts, PostInputArgs } from "./post.types";

import { IsAuth } from "src/utils/middleware/isAuth";
import { MyContext } from "src/types";

import { Service } from "typedi";

@Service()
@Resolver((of) => Post)
export class PostResolver implements ResolverInterface<Post> {
  constructor(private readonly postService: PostService) { }

  @FieldResolver(() => Int, { nullable: true })
  @UseMiddleware(IsAuth({ throwError: false, returnValue: null }))
  async voteStatus(@Root() post: Post, @Ctx() { req, loaders }: MyContext) {
    const vote = await loaders.postVote.load({
      postId: post.id,
      userId: req.session.userId
    });
    if (!vote) return null;
    return vote.value;
  }

  @FieldResolver()
  author(@Root() post: Post, @Ctx() { loaders }: MyContext) {
    return loaders.user.load(post.authorId);
  }

  @FieldResolver()
  community(@Root() post: Post, @Ctx() { loaders }: MyContext) {
    if (!post.communityId) return null;
    return loaders.community.load(post.communityId);
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post> {
    return await this.postService.findOneById(id);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Args(() => GetPostsArgs) args: GetPostsArgs
  ): Promise<PaginatedPosts> {
    return this.postService.paginatedPosts(args);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth())
  async createPost(
    @Args(() => PostInputArgs) args: PostInputArgs,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    return this.postService.create(args, req.session.userId);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth())
  async updatePost(
    @Arg("postId", () => Int) postId: number,
    @Args(() => PostInputArgs) args: PostInputArgs,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await this.postService.findOneById(postId);
    if (post.authorId !== req.session.userId) return false;
    return this.postService.update(postId, args);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth())
  async deletePost(
    @Arg("postId", () => Int) postId: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const post = await this.postService.findOneById(postId);
    if (post.authorId !== req.session.userId) return false;
    return this.postService.remove(post);
  }
}
