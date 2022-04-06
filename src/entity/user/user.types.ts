import {
  ObjectType,
  Field,
  ArgsType,
  ID,
  registerEnumType
} from "type-graphql";
import { User } from ".";
import { FieldError } from "../../types";

@ObjectType()
export class Author {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;

  @Field(() => String)
  createdAt: Date;

  @Field({ nullable: true })
  avatar: string | null;
}

@ArgsType()
export class UserUpdateArgs {
  @Field({ nullable: true })
  avatar: string;
}

@ArgsType()
export class UserRegisterArgs {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}

@ArgsType()
export class UserLoginArgs {
  @Field()
  usernameOrEmail: string;

  @Field()
  password: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

export enum FollowAction {
  FOLLOW = "FOLLOW",
  UNFOLLOW = "UNFOLLOW"
}

registerEnumType(FollowAction, {
  name: "FollowAction"
});
