import {
  Arg,
  Args,
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

import { AppDataSource } from "../data-source";
import {
  GetPostsArgs,
  PaginatedPosts,
  Post,
  PostInputArgs
} from "../entity/post";
import { IsAuth } from "../utils/middleware/isAuth";
import { MyContext, SortKeys } from "../types";
import { User } from "../entity/user";
import { Community } from "../entity/community";

@Resolver((of) => Post)
export class PostResolver implements ResolverInterface<Post> {
  @FieldResolver(() => Int, { nullable: true })
  @UseMiddleware(IsAuth({ throwError: false, returnValue: null }))
  async voteStatus(
    @Root() post: Post,
    @Ctx() { req, postVoteLoader }: MyContext
  ) {
    const userId = req.session.userId;
    const vote = await postVoteLoader.load({ postId: post.id, userId });
    if (!vote) return null;
    return vote.value;
  }

  @FieldResolver()
  author(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.authorId);
  }

  @FieldResolver()
  community(@Root() post: Post, @Ctx() { communityLoader }: MyContext) {
    if (!post.communityId) return null;
    return communityLoader.load(post.communityId);
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => ID) id: number): Promise<Post> {
    const post = await Post.findOne({ where: { id } });
    return post;
  }

  @Query(() => [Post])
  async getAllPosts() {
    const posts = await Post.find({
      order: { createdAt: "DESC" }
    });
    return posts;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Args(() => GetPostsArgs) args: GetPostsArgs
  ): Promise<PaginatedPosts> {
    const { cursor, limit: userLimit, sortKey, username, communityName } = args;
    let { userId, communityId } = args;

    const limit = userLimit >= 1 && userLimit <= 50 ? userLimit : 10;
    const cursorDate = new Date(parseInt(cursor));

    const limitPlusOne = limit + 1;

    const qb = AppDataSource.getRepository(Post)
      .createQueryBuilder("post")
      .select("post")
      .orderBy("post.createdAt", "DESC")
      .take(limitPlusOne);

    if (sortKey === SortKeys.RATING) {
      qb.orderBy("post.rating", "DESC");
    }
    if (username && !userId) {
      userId = (await User.findOne({ where: { username } })).id;
    }
    if (userId) {
      qb.where("post.authorId = :userId", { userId });
    }
    if (communityName && !communityId) {
      const comm = await Community.findOne({ where: { name: communityName } });
      communityId = comm.id;
    }
    if (communityId) {
      qb.andWhere("post.communityId = :communityId", { communityId });
    }
    if (cursor) {
      qb.andWhere("post.createdAt < :cursor", { cursor: cursorDate });
    }

    const posts = await qb.getMany();
    const hasNextPage = posts.length === limitPlusOne;
    let endCursor = "";
    if (hasNextPage) endCursor = posts[limit - 1].createdAt.getTime() as any;

    return {
      pageInfo: {
        hasNextPage,
        endCursor
      },
      items: posts.slice(0, limit)
    };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth())
  async createPost(
    @Args(() => PostInputArgs) args: PostInputArgs,
    @Ctx() { req }: MyContext
  ) {
    const userId = req.session.userId;
    const { body, title, communityId } = args;
    await Post.insert({
      authorId: userId,
      body,
      title,
      communityId
    });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth())
  async updatePost(
    @Arg("postId", () => Int) postId: number,
    @Args(() => PostInputArgs) args: PostInputArgs,
    @Ctx() { req }: MyContext
  ) {
    const userId = req.session.userId;
    const post = await Post.findOne({ where: { id: postId } });
    if (post.authorId !== userId) return false;

    const { body, title, communityId = post.communityId } = args;
    await Post.update(postId, { body, title, communityId });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth())
  async deletePost(
    @Arg("postId", () => Int) postId: number,
    @Ctx() { req }: MyContext
  ) {
    const userId = req.session.userId;
    const post = await Post.findOne({ where: { id: postId } });
    if (post.authorId !== userId) return false;

    await Post.delete(postId);
    return true;
  }
}
