import { ObjectType, Field } from "type-graphql";
import { Inject, Service } from "typedi";
import { Repository, DataSource } from "typeorm";
import { Comment } from "../comment/comment.entity";
import { Post } from "../post/post.entity";
import { User } from "../user/user.entity";
import { CommentVote, PostVote } from "./vote.entity";

@ObjectType()
class VoteResponse {
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => Boolean, { nullable: true })
  voted?: boolean;
}

@Service()
export class VoteService {
  constructor(
    @Inject("userRepository")
    private readonly userRepository: Repository<User>,

    @Inject("commentRepository")
    private readonly commentRepository: Repository<Comment>,

    @Inject("AppDataSource")
    private readonly AppDataSource: DataSource,

    @Inject("postVoteRepository")
    private readonly postVoteRepository: Repository<PostVote>,

    @Inject("postRepository")
    private readonly postRepository: Repository<Post>,

    @Inject("commentVoteRepository")
    private readonly commentVoteRepository: Repository<CommentVote>
  ) { }

  async votePost(
    value: number,
    postId: number,
    userId: number
  ): Promise<VoteResponse> {

    const realValue = value >= 1 ? 1 : -1;

    const oldVote = await this.postVoteRepository.findOne({
      where: { postId, userId }
    });
    const alreadyVoted = !!oldVote;

    if (oldVote?.value === realValue) {
      return {
        voted: false,
        message: "invalid vote"
      };
    }

    return await this.AppDataSource.transaction(async (entityManager) => {
      if (alreadyVoted) {
        await entityManager.delete(PostVote, {
          userId,
          postId
        });
      } else {
        await entityManager.insert(PostVote, {
          userId,
          postId,
          value: realValue
        });
      }
      const post = await entityManager.findOne(Post, {
        where: { id: postId },
        relations: { author: true }
      });

      post.author.rating += realValue;
      post.rating += realValue;
      this.userRepository.save(post.author);
      this.postRepository.save(post);

      if (alreadyVoted) return { voted: false, message: "removed vote" };

      return {
        voted: true,
        message: realValue === 1 ? "upvoted" : "downvoted"
      };
    }).catch(() => {
      return { voted: false, message: "database error" };
    });
  }

  async voteComment(
    value: number,
    commentId: number,
    userId: number
  ): Promise<VoteResponse> {

    const realValue = value >= 1 ? 1 : -1;

    const oldVote = await this.commentVoteRepository.findOne({
      where: { commentId, userId }
    });
    const alreadyVoted = !!oldVote;

    if (oldVote?.value === realValue) {
      return {
        voted: false,
        message: "invalid vote"
      };
    }

    return await this.AppDataSource.transaction(async (entityManager) => {
      if (alreadyVoted) {
        await entityManager.delete(CommentVote, {
          userId,
          commentId
        });
      } else {
        await entityManager.insert(CommentVote, {
          userId,
          commentId,
          value: realValue
        });
      }

      const comment = await entityManager.findOne(Comment, {
        where: { id: commentId },
        relations: { author: true }
      });

      comment.author.rating += realValue;
      comment.rating += realValue;
      await this.userRepository.save(comment.author);
      await this.commentRepository.save(comment);

      if (alreadyVoted) return { voted: false, message: "removed vote" };

      return {
        voted: true,
        message: realValue === 1 ? "upvoted" : "downvoted"
      };
    }).catch(() => {
      return { voted: false, message: "database error" };
    });
  }
}
