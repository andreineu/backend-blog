import "reflect-metadata";
import { DataSource } from "typeorm";

import { db_url, __prod__ } from "./constants";
import { injectRepositories } from "./di-setup";

import { Comment } from "./models/comment/comment.entity";
import { Community } from "./models/community/community.entity";
import { Post } from "./models/post/post.entity";

import { User } from "./models/user/user.entity";
import { CommentVote, PostVote } from "./models/vote/vote.entity";

import { CommentSubscriber } from "./subscribers/comment.subscriber";
import { PostSubscriber } from "./subscribers/post.subscriber";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: db_url,
  synchronize: false,
  logging: false,
  entities: [User, Post, PostVote, CommentVote, Comment, Community],
  migrations: ["./migrations/*.ts"],
  subscribers: [PostSubscriber, CommentSubscriber]
});

export const initializeConnection = async () => {
  await AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization:", err);
    });

  injectRepositories()

};
