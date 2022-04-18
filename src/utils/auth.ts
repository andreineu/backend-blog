import { compare, hash } from "bcrypt";
import { COOKIE_NAME } from "../constants";
import { MyContext } from "../types";

export const hashPassword = async (password: string) => {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
};

export const isPasswordValid = async (
  password: string,
  hashedPassword: string
) => {
  const isValid = await compare(password, hashedPassword);
  return isValid;
};

export const logout = ({ req, res }: MyContext) => {
  return new Promise((resolve) =>
    req.session.destroy((err) => {
      res.clearCookie(COOKIE_NAME);
      if (err) {
        resolve(false);
        return;
      }

      resolve(true);
    })
  );
}