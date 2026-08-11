"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: "/login" })}
      className="text-xs text-sidebar-muted transition hover:text-sidebar-foreground"
    >
      Log out
    </button>
  );
}
