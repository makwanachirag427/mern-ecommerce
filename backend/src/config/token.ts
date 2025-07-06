import jwt from "jsonwebtoken";
import { ENVVARS } from "../utils/envVars";
import { redis } from "./redis";
import { Response } from "express";

export const generateToken = (
  userId: string
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign({ userId }, ENVVARS.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, ENVVARS.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const storeRefreshToken = async (
  userId: string,
  refreshToken: string
): Promise<void> => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60 * 1000
  );
};

export const setCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
    secure: ENVVARS.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: ENVVARS.NODE_ENV === "production",
    sameSite: "strict",
  });
};
