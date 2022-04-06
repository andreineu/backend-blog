import "reflect-metadata";
import { DataSource } from "typeorm";
import { Comment } from "./entity/comment";
import { Community } from "./entity/community";
import { Post } from "./entity/post";
import { User } from "./entity/user";
import { CommentVote, PostVote } from "./entity/vote";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "1734",
  database: "pern-fullstack-example",
  synchronize: true,
  logging: true,
  entities: [User, Post, PostVote, CommentVote, Comment, Community],
  migrations: [],
  subscribers: []
  // logger: "advanced-console"
});
