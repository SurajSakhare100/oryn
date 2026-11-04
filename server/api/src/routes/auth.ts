import { Router, Request, Response } from "express";
import passport from "../lib/passport";
import { signToken } from "../lib/jwt";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import jwt from "jsonwebtoken";
import { findOrCreateGoogleUser } from "../lib/googleAccount";

const router = Router();
const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v1/certs";
let googleCerts: Record<string, string> = {};
let googleCertsExpiresAt = 0;

async function getGoogleSigningCertificate(keyId: string, forceRefresh = false): Promise<string> {
  if (forceRefresh || Date.now() >= googleCertsExpiresAt || !googleCerts[keyId]) {
    const response = await fetch(GOOGLE_CERTS_URL, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("Could not retrieve Google signing certificates");
    const nextCerts = await response.json() as Record<string, string>;
    googleCerts = nextCerts;
    const cacheControl = response.headers.get("cache-control") || "";
    const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 3600);
    googleCertsExpiresAt = Date.now() + maxAge * 1000;
  }
  const certificate = googleCerts[keyId];
  if (!certificate) throw new Error("Unknown Google signing key");
  return certificate;
}

async function verifyGoogleCredential(credential: string) {
  const decoded = jwt.decode(credential, { complete: true });
  if (!decoded || typeof decoded.payload === "string" || !decoded.header.kid) {
    throw new Error("Invalid Google credential");
  }

  let certificate = await getGoogleSigningCertificate(decoded.header.kid);
  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(credential, certificate, {
      algorithms: ["RS256"],
      audience: config.GOOGLE_CLIENT_ID,
      issuer: ["accounts.google.com", "https://accounts.google.com"],
    });
  } catch (error) {
    // Refresh once in case Google rotated the signing key between requests.
    if (!(error instanceof jwt.JsonWebTokenError)) throw error;
    certificate = await getGoogleSigningCertificate(decoded.header.kid, true);
    payload = jwt.verify(credential, certificate, {
      algorithms: ["RS256"],
      audience: config.GOOGLE_CLIENT_ID,
      issuer: ["accounts.google.com", "https://accounts.google.com"],
    });
  }

  if (typeof payload === "string" || !payload.sub || !payload.email || payload.email_verified !== true) {
    throw new Error("Google account has no verified email address");
  }
  return payload;
}

/**
 * GET /api/auth/google/client-config
 * Provides the public OAuth client ID needed by Google Identity Services.
 */
router.get("/google/client-config", (_req, res) => {
  if (!config.GOOGLE_CLIENT_ID) {
    res.status(503).json({ error: "Google sign-in is not configured." });
    return;
  }
  res.json({ clientId: config.GOOGLE_CLIENT_ID });
});

/**
 * POST /api/auth/google/credential
 * Verifies a Google Identity Services credential and returns the Oryn JWT.
 */
router.post("/google/credential", async (req: Request, res: Response) => {
  const credential = req.body?.credential;
  if (typeof credential !== "string" || credential.length > 10_000) {
    res.status(400).json({ error: "A valid Google credential is required." });
    return;
  }
  if (!config.GOOGLE_CLIENT_ID) {
    res.status(503).json({ error: "Google sign-in is not configured." });
    return;
  }

  let googleProfile;
  try {
    googleProfile = await verifyGoogleCredential(credential);
  } catch (error) {
    console.warn("[Auth Google credential] Credential verification failed:", error);
    res.status(401).json({ error: "Google could not verify this sign-in. Please try again." });
    return;
  }

  try {
    const user = await findOrCreateGoogleUser({
      googleId: googleProfile.sub!,
      email: googleProfile.email!,
      displayName: typeof googleProfile.name === "string" ? googleProfile.name : googleProfile.email!.split("@")[0],
      avatarUrl: typeof googleProfile.picture === "string" ? googleProfile.picture : null,
    });
    const token = signToken({ sub: user.id, email: user.email, username: user.username });
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, avatarUrl: user.avatarUrl },
    });
  } catch (error) {
    console.error("[Auth Google credential] Account sign-in failed:", error);
    res.status(500).json({ error: "Could not complete sign-in. Please try again." });
  }
});

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
