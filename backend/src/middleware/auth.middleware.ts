import type { NextFunction, Response } from "express";
import type { RequestType } from "../types";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ENVVARS } from "../utils/envVars";
import User from "../models/user.model";

export const protectRoute = async (
  req: RequestType,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res
        .status(401)
        .json({ message: "Unauthorized - No access token provided" });
      return;
    }

    try {
      const decoded = jwt.verify(
        accessToken,
        ENVVARS.ACCESS_TOKEN_SECRET
      ) as JwtPayload;
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "TokenExpiredError") {
          res
            .status(401)
            .json({ message: "Unauthorized - Access token expired" });
          return;
        }
        throw error;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unexpected error occurred" });
    }
    console.log("Error in protectRoute middleware", error);
  }
};

export const adminRoute = (
  req: RequestType,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Acess denided - Admin only" });
    return;
  }
};
