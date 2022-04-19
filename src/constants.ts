import dotenv from "dotenv";
import { Token } from "typedi";
import { DataSource, Repository } from "typeorm";

import { Comment } from "./models/comment/comment.entity";
import { Community } from "./models/community/community.entity";
import { Post } from "./models/post/post.entity";
import { User } from "./models/user/user.entity";
import { CommentVote, PostVote } from "./models/vote/vote.entity";

dotenv.config();


export const __prod__ = process.env.NODE_ENV === "production";

export const COOKIE_NAME = "qid";

export const SESSION_SECRET = process.env.SESSION_SECRET;

export const db_url = process.env.DATABASE_URL;

export const redis_url = process.env.REDIS_URL

export const port = parseInt(process.env.PORT);

export const cors_origin = process.env.CORS_ORIGIN;

/**
 * tokens for injection repositories
 */

export const DataSourceToken = new Token<DataSource>("AppDataSource")

export const UserRepositoryToken = new Token<Repository<User>>("userRepository")

export const PostRepositoryToken = new Token<Repository<Post>>("postRepository")

export const CommentRepositoryToken = new Token<Repository<Comment>>("commentRepository")

export const CommunityRepositoryToken = new Token<Repository<Community>>("communityRepository")

export const PostVoteRepositoryToken = new Token<Repository<PostVote>>("postVoteRepository")

export const CommentVoteRepositoryToken = new Token<Repository<CommentVote>>("commentVoteRepository")