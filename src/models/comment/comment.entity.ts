import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany
} from "typeorm";

import { User } from "../user/user.entity";
import { Author } from "../user/user.types";
import { Post } from "../post/post.entity";
import { CommentVote } from "../vote/vote.entity";

@ObjectType()
@Entity()
export class Comment {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  authorId: number;

  @Field(() => Author)
  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  @Field(() => Int)
  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: "CASCADE"
  })
  post: Post;

  @Field()
  @Column()
  body: string;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  rating: number;

  @Field(() => Int, { nullable: true })
  voteStatus: 1 | -1 | null;

  @OneToMany(() => CommentVote, (vote) => vote.comment)
  votes: CommentVote[];

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => Comment, (comment) => comment.children)
  parent: Comment; //parent comment

  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[]; //children comment

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
