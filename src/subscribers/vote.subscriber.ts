import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent
} from "typeorm";

import { PostVote, CommentVote } from "../entity/vote";
import { Post } from "../entity/post";
import { Comment } from "../entity/comment";

@EventSubscriber()
export class PostVoteSubscriber implements EntitySubscriberInterface<PostVote> {
  listenTo() {
    return PostVote;
  }

  async afterInsert(event: InsertEvent<PostVote>) {
    const post = await event.manager.findOne(Post, {
      where: { id: event.entity.postId },
      relations: { author: true }
    });

    post.author.rating += event.entity.value;
    post.rating += event.entity.value;
    post.author.save();
    post.save();
  }
  async beforeRemove(event: RemoveEvent<PostVote>) {
    const post = await event.manager.findOne(Post, {
      where: { id: event.entity.postId },
      relations: { author: true }
    });

    post.author.rating -= event.entity.value;
    post.rating -= event.entity.value;
    post.author.save();
    post.save();
  }
}

@EventSubscriber()
export class CommentVoteSubscriber
  implements EntitySubscriberInterface<CommentVote>
{
  listenTo() {
    return CommentVote;
  }

  async afterInsert(event: InsertEvent<CommentVote>) {
    const comment = await event.manager.findOne(Comment, {
      where: { id: event.entity.commentId },
      relations: { author: true }
    });

    comment.author.rating += event.entity.value;
    comment.rating += event.entity.value;
    await comment.author.save();
    await comment.save();
  }

  async beforeRemove(event: RemoveEvent<CommentVote>) {
    const comment = await event.manager.findOne(Comment, {
      where: { id: event.entity.commentId },
      relations: { author: true }
    });

    comment.author.rating -= event.entity.value;
    comment.rating -= event.entity.value;
    await comment.author.save();
    await comment.save();
  }
}
