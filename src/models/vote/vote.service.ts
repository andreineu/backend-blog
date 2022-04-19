import { CommentVoteRepositoryToken, DataSourceToken, PostVoteRepositoryToken } from "src/constants";
import { ObjectType, Field } from "type-graphql";
import { Inject, Service } from "typedi";
import { Repository, DataSource, EntityManager } from "typeorm";
import { Comment } from "../comment/comment.entity";
import { Post } from "../post/post.entity";
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
    @Inject(DataSourceToken)
    private readonly AppDataSource: DataSource,

    @Inject(PostVoteRepositoryToken)
    private readonly postVoteRepository: Repository<PostVote>,

    @Inject(CommentVoteRepositoryToken)
    private readonly commentVoteRepository: Repository<CommentVote>
  ) { }

  async votePost(
    value: 1 | -1,
    postId: number,
    userId: number
  ): Promise<VoteResponse> {
    try {
      const oldVote = await this.postVoteRepository.findOne({
        where: { postId, userId }
      });

      if (oldVote.value === value)
        return {
          voted: false,
          message: "invalid vote"
        };

      if (oldVote.value) {
        await this.removePostVote(postId, userId, value);
        return { voted: false, message: "removed vote" };
      }

      await this.createPostVote({ value, postId, userId });

      return {
        voted: true,
        message: value === 1 ? "upvoted" : "downvoted"
      };
    } catch {
      return { voted: false, message: "database error" };
    }
  }

  async voteComment(
    value: 1 | -1,
    commentId: number,
    userId: number
  ): Promise<VoteResponse> {
    try {
      const oldVote = await this.commentVoteRepository.findOneBy({
        commentId,
        userId
      });

      if (oldVote.value === value)
        return {
          voted: false,
          message: "invalid vote"
        };

      if (oldVote.value) {
        await this.removeCommentVote(commentId, userId, value);
        return { voted: false, message: "removed vote" };
      }

      await this.createCommentVote({
        value: value,
        userId,
        commentId
      });
      return {
        voted: true,
        message: value === 1 ? "upvoted" : "downvoted"
      };
    } catch {
      return { voted: false, message: "database error" };
    }
  }



  /**
   * inserts and updates `rating` counters
   */
  private async createPostVote(fields: {
    value: 1 | -1;
    postId: number;
    userId: number;
  }): Promise<void> {
    await this.AppDataSource.transaction(async (entityManager) => {
      await entityManager.insert(PostVote, fields);
      await this.incrementPostCounters(
        entityManager,
        fields.value,
        fields.postId
      );
    });
  }

  private async createCommentVote(fields: {
    value: 1 | -1;
    commentId: number;
    userId: number;
  }): Promise<void> {
    await this.AppDataSource.transaction(async (entityManager) => {
      await entityManager.insert(CommentVote, fields);
      await this.incrementCommentCounters(
        entityManager,
        fields.value,
        fields.commentId
      );
    });
  }

  /**
   * removes and updates `rating` counters
   */
  private async removePostVote(
    postId: number,
    userId: number,
    value: 1 | -1
  ): Promise<void> {
    await this.AppDataSource.transaction(async (entityManager) => {
      await entityManager.delete(PostVote, {
        userId,
        postId
      });
      await this.incrementPostCounters(entityManager, value, postId);
    });
  }

  private async removeCommentVote(
    commentId: number,
    userId: number,
    value: 1 | -1
  ): Promise<void> {
    await this.AppDataSource.transaction(async (entityManager) => {
      await entityManager.delete(CommentVote, {
        userId,
        commentId
      });
      await this.incrementCommentCounters(entityManager, value, commentId);
    });
  }

  /**
   * increments comment's and comment author's `rating` columnns
   */
  private async incrementPostCounters(
    entityManager: EntityManager,
    value: 1 | -1,
    postId: number
  ) {
    const post = await entityManager.findOne(Post, {
      where: { id: postId },
      relations: { author: true }
    });

    post.author.rating += value;
    post.rating += value;
    await entityManager.save([post.author, post]);
  }

  private async incrementCommentCounters(
    entityManager: EntityManager,
    value: 1 | -1,
    commentId: number
  ) {
    const comment = await entityManager.findOne(Comment, {
      where: { id: commentId },
      relations: { author: true }
    });

    comment.author.rating += value;
    comment.rating += value;
    await entityManager.save([comment.author, comment]);
  }
}
