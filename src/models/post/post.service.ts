import { Inject, Service } from "typedi";
import { Repository } from "typeorm";

import { GetPostsArgs, PaginatedPosts, PostInputArgs } from "./post.types";

import { Community } from "../community/community.entity";
import { User } from "../user/user.entity";
import { Post } from "../post/post.entity";

import { SortKeys } from "src/types";
import { CommunityRepositoryToken, PostRepositoryToken, UserRepositoryToken } from "src/constants";

@Service()
export class PostService {
  constructor(
    @Inject(PostRepositoryToken)
    private readonly postRepository: Repository<Post>,

    @Inject(UserRepositoryToken)
    private readonly userRepository: Repository<User>,

    @Inject(CommunityRepositoryToken)
    private readonly communityRepository: Repository<Community>
  ) { }

  async findOneById(id: number) {
    return this.postRepository.findOneBy({ id });
  }

  async create(args: PostInputArgs, authorId: number): Promise<boolean> {
    const { communityId } = args;

    const community = await this.communityRepository.findOneBy({
      id: communityId
    });
    try {
      await this.postRepository.insert({
        authorId,
        ...args,
        community
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async update(postId: number, args: PostInputArgs) {
    await this.postRepository.update(postId, args);
    return true;
  }

  async remove(post: Post) {
    await this.postRepository.remove(post);
    return true;
  }

  async paginatedPosts(args: GetPostsArgs): Promise<PaginatedPosts> {
    const { cursor, limit: userLimit, sortKey, username, communityName } = args;
    let { userId, communityId } = args;

    const limit = userLimit >= 1 && userLimit <= 50 ? userLimit : 10;
    const limitPlusOne = limit + 1;

    const qb = this.postRepository
      .createQueryBuilder("post")
      .select("post")
      .take(limitPlusOne)
      .orderBy("post.createdAt", "DESC");

    if (username && !userId) {
      const user = await this.userRepository.findOneBy({ username });
      userId = user.id;
    }
    if (userId) {
      qb.where("post.authorId = :userId", { userId });
    }
    if (communityName && !communityId) {
      const comm = await this.communityRepository.findOneBy({
        name: communityName
      });
      communityId = comm.id;
    }
    if (communityId) {
      qb.andWhere("post.communityId = :communityId", { communityId });
    }
    if (cursor && sortKey === SortKeys.CREATED_AT) {
      const cursorDate = new Date(parseInt(cursor));
      qb.andWhere("post.createdAt < :cursor", { cursor: cursorDate });
    }
    if (sortKey === SortKeys.RATING) {
      qb.orderBy("post.rating", "DESC");
      qb.andWhere("post.rating < :cursor", { cursor: +cursor || 999999 });
    }
    const posts = await qb.getMany();

    const hasNextPage = posts.length === limitPlusOne;

    const lastItem = posts[limit - 1];
    let endCursor: string = lastItem?.createdAt.getTime().toString() || "";
    if (sortKey === SortKeys.RATING) {
      endCursor = lastItem.rating.toString();
    }

    return {
      pageInfo: {
        hasNextPage,
        endCursor
      },
      items: posts.slice(0, limit)
    };
  }
}
