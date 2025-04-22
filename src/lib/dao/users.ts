import "server-only";

import { auth } from "@/auth";
import prisma from "@/lib/prisma/prisma";
import { redirect } from "next/navigation";
import { cache } from "react";

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
}

type SessionUser = {
  id: number;
  name: string;
  email: string;
  picture: string;
  subscription: string;
  freeMessages: number;
  customerId: string | null;
};

export const getUserIdFromSession = cache(async (): Promise<number> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return redirect("/login");
  }

  return parseInt(session.user.id);
});

export const getUserFromSession = cache(async (): Promise<SessionUser> => {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email || "",
    },
    select: {
      id: true,
      name: true,
      email: true,
      picture: true,
      subscription: true,
      freeMessages: true,
      customerId: true,
    },
  });

  if (!user) {
    return redirect("/login");
  }

  return user;
});

export async function saveUser(profile: {
  name: string;
  email: string;
  password?: string;
  picture: string;
}) {
  const user = await prisma.user.create({
    data: {
      name: profile.name,
      email: profile.email,
      password: profile.password,
      picture: profile.picture,
    },
  });

  return user;
}

export async function decrementFreeMessages(userId: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { freeMessages: { decrement: 1 } },
  });
}

export async function updateUserWithStripeCustomerId(userId: number, customerId: string) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      customerId,
    },
  });
}

export async function updateSubscription(userId: number, subscription: string) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      subscription,
    },
  });
}

export async function setFreeMessages(userId: number, freeMessages: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { freeMessages },
  });
}
