import dotenv from "dotenv";

dotenv.config();

export const __prod__ = process.env.NODE_ENV === "production";

export const COOKIE_NAME = "qid";

export const SESSION_SECRET = process.env.SESSION_SECRET;

export const db_url = process.env.DATABASE_URL;

export const redis_url = process.env.REDIS_URL

export const port = parseInt(process.env.PORT);

export const cors_origin = process.env.CORS_ORIGIN;
