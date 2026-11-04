import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { config } from "../config";
import { prisma } from "./prisma";
import { findOrCreateGoogleUser } from "./googleAccount";

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

        const user = await findOrCreateGoogleUser({
          googleId: profile.id,
          email,
          displayName: profile.displayName || profile.name?.givenName || email.split("@")[0],
          avatarUrl: profile.photos?.[0]?.value || null,
        });

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
