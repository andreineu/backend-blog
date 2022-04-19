import { CommentRepositoryToken } from "src/constants";
import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { Comment } from "./comment.entity";
import { CommentInputArgs } from "./comment.types";

@Service()
export class CommentService {
  constructor(
    @Inject(CommentRepositoryToken)
    private readonly commentRepository: Repository<Comment>
  ) { }

  async getByPostId(postId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { postId },
      order: { createdAt: "ASC" }
    });
  }

  async create(authorId: number, args: CommentInputArgs): Promise<Boolean> {
    await this.commentRepository.insert({
      authorId,
      ...args
    });
    return true;
  }
}
