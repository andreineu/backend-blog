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

  afterInsert(event: InsertEvent<Comment>) {
    event.manager.increment(Post, event.entity.postId, "totalComments", 1);
  }

  afterRemove(event: RemoveEvent<Comment>): void | Promise<any> {
    event.manager.decrement(Post, event.entity.postId, "totalComments", 1);
  }
}
