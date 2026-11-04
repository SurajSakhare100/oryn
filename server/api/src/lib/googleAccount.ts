import { prisma } from "./prisma";

export interface GoogleAccountProfile {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export async function findOrCreateGoogleUser(profile: GoogleAccountProfile) {
  const { googleId, email, displayName, avatarUrl } = profile;
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatarUrl: avatarUrl ?? undefined },
      });
    } else {
      let username = displayName
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 24) || `user_${googleId.slice(-6)}`;

      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) username = `${username.slice(0, 24)}_${googleId.slice(-6)}`;

      user = await prisma.user.create({
        data: { email, username, googleId, avatarUrl: avatarUrl ?? undefined },
      });
    }
  } else if (avatarUrl && user.avatarUrl !== avatarUrl) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });
  }

  return user;
}
