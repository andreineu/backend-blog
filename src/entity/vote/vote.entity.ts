import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import { Post } from "../post";
import { User } from "../user";

import { Comment } from "../comment";

@ObjectType()
@Entity()
class BaseVote extends BaseEntity {
  @Column()
  value: 1 | -1;
}

@ObjectType()
@Entity()
export class PostVote extends BaseVote {
  @PrimaryColumn()
  postId: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.postVotes)
  user: User;

  @ManyToOne(() => Post, (post) => post.votes, {
    onDelete: "CASCADE"
  })
  post: Post;
}

@ObjectType()
@Entity()
export class CommentVote extends BaseVote {
  @PrimaryColumn()
  commentId: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.commentVotes)
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.votes, {
    onDelete: "CASCADE"
  })
  comment: Comment;
}
