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

import {
  Community,
  CommunityInput,
  CommunityUpdateArgs,
  getCommunitiesArgs,
  PaginatedCommunities,
  CommunitySortKeys
} from "../entity/community";

import { IsAuth } from "../utils/middleware/isAuth";
import { CreateResponse, MyContext } from "../types";
import { AppDataSource } from "../data-source";

@Resolver(Community)
export class CommunityResolver implements ResolverInterface<Community> {
  @FieldResolver(() => Int, { nullable: true })
  @UseMiddleware(IsAuth({ throwError: false, returnValue: null }))
  async followStatus(
    @Root() comm: Community,
    @Ctx() { req, userLoader }: MyContext
  ) {
    const uid = req.session.userId;
    const user = await userLoader.clear(uid).load(uid);

    const status = user.followingCommunityIds.includes(comm.id) ? 1 : null;
    return status;
  }

  @FieldResolver()
  async author(@Root() comm: Community, @Ctx() { userLoader }: MyContext) {
    return await userLoader.load(comm.authorId);
  }

  @Query(() => Community, { nullable: true })
  async community(@Arg("name") name: string): Promise<Community> {
    const community = await Community.findOne({
      where: { name }
    });
    return community;
  }

  @Query(() => PaginatedCommunities)
  async communities(
    @Args(() => getCommunitiesArgs) args: getCommunitiesArgs
  ): Promise<PaginatedCommunities> {
    const { cursor, limit: userLimit, sortKey } = args;

    const limit = userLimit >= 1 && userLimit <= 50 ? userLimit : 10;
    const limitPlusOne = limit + 1;

    const qb = AppDataSource.getRepository(Community)
      .createQueryBuilder("community")
      .select("community")
      .take(limitPlusOne)
      .orderBy("community.createdAt", "DESC");

    if (cursor && sortKey === CommunitySortKeys.CREATED_AT) {
      const cursorDate = new Date(parseInt(cursor));
      qb.andWhere("community.createdAt < :cursor", { cursor: cursorDate });
    }

    if (sortKey === CommunitySortKeys.FOLLOWER_COUNT) {
      qb.orderBy("community.", "DESC");
      qb.andWhere("community.totalUsers < :cursor", {
        cursor: +cursor || 999999
      });
    }

    const communities = await qb.getMany();
    const hasNextPage = communities.length === limitPlusOne;

    const lastItem = communities[limit - 1];
    let endCursor: string = lastItem?.createdAt.getTime().toString() || "";

    if (sortKey === CommunitySortKeys.FOLLOWER_COUNT) {
      endCursor = lastItem.totalUsers.toString();
    }
    if (hasNextPage)
      endCursor = communities[limit - 1].createdAt.getTime() as any;

    return {
      pageInfo: {
        hasNextPage,
        endCursor
      },
      items: communities.slice(0, limit)
    };
  }

  @Mutation(() => CreateResponse)
  @UseMiddleware(IsAuth())
  async createCommunity(
    @Args(() => CommunityInput) args: CommunityInput,
    @Ctx() { req }: MyContext
  ): Promise<CreateResponse> {
    const authorId = req.session.userId;

    try {
      await Community.create({ authorId, ...args }).save();
    } catch (error) {
      if (error.code !== "23505") throw error;
      return {
        errors: [{ field: "name", message: "this name is already taken" }]
      };
    }
    return { created: true };
  }

  @Mutation(() => Boolean)
  async updateCommunity(
    @Arg("communityId", () => Int) communityId: number,
    @Args(() => CommunityUpdateArgs) args: CommunityUpdateArgs,
    @Ctx() { req, communityLoader }: MyContext
  ) {
    const uid = req.session.userId;
    if (!uid) return false;

    const comm = await Community.findOne({ where: { id: communityId } });
    if (uid !== comm.authorId) return false;

    await Community.update(communityId, args);
    communityLoader.clear(communityId);
    return true;
  }
}
