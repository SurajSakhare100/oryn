import { Router, Request, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/users/me
 * Get the authenticated user's full profile.
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
        _count: { select: { conversations: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error("[Users GET /me]", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * PATCH /api/users/me
 * Update the authenticated user's username.
 */
router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "username is required" });
    return;
  }

  const sanitized = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  if (sanitized.length < 3 || sanitized.length > 32) {
    res.status(400).json({ error: "Username must be 3–32 characters" });
    return;
  }

  try {
    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { username: sanitized, NOT: { id: authReq.currentUser!.sub } },
    });

    if (existing) {
      res.status(409).json({ error: "Username is already taken" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: authReq.currentUser!.sub },
      data: { username: sanitized },
      select: { id: true, email: true, username: true, avatarUrl: true, createdAt: true },
    });

    res.json(updated);
  } catch (err) {
    console.error("[Users PATCH /me]", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/**
 * DELETE /api/users/me
 * Delete the authenticated user account and all their data.
 */
router.delete("/me", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    await prisma.user.delete({ where: { id: authReq.currentUser!.sub } });
    res.status(204).send();
  } catch (err) {
    console.error("[Users DELETE /me]", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
