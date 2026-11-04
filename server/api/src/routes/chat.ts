import { Router, Request, Response } from "express";
import axios from "axios";
import { optionalAuth, AuthRequest } from "../middleware/auth";
import { config } from "../config";

const router = Router();

/**
 * POST /api/chat
 * Proxies the chat query to the FastAPI AI service.
 * Attaches the user ID from the JWT if present.
 */
router.post("/", optionalAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const body = req.body;

    // Forward user identity to FastAPI so it can link conversations
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authReq.currentUser) {
      headers["X-User-Id"] = authReq.currentUser.sub;
    }

    const aiResponse = await axios.post(
      `${config.AI_SERVICE_URL}/api/chat`,
      body,
      { headers, timeout: 120_000 }
    );

    res.status(aiResponse.status).json(aiResponse.data);
  } catch (err: any) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      console.error("[Chat proxy error]", err.message);
      res.status(503).json({ error: "AI service unavailable" });
    }
  }
});

/**
 * GET /api/chat/models
 * Proxies model list from FastAPI.
 */
router.get("/models", async (_req: Request, res: Response) => {
  try {
    const aiResponse = await axios.get(`${config.AI_SERVICE_URL}/api/chat/models`);
    res.json(aiResponse.data);
  } catch {
    res.status(503).json({ error: "AI service unavailable" });
  }
});

export default router;
