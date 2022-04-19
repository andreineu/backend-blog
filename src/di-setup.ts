import Container from "typedi";
import {
  CommentRepositoryToken,
  CommentVoteRepositoryToken,
  CommunityRepositoryToken,
  DataSourceToken,
  PostRepositoryToken,
  PostVoteRepositoryToken,
  UserRepositoryToken
} from "./constants";
import { AppDataSource } from "./data-source";
import { Comment } from "./models/comment/comment.entity";
import { Community } from "./models/community/community.entity";
import { Post } from "./models/post/post.entity";
import { User } from "./models/user/user.entity";
import { PostVote, CommentVote } from "./models/vote/vote.entity";

/**
 * inject after initializing connection
 */
export const injectRepositories = () => {

  Container.set(DataSourceToken, AppDataSource);

  const userRepository = AppDataSource.getRepository(User);
  Container.set(UserRepositoryToken, userRepository);

  const postRepository = AppDataSource.getRepository(Post);
  Container.set(PostRepositoryToken, postRepository);

  const commentRepository = AppDataSource.getRepository(Comment);
  Container.set(CommentRepositoryToken, commentRepository);

  const communityRepository = AppDataSource.getRepository(Community);
  Container.set(CommunityRepositoryToken, communityRepository);

  const postVoteRepository = AppDataSource.getRepository(PostVote);
  Container.set(PostVoteRepositoryToken, postVoteRepository);

  const commentVoteRepository = AppDataSource.getRepository(CommentVote);
  Container.set(CommentVoteRepositoryToken, commentVoteRepository);
};
