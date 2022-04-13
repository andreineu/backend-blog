import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent
} from "typeorm";
import { Comment } from "../entity/comment";
import { Post } from "../entity/post";

@EventSubscriber()
export class CommentSubscriber implements EntitySubscriberInterface<Comment> {
  listenTo() {
    return Comment;
  }

  async afterInsert(event: InsertEvent<Comment>) {
    const post = await event.manager.findOne(Post, { where: { id: event.entity.postId } })
    post.totalComments++
    post.save()
  }

  async afterRemove(event: RemoveEvent<Comment>) {
    const post = await event.manager.findOne(Post, { where: { id: event.entity.postId } })
    post.totalComments--
    post.save()

  }
}
