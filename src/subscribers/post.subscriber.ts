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

  async afterInsert(event: InsertEvent<Post>) {
    await event.manager.increment(User, event.entity.authorId, "totalPosts", 1);

    if (!event.entity.communityId) return;

    await event.manager.increment(
      Community,
      event.entity.communityId,
      "totalPosts",
      1
    );
  }

  async afterRemove(event: RemoveEvent<Post>) {
    await event.manager.decrement(User, event.entity.authorId, "totalPosts", 1);

    if (!event.entity.communityId) return;

    await event.manager.decrement(
      Community,
      event.entity.communityId,
      "totalPosts",
      1
    );
  }
}
