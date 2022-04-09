import dotenv from "dotenv";

dotenv.config();

export const __prod__ = process.env.NODE_ENV === "production";

export const COOKIE_NAME = "qid";

export const SESSION_SECRET = process.env.SESSION_SECRET;

export const db_host = process.env.DB_HOST;
export const db_port = parseInt(process.env.DB_PORT);
export const db_username = process.env.DB_USERNAME;
export const db_password = process.env.DB_PASSWORD;
export const db_database = process.env.DB_DATABASE;
export const port = parseInt(process.env.PORT);
export const cors_origin = process.env.CORS_ORIGIN;
