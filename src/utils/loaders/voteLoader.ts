import DataLoader from "dataloader";
import { In } from "typeorm";
import { PostVote, CommentVote } from "../../entity/vote";

type Keys = {
  postId: number;
  userId: number;
};

export const postVoteLoader = new DataLoader<Keys, PostVote>(async (keys) => {
  const votes = await PostVote.find({
    where: {
      postId: In(keys.map((k) => k.postId)),
      userId: In(keys.map((k) => k.userId))
    }
  });

  const votesMap: Record<string, PostVote> = {};

  votes.forEach((v) => {
    votesMap[`userId:${v.userId}|postId:${v.postId}`] = v;
  });

  return keys.map((k) => votesMap[`userId:${k.userId}|postId:${k.postId}`]);
});

type CKeys = {
  commentId: number;
  userId: number;
};

export const commentVoteLoader = new DataLoader<CKeys, CommentVote>(
  async (keys) => {
    const votes = await CommentVote.find({
      where: {
        commentId: In(keys.map((k) => k.commentId)),
        userId: In(keys.map((k) => k.userId))
      }
    });

    const votesMap: Record<string, CommentVote> = {};

    votes.forEach((v) => {
      votesMap[`userId:${v.userId}|commentId:${v.commentId}`] = v;
    });

    return keys.map(
      (k) => votesMap[`userId:${k.userId}|commentId:${k.commentId}`]
    );
  }
);
