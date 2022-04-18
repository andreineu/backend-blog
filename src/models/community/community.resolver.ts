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
  CommunityInput,
  CommunityUpdateArgs,
  getCommunitiesArgs,
  PaginatedCommunities,

} from "./community.types";

import { Community } from "./community.entity"

import { IsAuth } from "src/utils/middleware/isAuth";
import { CreateResponse, MyContext } from "src/types";
import { Service } from "typedi";
import { CommunityService } from "./community.service";

@Service()
@Resolver(Community)
export class CommunityResolver implements ResolverInterface<Community> {
  constructor(private readonly communityService: CommunityService) { }

  @FieldResolver(() => Int, { nullable: true })
  @UseMiddleware(IsAuth({ returnValue: null }))
  async followStatus(
    @Root() comm: Community,
    @Ctx() { req, loaders }: MyContext
  ) {
    const user = await loaders.user.load(req.session.userId);
    return user.followingCommunityIds.includes(comm.id) ? 1 : null;
  }

  @FieldResolver()
  async author(@Root() comm: Community, @Ctx() { loaders }: MyContext) {
    return await loaders.user.load(comm.authorId);
  }

  @Query(() => Community, { nullable: true })
  async community(@Arg("name") name: string): Promise<Community> {
    return this.communityService.findOneByName(name)
  }

  @Query(() => PaginatedCommunities)
  async communities(
    @Args(() => getCommunitiesArgs) args: getCommunitiesArgs
  ): Promise<PaginatedCommunities> {
    return this.communityService.paginatedCommunities(args)
  }

  @Mutation(() => CreateResponse)
  @UseMiddleware(IsAuth())
  async createCommunity(
    @Args(() => CommunityInput) args: CommunityInput,
    @Ctx() { req }: MyContext
  ): Promise<CreateResponse> {
    const created = await this.communityService.create(args, req.session.userId)

    if (created) return { created }

    return {
      errors: [{ field: "name", message: "this name is already taken" }]
    };
  }

  @Mutation(() => Boolean)
  async updateCommunity(
    @Arg("communityId", () => Int) communityId: number,
    @Args(() => CommunityUpdateArgs) args: CommunityUpdateArgs,
    @Ctx() { req, loaders }: MyContext
  ) {
    const userId = req.session.userId;
    if (!userId) return false;

    const comm = await this.communityService.findOneById(communityId)
    if (userId !== comm.authorId) return false;

    await this.communityService.update(communityId, args);
    loaders.community.clear(communityId);
    return true;
  }
}
