import DataLoader from "dataloader";
import Container, { Service, Inject } from "typedi";
import { Repository, In } from "typeorm";
import { Community, CommunityBase } from "../models/community/community.entity";
import { User } from "../models/user/user.entity";
import { CommentVote, PostVote } from "../models/vote/vote.entity";

type PostVoteLoaderKeys = {
  postId: number;
  userId: number;
};

type CommentVoteLoaderKeys = {
  commentId: number;
  userId: number;
};

export const createLoaders = () => {

  const userRepository: Repository<User> = Container.get("userRepository")

  const communityRepository: Repository<Community> = Container.get("communityRepository")

  const postVoteRepository: Repository<PostVote> = Container.get("postVoteRepository")

  const commentVoteRepository: Repository<CommentVote> = Container.get("commentVoteRepository")

  return {
    user: new DataLoader<number, User>(async (userIds) => {
      const users = await userRepository.findBy({
        id: In(userIds as number[])
      });

      const usersMap: Record<number, User> = {};

      users.forEach((u) => {
        usersMap[u.id] = u;
      });

      return userIds.map((id) => usersMap[id]);
    }),

    community: new DataLoader<number, CommunityBase>(async (commIds) => {
      const communities = await communityRepository.findBy({
        id: In(commIds as number[])
      });

      const communitiesMap: Record<number, Community> = {};

      communities.forEach((c) => (communitiesMap[c.id] = c));

      return commIds.map((id) => communitiesMap[id]);
    }),

    postVote: new DataLoader<PostVoteLoaderKeys, PostVote>(async (keys) => {
      const votes = await postVoteRepository.find({
        where: {
          postId: In(keys.map((k) => k.postId)),
          userId: In(keys.map((k) => k.userId))
        }
      });

      const votesMap: Record<number, PostVote> = {};

      votes.forEach((v) => {
        votesMap[`userId:${v.userId}|postId:${v.postId}`] = v;
      });

      return keys.map((k) => votesMap[`userId:${k.userId}|postId:${k.postId}`]);
    }),

    commentVote: new DataLoader<CommentVoteLoaderKeys, CommentVote>(
      async (keys) => {
        const votes = await commentVoteRepository.find({
          where: {
            commentId: In(keys.map((k) => k.commentId)),
            userId: In(keys.map((k) => k.userId))
          }
        });

        const votesMap: Record<number, CommentVote> = {};

        votes.forEach((v) => {
          votesMap[`userId:${v.userId}|commentId:${v.commentId}`] = v;
        });

        return keys.map(
          (k) => votesMap[`userId:${k.userId}|commentId:${k.commentId}`]
        );
      }
    )
  }
}

@Service()
export class Loaders {
  constructor(
    @Inject("userRepository")
    private readonly userRepository: Repository<User>,

    @Inject("communityRepository")
    private readonly communityRepository: Repository<Community>,

    @Inject("postVoteRepository")
    private readonly postVoteRepository: Repository<PostVote>,

    @Inject("commentVoteRepository")
    private readonly commentVoteRepository: Repository<CommentVote>

  ) { }

  readonly user = new DataLoader<number, User>(async (userIds) => {
    const users = await this.userRepository.findBy({
      id: In(userIds as number[])
    });

    const usersMap: Record<number, User> = {};

    users.forEach((u) => {
      usersMap[u.id] = u;
    });

    return userIds.map((id) => usersMap[id]);
  });

  readonly communityLoader = new DataLoader<number, CommunityBase>(async (commIds) => {
    const communities = await this.communityRepository.findBy({
      id: In(commIds as number[])
    });

    const communitiesMap: Record<number, Community> = {};

    communities.forEach((c) => (communitiesMap[c.id] = c));

    return commIds.map((id) => communitiesMap[id]);
  });

  readonly postVoteLoader = new DataLoader<PostVoteLoaderKeys, PostVote>(async (keys) => {
    const votes = await this.postVoteRepository.find({
      where: {
        postId: In(keys.map((k) => k.postId)),
        userId: In(keys.map((k) => k.userId))
      }
    });

    const votesMap: Record<number, PostVote> = {};

    votes.forEach((v) => {
      votesMap[`userId:${v.userId}|postId:${v.postId}`] = v;
    });

    return keys.map((k) => votesMap[`userId:${k.userId}|postId:${k.postId}`]);
  });

  readonly commentVoteLoader = new DataLoader<CommentVoteLoaderKeys, CommentVote>(
    async (keys) => {
      const votes = await this.commentVoteRepository.find({
        where: {
          commentId: In(keys.map((k) => k.commentId)),
          userId: In(keys.map((k) => k.userId))
        }
      });

      const votesMap: Record<number, CommentVote> = {};

      votes.forEach((v) => {
        votesMap[`userId:${v.userId}|commentId:${v.commentId}`] = v;
      });

      return keys.map(
        (k) => votesMap[`userId:${k.userId}|commentId:${k.commentId}`]
      );
    }
  );
}
