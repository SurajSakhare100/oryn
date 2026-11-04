import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { prisma } from "../lib/prisma";
import { config } from "../config";

if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"));
        }

        const googleId = profile.id;
        const displayName =
          profile.displayName ||
          profile.name?.givenName ||
          email.split("@")[0];
        const avatarUrl = profile.photos?.[0]?.value || null;

        // Try to find user by googleId first, then by email
        let user = await prisma.user.findUnique({ where: { googleId } });

        if (!user) {
          // User might exist via another auth method (email) — link accounts
          user = await prisma.user.findUnique({ where: { email } });

          if (user) {
            // Link Google ID to existing account
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId,
                avatarUrl: avatarUrl ?? undefined,
              },
            });
          } else {
            // Brand new user — generate unique username from displayName
            let username = displayName
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, "_")
              .slice(0, 24);

            // Ensure uniqueness
            const existing = await prisma.user.findUnique({
              where: { username },
            });
            if (existing) {
              username = `${username}_${googleId.slice(-6)}`;
            }

            user = await prisma.user.create({
              data: {
                email,
                username,
                googleId,
                avatarUrl: avatarUrl ?? undefined,
              },
            });
          }
        } else if (avatarUrl && user.avatarUrl !== avatarUrl) {
          // Update avatar if changed
          user = await prisma.user.update({
            where: { id: user.id },
            data: { avatarUrl },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// Passport session serialization (minimal — we use JWT, not sessions)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
