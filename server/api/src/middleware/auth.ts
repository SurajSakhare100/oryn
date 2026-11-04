import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../lib/jwt";

// Extend Request with our typed user
export interface AuthRequest extends Request {
  currentUser?: JwtPayload;
}

/**
 * Middleware to protect routes — requires a valid Bearer JWT.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: "Unauthorized: token expired or invalid" });
    return;
  }

  (req as AuthRequest).currentUser = payload;
  next();
}

/**
 * Middleware to optionally extract user — does not fail if no token.
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (payload) {
      (req as AuthRequest).currentUser = payload;
    }
  }
  next();
}
