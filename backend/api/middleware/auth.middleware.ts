import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
import env from "../config/env";
import { UserRole } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
    fullName: string;
  };
}

interface JwtPayload {
  sub: string;  // Changed from 'id' to 'sub' to match token generation
  role: UserRole;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth middleware: Missing or invalid authorization header");
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Auth middleware: Token received", token.substring(0, 20) + "...");

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    console.log("Auth middleware: Token decoded successfully", { sub: decoded.sub, role: decoded.role });

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },  // Changed from decoded.id to decoded.sub
    });

    if (!user || user.status !== "ACTIVE") {
      console.log("Auth middleware: User not found or inactive", { user: !!user, status: user?.status });
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };

    console.log("Auth middleware: User authenticated successfully", { id: user.id, email: user.email });
    next();
  } catch (error) {
    console.log("Auth middleware: Token verification failed", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};