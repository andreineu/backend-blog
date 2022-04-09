import DataLoader from "dataloader";
import { In } from "typeorm";
import { Community, CommunityBase } from "../../entity/community";

export const communityLoader = new DataLoader<number, CommunityBase>(
  async (commIds) => {
    const communities = await Community.findBy({ id: In(commIds as number[]) });

    const map: Record<number, Community> = {};

    communities.forEach((c) => (map[c.id] = c));

    return commIds.map((id) => map[id]);
  }
);
