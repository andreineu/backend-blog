import { UserRegisterArgs } from "../models/user/user.types";

export const validateRegisterArgs = (args: UserRegisterArgs) => {
  if (!args.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email"
      }
    ];
  }

  if (args.username.length <= 2) {
    return [
      {
        field: "username",
        message: "length must be greater than 2"
      }
    ];
  }

  if (args.username.includes("@")) {
    return [
      {
        field: "username",
        message: "cannot include an @"
      }
    ];
  }

  if (args.password.length <= 2) {
    return [
      {
        field: "password",
        message: "length must be greater than 2"
      }
    ];
  }

  return null;
};

export const formatRegisterError = (err) => {
  //UQ_e12875dfb3b1d92d7d7c5377e22 duplicate email
  //UQ_78a916df40e02a9deb1c4b75edb duplicate username
  if (err.constraint === "UQ_e12875dfb3b1d92d7d7c5377e22") {
    return {
      errors: [
        {
          field: "email",
          message: "email already taken"
        }
      ]
    };
  } else if (err.constraint === "UQ_78a916df40e02a9deb1c4b75edb") {
    return {
      errors: [
        {
          field: "username",
          message: "username already taken"
        }
      ]
    };
  } else if (err.code === "23505") {
    return {
      errors: [
        {
          field: "username",
          message: "user with provided email or username already exists"
        }
      ]
    };
  }
};
