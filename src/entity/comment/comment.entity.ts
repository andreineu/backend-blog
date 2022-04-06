import { ObjectType, Field, Int, ID } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  AfterInsert
} from "typeorm";
import { Author, User } from "../user";
import { Post } from "../post";
import { CommentVote } from "../vote";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => ID)
  @Column()
  authorId: number;

  @Field(() => Author)
  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  @Field(() => ID)
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

  @Field(() => ID, { nullable: true })
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
