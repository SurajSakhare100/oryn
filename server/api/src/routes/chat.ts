import { Router, Request, Response } from "express";
import axios from "axios";
import { optionalAuth, AuthRequest } from "../middleware/auth";
import { config } from "../config";

const router = Router();

function forwardAiError(err: any, res: Response): void {
  if (err.response) {
    if (err.response.status === 401) {
      console.error("[AI service auth error] The AI service rejected the API gateway key.");
      res.status(503).json({
        error: "The AI service rejected its gateway credentials. Check that AI_SERVICE_TOKEN matches on both backend services.",
      });
      return;
    }
    res.status(err.response.status).json(err.response.data);
    return;
  }

  const timedOut = err.code === "ECONNABORTED" || err.code === "ETIMEDOUT";
  console.error("[AI service proxy error]", err.message);
  res.status(timedOut ? 504 : 503).json({
    error: timedOut
      ? "The AI service took too long to respond. Please try again."
      : "The AI service is temporarily unavailable. Please try again shortly.",
  });
}

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
    if (config.AI_SERVICE_TOKEN) headers["X-Oryn-API-Key"] = config.AI_SERVICE_TOKEN;

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
    forwardAiError(err, res);
  }
});

/**
 * GET /api/chat/models
 * Proxies model list from FastAPI.
 */
router.get("/models", async (_req: Request, res: Response) => {
  try {
    const aiResponse = await axios.get(`${config.AI_SERVICE_URL}/api/chat/models`, {
      headers: config.AI_SERVICE_TOKEN ? { "X-Oryn-API-Key": config.AI_SERVICE_TOKEN } : undefined,
      timeout: 10_000,
    });
    res.json(aiResponse.data);
  } catch (err: any) {
    forwardAiError(err, res);
  }
});

export default router;
