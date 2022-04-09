import "reflect-metadata";
import { DataSource } from "typeorm";

import {
  db_database,
  db_host,
  db_password,
  db_port,
  db_username
} from "./constants";

import { Comment } from "./entity/comment";
import { Community } from "./entity/community";
import { Post } from "./entity/post";
import { User } from "./entity/user";
import { CommentVote, PostVote } from "./entity/vote";

import { CommentSubscriber } from "./subscribers/comment.subscriber";
import { PostSubscriber } from "./subscribers/post.subscriber";
import {
  CommentVoteSubscriber,
  PostVoteSubscriber
} from "./subscribers/vote.subscriber";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: db_host,
  port: db_port,
  username: db_username,
  password: db_password,
  database: db_database,
  synchronize: true,
  logging: false,
  entities: [User, Post, PostVote, CommentVote, Comment, Community],
  migrations: ["./migrations/*.ts"],
  subscribers: [
    PostSubscriber,
    PostVoteSubscriber,
    CommentSubscriber,
    CommentVoteSubscriber
  ]
  // logger: "advanced-console"
});
