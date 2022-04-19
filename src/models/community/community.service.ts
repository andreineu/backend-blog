import { CommunityRepositoryToken, DataSourceToken } from "src/constants";
import { Inject, Service } from "typedi";
import { DataSource, Repository } from "typeorm";
import { Community } from "./community.entity"

import {
  CommunityInput,
  CommunitySortKeys,
  CommunityUpdateArgs,
  getCommunitiesArgs,
  PaginatedCommunities
} from "./community.types";

@Service()
export class CommunityService {
  constructor(
    @Inject(DataSourceToken)
    private readonly AppDataSource: DataSource,

    @Inject(CommunityRepositoryToken)
    private readonly communityRepository: Repository<Community>
  ) { }

  async findOneByName(name: string): Promise<Community> {
    return this.communityRepository.findOneBy({ name });
  }

  async findOneById(id: number): Promise<Community> {
    return this.communityRepository.findOneBy({ id })
  }

  async create(
    args: CommunityInput,
    authorId: number
  ): Promise<boolean> {
    try {
      await this.communityRepository.insert({ authorId, ...args })
      return true
    } catch (error) {
      return false
    }
  }

  async update(communityId: number, args: CommunityUpdateArgs) {
    return await this.communityRepository.update(communityId, args)
  }

  async paginatedCommunities(
    args: getCommunitiesArgs
  ): Promise<PaginatedCommunities> {
    const { cursor, limit: userLimit, sortKey } = args;

    const limit = userLimit >= 1 && userLimit <= 50 ? userLimit : 10;
    const limitPlusOne = limit + 1;

    const qb = this.AppDataSource.getRepository(Community)
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
}
