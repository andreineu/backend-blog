import DataLoader from "dataloader";
import { In } from "typeorm";
import { Post } from "../../entity/post";

export const postLoader = new DataLoader<number, Post>(async (postIds) => {
  const posts = await Post.findBy({ id: In(postIds as number[]) });
  const postsMap: Record<number, Post> = {};
  posts.forEach((u) => {
    postsMap[u.id] = u;
  });

  return postIds.map((id) => postsMap[id]);
});
