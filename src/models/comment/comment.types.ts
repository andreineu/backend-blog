import { ArgsType, Field, Int } from "type-graphql";

@ArgsType()
export class CommentInputArgs {
  @Field()
  body: string;

  @Field(() => Int)
  postId: number;

  @Field(() => Int, { nullable: true })
  parentId?: number;
}