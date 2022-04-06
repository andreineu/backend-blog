import DataLoader from "dataloader";
import { In } from "typeorm";
import { User } from "../../entity/user";

export const userLoader = new DataLoader<number, User>(async (userIds) => {
  const users = await User.findBy({ id: In(userIds as number[]) });
  const usersMap: Record<number, User> = {};
  users.forEach((u) => {
    usersMap[u.id] = u;
  });

  return userIds.map((id) => usersMap[id]);
});
