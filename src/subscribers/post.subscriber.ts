import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent
} from "typeorm";
import { Community } from "../entity/community";
import { Post } from "../entity/post";
import { User } from "../entity/user";

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
  listenTo() {
    return Post;
  }

  afterInsert(event: InsertEvent<Post>) {
    event.manager.increment(User, event.entity.authorId, "totalPosts", 1);

    if (event.entity.communityId) {
      event.manager.increment(
        Community,
        event.entity.communityId,
        "totalPosts",
        1
      );
    }
  }

  afterRemove(event: RemoveEvent<Post>): void | Promise<any> {
    event.manager.decrement(User, event.entity.authorId, "totalPosts", 1);

    if (event.entity.communityId) {
      event.manager.decrement(
        Community,
        event.entity.communityId,
        "totalPosts",
        1
      );
    }
  }
}
