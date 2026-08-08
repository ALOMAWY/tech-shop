"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export type LoginState = { error?: string } | undefined;

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: typeof next === "string" && next.startsWith("/") ? next : "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "login.error" };
    }
    if (
      error instanceof Error &&
      error.message.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return { error: "login.error" };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}