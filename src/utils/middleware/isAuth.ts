import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../../types";

interface authMwOptions {
  returnValue?: any;
  throwError?: boolean;
  errorMessage?: string;
}
export const IsAuth = (
  options: authMwOptions = {
    errorMessage: "not authenticated",
    returnValue: undefined,
    throwError: true
  }
) => {
  const mwFn: MiddlewareFn<MyContext> = ({ context }, next) => {
    const valid = !!context?.req?.session?.userId;
    if (valid) return next();

    if (options.throwError === false) return options.returnValue;

    throw new Error(options.errorMessage);
  };
  return mwFn;
};
