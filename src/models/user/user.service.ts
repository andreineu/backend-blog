import { Inject, Service } from "typedi";
import { DataSource, Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { Community } from "../community/community.entity";
import { User } from "./user.entity";
import {
  FollowAction,
  UserLoginArgs,
  UserRegisterArgs,
  UserUpdateArgs
} from "./user.types";
import { MyContext } from "src/types";
import { hashPassword, isPasswordValid } from "src/utils/auth";
import {
  validateRegisterArgs,
  formatRegisterError
} from "src/utils/validations";

@Service()
export class UserService {
  constructor(
    @Inject("userRepository")
    private readonly userRepository: Repository<User>,

    @Inject("AppDataSource")
    private readonly AppDataSource: DataSource,

    @Inject("communityRepository")
    private readonly communityRepository: Repository<Community>
  ) { }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  async findByName(username: string): Promise<User> {
    return this.userRepository.findOneBy({ username });
  }

  async update(
    userId: number,
    args: UserUpdateArgs,
    { req }: MyContext
  ): Promise<boolean> {
    if (req.session.userId !== userId) return false;

    await this.userRepository.update(userId, args);

    return true;
  }

  async login(args: UserLoginArgs, { req }: MyContext) {
    const { usernameOrEmail, password } = args;

    const user = await this.userRepository.findOneBy(
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );

    if (!user) {
      return {
        errors: [{ field: "usernameOrEmail", message: "user does not exist" }]
      };
    }

    const valid = await isPasswordValid(password, user.password);

    if (!valid) {
      return { errors: [{ field: "password", message: "wrong password" }] };
    }

    req.session.userId = user.id;
    return { user };
  }

  async register(args: UserRegisterArgs, { req }: MyContext) {
    const { email, password, username } = args;

    const errors = validateRegisterArgs(args);

    if (errors) return { errors };

    const hashedPassword = await hashPassword(password);

    try {
      const user = this.userRepository.create({
        username,
        email,
        password: hashedPassword
      });

      this.userRepository.save(user);

      req.session.userId = user.id;
      return { user };
    } catch (err) {
      return formatRegisterError(err);
    }
  }

  async followUser(
    creatorId: number,
    action: FollowAction,
    { req, loaders }: MyContext
  ): Promise<Boolean> {
    return await this.AppDataSource.transaction(async (entityManager) => {
      if (req.session.userId === creatorId) return false;
      loaders.user.clear(req.session.userId);

      const user = await entityManager.findOne(User, {
        where: { id: req.session.userId },
        relations: { followingUsers: true }
      });

      const creator = await entityManager.findOneBy(User, { id: creatorId });

      if (!creator || !user) return false;

      if (action === FollowAction.UNFOLLOW) {
        if (!user.followingUserIds.includes(creatorId)) return false;

        user.followingUsers = user.followingUsers.filter(
          (u) => u.id !== creatorId
        );
        creator.totalFollowers--;
        this.userRepository.save(user);
        this.userRepository.save(creator);

        return true;
      }

      if (user.followingUserIds.includes(creatorId)) return false;

      user.followingUsers = [...(user.followingUsers || []), creator];
      creator.totalFollowers++;
      this.userRepository.save(user);
      this.userRepository.save(creator);

      return true;
    }).catch(() => false);
  }

  async followCommunity(
    communityId: number,
    action: FollowAction,
    { req, loaders }: MyContext
  ) {
    return await this.AppDataSource.transaction(async (entityManager) => {
      const user = await entityManager.findOne(User, {
        where: { id: req.session.userId },
        relations: { followingCommunities: true }
      });

      const community = await entityManager.findOneBy(Community, {
        id: communityId
      });

      if (!community || !user) return false;

      if (community.authorId === req.session.userId) return false;

      loaders.user.clear(req.session.userId);

      if (action === FollowAction.UNFOLLOW) {
        if (!user.followingCommunityIds.includes(communityId)) return false;

        user.followingCommunities = user.followingCommunities.filter(
          (c) => c.id !== communityId
        );
        community.totalUsers--;
        this.userRepository.save(user);
        this.communityRepository.save(community);
        return true;
      }

      if (user.followingCommunityIds.includes(communityId)) return false;

      user.followingCommunities = [
        ...(user.followingCommunities || []),
        community
      ];
      community.totalUsers++;
      this.userRepository.save(user);
      this.communityRepository.save(community);
      return true;
    }).catch(() => false);
  }
}
