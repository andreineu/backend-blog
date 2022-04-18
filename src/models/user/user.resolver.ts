import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from "type-graphql";

import { Service } from "typedi";

import {
  FollowAction,
  UserLoginArgs,
  UserRegisterArgs,
  UserResponse,
  UserUpdateArgs
} from "./user.types";

import { User } from "./user.entity";

import { UserService } from "./user.service";
import { MyContext } from "src/types";
import { logout } from "src/utils/auth";

import { IsAuth } from "src/utils/middleware/isAuth";

@Service()
@Resolver(User)
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  @FieldResolver(() => Int, { nullable: true })
  @UseMiddleware(IsAuth({ throwError: false, returnValue: null }))
  async followStatus(
    @Root() user: User,
    @Ctx() { req, loaders }: MyContext
  ) {
    const me = await loaders.user.load(req.session.userId);
    return me.followingUserIds.includes(user.id) ? 1 : null;
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(IsAuth({ returnValue: null, throwError: false }))
  async me(@Ctx() { req }: MyContext): Promise<User> {
    return this.userService.findById(req.session.userId)
  }

  @Query(() => User)
  async user(@Arg("username") username: string): Promise<User> {
    return this.userService.findByName(username)
  }

  @Mutation(() => UserResponse)
  async login(
    @Args(() => UserLoginArgs) args: UserLoginArgs,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    return this.userService.login(args, ctx)
  }

  @Mutation(() => UserResponse)
  async register(
    @Args(() => UserRegisterArgs) args: UserRegisterArgs,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    return this.userService.register(args, ctx)
  }

  @Mutation(() => Boolean)
  logout(@Ctx() ctx: MyContext) {
    return logout(ctx)
  }

  @Mutation(() => Boolean)
  updateUser(
    @Arg("userId", () => Int) userId: number,
    @Args(() => UserUpdateArgs) args: UserUpdateArgs,
    @Ctx() ctx: MyContext
  ) {
    this.userService.update(userId, args, ctx)
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth())
  async followCommunity(
    @Arg("communityId", () => Int) communityId: number,
    @Arg("action", () => FollowAction) action: FollowAction,
    @Ctx() ctx: MyContext
  ) {
    return await this.userService.followCommunity(communityId, action, ctx)
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth())
  async followUser(
    @Arg("userId", () => Int) userId: number,
    @Arg("action", () => FollowAction) action: FollowAction,
    @Ctx() ctx: MyContext
  ) {
    return await this.userService.followUser(userId, action, ctx)
  }
}
