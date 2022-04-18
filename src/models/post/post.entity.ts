import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  RelationId
} from "typeorm";

import { User } from "../user/user.entity";
import { PostVote } from "../vote/vote.entity";
import { Comment } from "../comment/comment.entity";
import { Community, CommunityBase } from "../community/community.entity";

import { Author } from "../user/user.types";

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  authorId: number;

  @Field(() => Author)
  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @Field(() => Int, { nullable: true })
  @RelationId((post: Post) => post.community)
  communityId: number;

  @Field(() => CommunityBase, { nullable: true })
  @ManyToOne(() => Community, (comm) => comm.posts)
  community: CommunityBase;

  @OneToMany(() => PostVote, (vote) => vote.post)
  votes: PostVote[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  body: string;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  rating: number;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  totalComments: number;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  totalViews: number;

  @Field(() => Int, { nullable: true })
  voteStatus: 1 | -1 | null; // 1 or -1 or null
  // voteStatus: number | null; // 1 or -1 or null

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
