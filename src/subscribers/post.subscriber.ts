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

    const community = await event.manager.findOne(Community, { where: { id: event.entity.communityId } })
    community.totalPosts++
    community.save()

  }

  async afterRemove(event: RemoveEvent<Post>) {
    await event.manager.decrement(User, event.entity.authorId, "totalPosts", 1);

    if (!event.entity.communityId) return;

    const community = await event.manager.findOne(Community, { where: { id: event.entity.communityId } })
    community.totalPosts--
    community.save()
  }
}
