import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent
} from "typeorm";
import { Comment } from "../models/comment/comment.entity";
import { Post } from "../models/post/post.entity";

@EventSubscriber()
export class CommentSubscriber implements EntitySubscriberInterface<Comment> {
  listenTo() {
    return Comment;
  }

  async afterInsert(event: InsertEvent<Comment>) {
    const post = await event.manager.findOne(Post, {
      where: { id: event.entity.postId }
    });
    post.totalComments++;
    await event.manager.save(post);
  }

  async afterRemove(event: RemoveEvent<Comment>) {
    const post = await event.manager.findOne(Post, {
      where: { id: event.entity.postId }
    });
    post.totalComments--;
    await event.manager.save(post);
  }
}
