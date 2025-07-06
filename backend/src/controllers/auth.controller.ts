import { Request, Response } from "express";
import User from "../models/user.model";
import { generateToken, setCookies, storeRefreshToken } from "../config/token";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ENVVARS } from "../utils/envVars";
import { redis } from "../config/redis";
import { RequestType } from "../types";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateToken(user._id.toString());
    await storeRefreshToken(user._id.toString(), refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateToken(user._id.toString());
      await storeRefreshToken(user._id.toString(), refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        ENVVARS.REFRESH_TOKEN_SECRET
      ) as JwtPayload;
      await redis.del(`refresh_token:${decoded.userId}`);

      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      res.status(200).json({ message: "Logged out successfully" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

//this will refresh the access token

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }
    const decoded = jwt.verify(
      refreshToken,
      ENVVARS.REFRESH_TOKEN_SECRET
    ) as JwtPayload;
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      ENVVARS.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure: ENVVARS.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};

export const getProfile = async (
  req: RequestType,
  res: Response
): Promise<void> => {
  try {
    res.json(req.user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
  }
};
