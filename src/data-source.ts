import "reflect-metadata";
import { DataSource } from "typeorm";

import { db_url } from "./constants";

import { Comment } from "./entity/comment";
import { Community } from "./entity/community";
import { Post } from "./entity/post";
import { User } from "./entity/user";
import { CommentVote, PostVote } from "./entity/vote";

import { CommentSubscriber } from "./subscribers/comment.subscriber";
import { PostSubscriber } from "./subscribers/post.subscriber";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: db_url,
  synchronize: false,
  logging: false,
  entities: [User, Post, PostVote, CommentVote, Comment, Community],
  migrations: ["./migrations/*.ts"],
  subscribers: [
    PostSubscriber,
    CommentSubscriber,

  ]
  // logger: "advanced-console"
});
