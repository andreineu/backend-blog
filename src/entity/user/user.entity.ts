import { Field, ID, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
  CreateDateColumn,
  RelationId,
  ManyToMany,
  JoinTable
} from "typeorm";
import { Post } from "../post";

import { PostVote, CommentVote } from "../vote";
import { Comment } from "../comment";
import { Community } from "../community";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("text", { unique: true })
  username: string;

  @Field()
  @Column("text", { unique: true })
  email: string;

  @Column("text")
  password: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar: string | null;

  @RelationId((user: User) => user.posts)
  postIds: number[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @RelationId((user: User) => user.communities)
  communityIds: number[];

  @OneToMany(() => Community, (c) => c.author)
  communities: Community[];

  /**
   * subscription for communities
   */

  @RelationId((user: User) => user.followingCommunities)
  followingCommunityIds: number[];

  @ManyToMany(() => Community, (c) => c.followers, { cascade: true })
  @JoinTable()
  followingCommunities: Community[];

  /**
   * subscription to user relationship
   * (subscribers and subscriptions to users)
   */

  @RelationId((user: User) => user.followingUsers)
  followingUserIds: number[];

  @ManyToMany(() => User, (user) => user.subscribers, { cascade: true })
  @JoinTable()
  followingUsers: User[];

  @RelationId((user: User) => user.subscribers)
  subscriberIds: number[];

  @ManyToMany(() => User, (user) => user.followingUsers)
  subscribers: User[];

  /**
   *  votes
   */

  @OneToMany(() => CommentVote, (vote) => vote.user)
  commentVotes: CommentVote[];

  @OneToMany(() => PostVote, (vote) => vote.user)
  postVotes: PostVote[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}
