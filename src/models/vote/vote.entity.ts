import { ObjectType } from "type-graphql";
import { Entity, Column, ManyToOne, PrimaryColumn } from "typeorm";

import { Post } from "../post/post.entity";
import { User } from "../user/user.entity";
import { Comment } from "../comment/comment.entity";

@ObjectType()
@Entity()
class BaseVote {
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
