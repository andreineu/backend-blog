import { MiddlewareFn } from "type-graphql";
import { MyContext } from "src/types";

interface authMwOptions {
  /**
   * what value should return if not authenticated.
   * if specified won't throw error
   */
  returnValue?: any;

  /**
   * if should throw error.
   * by default set to true
   */
  throwError?: boolean;

  /**
   * what error message should throw.
   * by default throws `not authenticated`
   */
  errorMessage?: string;
}

export const IsAuth = (
  options: authMwOptions = {
    errorMessage: "not authenticated",
    throwError: true
  }
) => {
  const mwFn: MiddlewareFn<MyContext> = ({ context }, next) => {
    const valid = !!context?.req?.session?.userId;
    if (valid) return next();

    const { errorMessage, returnValue, throwError } = options

    if (throwError === false || typeof returnValue !== 'undefined') return options.returnValue;

    throw new Error(options.errorMessage);
  };
  return mwFn;
};
