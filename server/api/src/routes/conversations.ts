import { Router, Request, Response } from "express";
import { requireAuth, optionalAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * GET /api/conversations
 * Get all conversations for the authenticated user.
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: authReq.currentUser!.sub },
      orderBy: { timestamp: "desc" },
      include: { messages: { orderBy: { timestamp: "asc" } } },
    });
    res.json(conversations);
  } catch (err) {
    console.error("[Conversations GET /]", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/**
 * GET /api/conversations/:id
 * Get a single conversation (validates ownership).
 */
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { timestamp: "asc" } } },
    });

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    if (conversation.userId && conversation.userId !== authReq.currentUser!.sub) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.json(conversation);
  } catch (err) {
    console.error("[Conversations GET /:id]", err);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

/**
 * POST /api/conversations
 * Create a new conversation (optionally linked to user).
 */
router.post("/", optionalAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { title } = req.body;
  const timestamp = new Date().toISOString();

  try {
    const conversation = await prisma.conversation.create({
      data: {
        id: uuidv4(),
        title: title || "New Conversation",
        timestamp,
        ...(authReq.currentUser ? { userId: authReq.currentUser.sub } : {}),
      },
    });
    res.status(201).json(conversation);
  } catch (err) {
    console.error("[Conversations POST /]", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

/**
 * PATCH /api/conversations/:id
 * Update conversation title.
 */
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const { title } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "title is required" });
    return;
  }

  try {
    const conversation = await prisma.conversation.findUnique({ where: { id } });

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    if (conversation.userId && conversation.userId !== authReq.currentUser!.sub) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: { title: title.trim() },
    });

    res.json(updated);
  } catch (err) {
    console.error("[Conversations PATCH /:id]", err);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation and all its messages (cascade).
 */
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  try {
    const conversation = await prisma.conversation.findUnique({ where: { id } });

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    if (conversation.userId && conversation.userId !== authReq.currentUser!.sub) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    await prisma.conversation.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error("[Conversations DELETE /:id]", err);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;
