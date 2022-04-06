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

import {
  Community,
  CommunityInput,
  CommunityUpdateArgs,
  getCommunitiesArgs,
  PaginatedCommunities
} from "../entity/community";

import { IsAuth } from "../utils/middleware/isAuth";
import { CreateResponse, FieldError, MyContext } from "../types";
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
  author(@Root() comm: Community, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(comm.authorId);
  }

  @Query(() => Community)
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
    const { cursor, limit: userLimit } = args;

    const limit = userLimit >= 1 && userLimit <= 50 ? userLimit : 10;
    const cursorDate = new Date(parseInt(cursor));

    const limitPlusOne = limit + 1;

    const qb = AppDataSource.getRepository(Community)
      .createQueryBuilder("community")
      .select("community")
      .orderBy("community.createdAt", "DESC")
      .take(limitPlusOne);

    if (cursor) {
      qb.andWhere("community.createdAt < :cursor", { cursor: cursorDate });
    }

    const communities = await qb.getMany();
    const hasNextPage = communities.length === limitPlusOne;
    let endCursor = "";
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
    const { userId } = req.session;

    try {
      await Community.create({
        authorId: userId,
        ...args
      }).save();
    } catch (error) {
      if (error.code === "23505")
        return {
          errors: [{ field: "name", message: "this name is already taken" }]
        };
    }
    return { created: true };
  }

  @Mutation(() => Boolean)
  async updateCommunity(
    @Arg("communityId", () => ID) communityId: number,
    @Args(() => CommunityUpdateArgs) args: CommunityUpdateArgs,
    @Ctx() { req }: MyContext
  ) {
    const uid = req.session.userId;
    if (!uid) return false;

    const comm = await Community.findOne({ where: { id: communityId } });
    if (uid !== comm.authorId) return false;

    Community.update(communityId, args);
    return true;
  }
}
