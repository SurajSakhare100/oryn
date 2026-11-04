import { Router, Request, Response } from "express";
import passport from "../lib/passport";
import { signToken } from "../lib/jwt";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { config } from "../config";

const router = Router();

/**
 * GET /api/auth/google
 * Redirect to Google OAuth consent screen.
 */
router.get(
  "/google",
  (_req, res, next) => {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
      res.status(503).send("Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the API server.");
      return;
    }
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback — issues a JWT and redirects to frontend.
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${config.CLIENT_URL}/auth/error`,
  }),
  (req: Request, res: Response) => {
    const user = req.user as any;

    if (!user) {
      res.redirect(`${config.CLIENT_URL}/auth/error`);
      return;
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    // Redirect to frontend with token as query param
    // Frontend should store it in memory/localStorage and remove from URL
    res.redirect(
      `${config.CLIENT_URL}/auth/callback?token=${token}&userId=${user.id}`
    );
  }
);

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile.
 */
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const user = await prisma.user.findUnique({
      where: { id: authReq.currentUser!.sub },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error("[Auth /me]", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

/**
 * POST /api/auth/logout
 * Stateless logout — client should discard the token.
 */
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
