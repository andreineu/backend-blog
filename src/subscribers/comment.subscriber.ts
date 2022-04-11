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
    await event.manager.increment(
      Post,
      event.entity.postId,
      "totalComments",
      1
    );
  }

  async afterRemove(event: RemoveEvent<Comment>) {
    await event.manager.decrement(
      Post,
      event.entity.postId,
      "totalComments",
      1
    );
  }
}
